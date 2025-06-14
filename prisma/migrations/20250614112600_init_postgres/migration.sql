-- CreateEnum
CREATE TYPE "PertekType" AS ENUM ('EMISI', 'AIR_LIMBAH');

-- CreateEnum
CREATE TYPE "PertekStatus" AS ENUM ('SUBMITTED', 'VERIFICATION', 'INCOMPLETE_REQUIREMENTS', 'COMPLETE_REQUIREMENTS', 'SCHEDULED_PAPARAN', 'PAPARAN_COMPLETED', 'REVISION_SUBMITTED', 'REVISION_REVIEW', 'REVISION_REJECTED', 'REVISION_APPROVED', 'PERTEK_ISSUED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PertekDocumentType" AS ENUM ('PERSYARATAN', 'REVISI', 'SURAT_UNDANGAN_PAPARAN', 'PERTEK_FINAL');

-- CreateEnum
CREATE TYPE "RequirementFeedbackType" AS ENUM ('SURAT_PERMOHONAN', 'DOKUMEN_AMDAL_UKL_UPL', 'DOKUMEN_TEKNIS', 'DOKUMEN_REVISI', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "username" TEXT,
    "instansi" TEXT,
    "nomorHp" TEXT,
    "role" TEXT NOT NULL DEFAULT 'visitor',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueueItem" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "processAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "error" TEXT,

    CONSTRAINT "QueueItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pertek" (
    "id" TEXT NOT NULL,
    "pertekNumber" TEXT,
    "userId" TEXT NOT NULL,
    "type" "PertekType" NOT NULL,
    "status" "PertekStatus" NOT NULL DEFAULT 'SUBMITTED',
    "company" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "notes" TEXT,
    "adminNotes" TEXT,
    "feedbackToUser" TEXT,
    "paparanDate" TIMESTAMP(3),
    "paparanLocation" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pertek_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PertekDocument" (
    "id" TEXT NOT NULL,
    "pertekId" TEXT NOT NULL,
    "type" "PertekDocumentType" NOT NULL,
    "filename" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,

    CONSTRAINT "PertekDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PertekStatusHistory" (
    "id" TEXT NOT NULL,
    "pertekId" TEXT NOT NULL,
    "status" "PertekStatus" NOT NULL,
    "notes" TEXT,
    "changedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PertekStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PertekRequirementFeedback" (
    "id" TEXT NOT NULL,
    "pertekId" TEXT NOT NULL,
    "statusHistoryId" TEXT NOT NULL,
    "documentId" TEXT,
    "requirementType" "RequirementFeedbackType" NOT NULL,
    "feedbackText" TEXT NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PertekRequirementFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_identifier_token_key" ON "PasswordResetToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "QueueItem_status_processAt_idx" ON "QueueItem"("status", "processAt");

-- CreateIndex
CREATE INDEX "Pertek_userId_idx" ON "Pertek"("userId");

-- CreateIndex
CREATE INDEX "Pertek_type_idx" ON "Pertek"("type");

-- CreateIndex
CREATE INDEX "Pertek_status_idx" ON "Pertek"("status");

-- CreateIndex
CREATE INDEX "PertekDocument_pertekId_idx" ON "PertekDocument"("pertekId");

-- CreateIndex
CREATE INDEX "PertekDocument_type_idx" ON "PertekDocument"("type");

-- CreateIndex
CREATE INDEX "PertekStatusHistory_pertekId_idx" ON "PertekStatusHistory"("pertekId");

-- CreateIndex
CREATE INDEX "PertekRequirementFeedback_pertekId_idx" ON "PertekRequirementFeedback"("pertekId");

-- CreateIndex
CREATE INDEX "PertekRequirementFeedback_statusHistoryId_idx" ON "PertekRequirementFeedback"("statusHistoryId");

-- CreateIndex
CREATE INDEX "PertekRequirementFeedback_documentId_idx" ON "PertekRequirementFeedback"("documentId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pertek" ADD CONSTRAINT "Pertek_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PertekDocument" ADD CONSTRAINT "PertekDocument_pertekId_fkey" FOREIGN KEY ("pertekId") REFERENCES "Pertek"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PertekStatusHistory" ADD CONSTRAINT "PertekStatusHistory_pertekId_fkey" FOREIGN KEY ("pertekId") REFERENCES "Pertek"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PertekRequirementFeedback" ADD CONSTRAINT "PertekRequirementFeedback_pertekId_fkey" FOREIGN KEY ("pertekId") REFERENCES "Pertek"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PertekRequirementFeedback" ADD CONSTRAINT "PertekRequirementFeedback_statusHistoryId_fkey" FOREIGN KEY ("statusHistoryId") REFERENCES "PertekStatusHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PertekRequirementFeedback" ADD CONSTRAINT "PertekRequirementFeedback_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "PertekDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;
