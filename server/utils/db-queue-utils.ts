/**
 * Database-backed queue implementation with timer-based processing
 */

import prisma from '~/lib/prisma';

// Define queue processor type
type QueueProcessor<T = any> = (data: T) => Promise<void>;

// Task status enum
enum TaskStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

class DbQueue {
  private processors: Record<string, QueueProcessor<any>> = {};
  private isProcessing = false;
  private processInterval: NodeJS.Timeout | null = null;
  private rateLimit: number; // How many items to process per interval
  private intervalMs: number; // Interval in ms between processing batches

  constructor(opts: { 
    rateLimit?: number;
    intervalMs?: number;
    autoStart?: boolean;
  } = {}) {
    this.rateLimit = opts.rateLimit || 5; // Default: process 5 items per interval
    this.intervalMs = opts.intervalMs || 2000; // Default: 2 seconds between batches
    
    // Register shutdown handlers
    if (typeof process !== 'undefined') {
      process.on('SIGTERM', this.shutdown.bind(this));
      process.on('SIGINT', this.shutdown.bind(this));
    }

    // Auto-start processing
    if (opts.autoStart !== false) {
      this.start();
    }
  }

  /**
   * Register a processor function for a specific task type
   */
  registerProcessor<T>(type: string, processor: QueueProcessor<T>): DbQueue {
    // Type assertion to deal with the generic/specific type relationship
    this.processors[type] = processor as QueueProcessor<any>;
    console.log(`[DbQueue] Registered processor for task type: ${type}`);
    return this;
  }

  /**
   * Add a task to the queue
   */
  async add<T>(
    type: string, 
    data: T, 
    options: { 
      maxAttempts?: number;
      delaySeconds?: number;
    } = {}
  ): Promise<string> {
    if (!this.processors[type]) {
      console.warn(`[DbQueue] Warning: No processor registered for task type: ${type}`);
      // Continue anyway, as the processor might be registered later
    }

    // Calculate processAt time
    const processAt = options.delaySeconds 
      ? new Date(Date.now() + options.delaySeconds * 1000) 
      : new Date();
    
    // Save to database
    const queueItem = await prisma.queueItem.create({
      data: {
        type,
        status: TaskStatus.PENDING,
        data: JSON.stringify(data),
        maxAttempts: options.maxAttempts || 3,
        processAt,
      }
    });

    console.log(`[DbQueue] Added task ${queueItem.id} of type '${type}' to queue, processAt: ${processAt}`);
    return queueItem.id;
  }

  /**
   * Start the queue processor
   */
  start(): void {
    if (this.processInterval) {
      return; // Already running
    }

    console.log(`[DbQueue] Starting queue processor, interval: ${this.intervalMs}ms, rate limit: ${this.rateLimit} items/interval`);
    
    this.processInterval = setInterval(() => {
      if (!this.isProcessing) {
        this.processBatch().catch(err => {
          console.error('[DbQueue] Error in process batch:', err);
        });
      }
    }, this.intervalMs);
  }

  /**
   * Stop the queue processor
   */
  stop(): void {
    if (this.processInterval) {
      clearInterval(this.processInterval);
      this.processInterval = null;
      console.log('[DbQueue] Stopped queue processor');
    }
  }

  /**
   * Process a batch of items
   */
  private async processBatch(): Promise<void> {
    if (this.isProcessing) {
      return;
    }
    
    this.isProcessing = true;
    
    try {
      // Get pending items that are ready to process
      const items = await prisma.queueItem.findMany({
        where: {
          status: TaskStatus.PENDING,
          processAt: {
            lte: new Date() // Ready to process now
          }
        },
        orderBy: {
          processAt: 'asc' // Process oldest items first
        },
        take: this.rateLimit
      });
      
      if (items.length === 0) {
        // Nothing to process
        this.isProcessing = false;
        return;
      }
      
      console.log(`[DbQueue] Processing batch of ${items.length} items`);
      
      // Process items in parallel
      await Promise.all(
        items.map(item => this.processItem(item))
      );
      
    } catch (error) {
      console.error('[DbQueue] Error processing batch:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single queue item
   */
  private async processItem(item: any): Promise<void> {
    // Mark as processing
    await prisma.queueItem.update({
      where: { id: item.id },
      data: {
        status: TaskStatus.PROCESSING,
        attempts: { increment: 1 },
        updatedAt: new Date()
      }
    });

    console.log(`[DbQueue] Processing item ${item.id} of type '${item.type}', attempt ${item.attempts + 1}/${item.maxAttempts}`);

    try {
      const processor = this.processors[item.type];
      
      if (!processor) {
        throw new Error(`No processor registered for task type: ${item.type}`);
      }
      
      // Parse JSON data
      const data = JSON.parse(item.data);
      
      // Execute processor
      await processor(data);
      
      // Mark as completed
      await prisma.queueItem.update({
        where: { id: item.id },
        data: {
          status: TaskStatus.COMPLETED,
          completedAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      console.log(`[DbQueue] Item ${item.id} completed successfully`);
      
    } catch (error) {
      console.error(`[DbQueue] Error processing item ${item.id}:`, error);
      
      // Determine if we should retry
      if (item.attempts + 1 >= item.maxAttempts) {
        // Max attempts reached, mark as failed
        await prisma.queueItem.update({
          where: { id: item.id },
          data: {
            status: TaskStatus.FAILED,
            error: error instanceof Error ? error.message : String(error),
            updatedAt: new Date()
          }
        });
        console.log(`[DbQueue] Item ${item.id} failed after ${item.attempts + 1} attempts`);
      } else {
        // Schedule a retry with exponential backoff
        const backoffMinutes = Math.pow(2, item.attempts); // 1min, 2min, 4min, 8min...
        const nextAttemptAt = new Date();
        nextAttemptAt.setMinutes(nextAttemptAt.getMinutes() + backoffMinutes);
        
        await prisma.queueItem.update({
          where: { id: item.id },
          data: {
            status: TaskStatus.PENDING,
            processAt: nextAttemptAt,
            updatedAt: new Date(),
            error: error instanceof Error ? error.message : String(error)
          }
        });
        
        console.log(`[DbQueue] Item ${item.id} scheduled for retry at ${nextAttemptAt}, backoff: ${backoffMinutes} minutes`);
      }
    }
  }

  /**
   * Graceful shutdown
   */
  private async shutdown(): Promise<void> {
    console.log('[DbQueue] Shutting down queue');
    this.stop();
    
    // Cleanup processing items - mark them as pending so they'll be retried
    await prisma.queueItem.updateMany({
      where: { status: TaskStatus.PROCESSING },
      data: { status: TaskStatus.PENDING }
    });
    
    console.log('[DbQueue] Queue shutdown complete');
  }

  /**
   * Get queue statistics
   */
  async getStats(): Promise<{
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    total: number;
  }> {
    const counts = await Promise.all([
      prisma.queueItem.count({ where: { status: TaskStatus.PENDING } }),
      prisma.queueItem.count({ where: { status: TaskStatus.PROCESSING } }),
      prisma.queueItem.count({ where: { status: TaskStatus.COMPLETED } }),
      prisma.queueItem.count({ where: { status: TaskStatus.FAILED } })
    ]);
    
    return {
      pending: counts[0],
      processing: counts[1],
      completed: counts[2],
      failed: counts[3],
      total: counts.reduce((sum, count) => sum + count, 0)
    };
  }
}

// Initialize email queue with processors
export const dbEmailQueue = new DbQueue({
  rateLimit: 2,    // Process 5 emails per interval
  intervalMs: 1500 // Every 2 seconds
})
  .registerProcessor<{to: string; name: string; verificationLink: string}>('verification-email', async (data) => {
    const { to, name, verificationLink } = data;
    // Import here to avoid circular dependency
    const { sendVerificationEmail } = await import('./email-utils');
    await sendVerificationEmail(to, name, verificationLink);
  })
  .registerProcessor<{to: string; name: string; resetLink: string}>('password-reset-email', async (data) => {
    const { to, name, resetLink } = data;
    // Import here to avoid circular dependency
    const { sendPasswordResetEmail } = await import('./email-utils');
    await sendPasswordResetEmail(to, name, resetLink);
  });

// Export the queue class
export { DbQueue, TaskStatus };
