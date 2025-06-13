/**
 * Simple in-memory queue implementation for background tasks
 */

// Generic task type definition
type QueueTask<T = any> = {
  id: string;
  type: string;
  data: T;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  process: (data: T) => Promise<any>;
};

class InMemoryQueue {
  private queue: QueueTask[] = [];
  private processing = false;
  private workers = 1;
  private activeWorkers = 0;
  private taskTypes: Record<string, (data: any) => Promise<any>> = {};

  constructor(workers = 1) {
    this.workers = workers;
    
    // Handle graceful shutdown
    process.on('SIGTERM', this.shutdown.bind(this));
    process.on('SIGINT', this.shutdown.bind(this));
  }

  /**
   * Register a task processor for a specific task type
   */
  registerTaskType(type: string, processor: (data: any) => Promise<any>) {
    this.taskTypes[type] = processor;
    console.log(`[Queue] Registered task processor for type: ${type}`);
    return this;
  }

  /**
   * Add a task to the queue
   */
  async add<T>(type: string, data: T, options: { maxAttempts?: number } = {}): Promise<string> {
    if (!this.taskTypes[type]) {
      throw new Error(`No processor registered for task type: ${type}`);
    }

    const id = crypto.randomUUID();
    const task: QueueTask = {
      id,
      type,
      data,
      attempts: 0,
      maxAttempts: options.maxAttempts || 3,
      createdAt: new Date(),
      process: this.taskTypes[type]
    };

    this.queue.push(task);
    console.log(`[Queue] Added task: ${id} of type: ${type}, queue size: ${this.queue.length}`);

    // Start processing if not already running
    if (!this.processing) {
      this.process();
    }

    return id;
  }

  /**
   * Process the queue
   */
  private async process(): Promise<void> {
    if (!this.processing) {
      this.processing = true;
      console.log('[Queue] Starting queue processing');
    }

    // Process while there are tasks and we have available workers
    while (this.queue.length > 0 && this.activeWorkers < this.workers) {
      this.activeWorkers++;
      
      // Get the next task
      const task = this.queue.shift();
      if (!task) {
        this.activeWorkers--;
        continue;
      }

      // Process the task asynchronously
      this.executeTask(task).finally(() => {
        this.activeWorkers--;
        
        // Continue processing if there are more tasks
        if (this.queue.length > 0) {
          this.process();
        } else if (this.activeWorkers === 0) {
          // No more tasks and no active workers
          this.processing = false;
          console.log('[Queue] Queue processing completed');
        }
      });
    }
  }

  /**
   * Execute a single task
   */
  private async executeTask(task: QueueTask): Promise<void> {
    console.log(`[Queue] Processing task: ${task.id} of type: ${task.type}, attempt: ${task.attempts + 1}/${task.maxAttempts}`);
    
    try {
      task.attempts++;
      await task.process(task.data);
      console.log(`[Queue] Task ${task.id} completed successfully`);
    } catch (error) {
      console.error(`[Queue] Task ${task.id} failed:`, error);
      
      // Retry if we haven't exceeded max attempts
      if (task.attempts < task.maxAttempts) {
        console.log(`[Queue] Retrying task ${task.id}, attempt ${task.attempts}/${task.maxAttempts}`);
        // Re-add to the end of the queue
        this.queue.push(task);
      } else {
        console.error(`[Queue] Task ${task.id} failed after ${task.attempts} attempts, giving up`);
        // Here you could implement a "dead letter queue" for failed tasks
      }
    }
  }

  /**
   * Get the current queue length
   */
  get size(): number {
    return this.queue.length;
  }

  /**
   * Handle graceful shutdown
   */
  private shutdown(): void {
    console.log('[Queue] Shutting down queue, remaining tasks:', this.queue.length);
    // In a production system, you might want to persist the queue to disk here
    process.exit(0);
  }
}

// Create and export the email queue instance
export const emailQueue = new InMemoryQueue(2) // 2 concurrent email sending workers
  .registerTaskType('verification-email', async (data) => {
    const { to, name, verificationLink } = data;
    // Import here to avoid circular dependency
    const { sendVerificationEmail } = await import('./email-utils');
    await sendVerificationEmail(to, name, verificationLink);
  })
  .registerTaskType('password-reset-email', async (data) => {
    const { to, name, resetLink } = data;
    // Import here to avoid circular dependency
    const { sendPasswordResetEmail } = await import('./email-utils');
    await sendPasswordResetEmail(to, name, resetLink);
  });

// Export the queue class in case other queues are needed
export { InMemoryQueue };
