-- CreateEnum
CREATE TYPE "SLOType" AS ENUM ('EMISI', 'AIR_LIMBAH');

-- CreateEnum
CREATE TYPE "SLOStatus" AS ENUM ('SUBMITTED', 'VERIFICATION', 'INCOMPLETE_REQUIREMENTS', 'COMPLETE_REQUIREMENTS', 'FIELD_VERIFICATION_SCHEDULED', 'FIELD_VERIFICATION_COMPLETED', 'REVISION_SUBMITTED', 'REVISION_REVIEW', 'REVISION_REJECTED', 'REVISION_APPROVED', 'SLO_ISSUED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SLODocumentType" AS ENUM ('PERSYARATAN', 'REVISI', 'SURAT_UNDANGAN_VERIFIKASI', 'SLO_FINAL');

-- CreateEnum
CREATE TYPE "SLORequirementFeedbackType" AS ENUM ('DOK_PERIZINAN_BERUSAHA', 'PERSETUJUAN_LINGKUNGAN', 'PERSETUJUAN_TEKNIS', 'HASIL_PEMANTAUAN_EMISI', 'SERTIFIKAT_REGISTRASI_LAB', 'DOKUMEN_REVISI', 'OTHER');

-- CreateTable
CREATE TABLE "SLO" (
    "id" TEXT NOT NULL,
    "sloNumber" TEXT,
    "userId" TEXT NOT NULL,
    "type" "SLOType" NOT NULL,
    "status" "SLOStatus" NOT NULL DEFAULT 'SUBMITTED',
    "company" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "notes" TEXT,
    "adminNotes" TEXT,
    "feedbackToUser" TEXT,
    "verifikasiDate" TIMESTAMP(3),
    "verifikasiLocation" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SLO_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SLODocument" (
    "id" TEXT NOT NULL,
    "sloId" TEXT NOT NULL,
    "type" "SLODocumentType" NOT NULL,
    "expired" BOOLEAN NOT NULL DEFAULT false,
    "filename" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,

    CONSTRAINT "SLODocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SLOStatusHistory" (
    "id" TEXT NOT NULL,
    "sloId" TEXT NOT NULL,
    "status" "SLOStatus" NOT NULL,
    "notes" TEXT,
    "changedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SLOStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SLORequirementFeedback" (
    "id" TEXT NOT NULL,
    "sloId" TEXT NOT NULL,
    "statusHistoryId" TEXT NOT NULL,
    "documentId" TEXT,
    "requirementType" "SLORequirementFeedbackType" NOT NULL,
    "feedbackText" TEXT NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SLORequirementFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SLO_userId_idx" ON "SLO"("userId");

-- CreateIndex
CREATE INDEX "SLO_type_idx" ON "SLO"("type");

-- CreateIndex
CREATE INDEX "SLO_status_idx" ON "SLO"("status");

-- CreateIndex
CREATE INDEX "SLODocument_sloId_idx" ON "SLODocument"("sloId");

-- CreateIndex
CREATE INDEX "SLODocument_type_idx" ON "SLODocument"("type");

-- CreateIndex
CREATE INDEX "SLOStatusHistory_sloId_idx" ON "SLOStatusHistory"("sloId");

-- CreateIndex
CREATE INDEX "SLORequirementFeedback_sloId_idx" ON "SLORequirementFeedback"("sloId");

-- CreateIndex
CREATE INDEX "SLORequirementFeedback_statusHistoryId_idx" ON "SLORequirementFeedback"("statusHistoryId");

-- CreateIndex
CREATE INDEX "SLORequirementFeedback_documentId_idx" ON "SLORequirementFeedback"("documentId");

-- AddForeignKey
ALTER TABLE "SLO" ADD CONSTRAINT "SLO_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SLODocument" ADD CONSTRAINT "SLODocument_sloId_fkey" FOREIGN KEY ("sloId") REFERENCES "SLO"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SLOStatusHistory" ADD CONSTRAINT "SLOStatusHistory_sloId_fkey" FOREIGN KEY ("sloId") REFERENCES "SLO"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SLORequirementFeedback" ADD CONSTRAINT "SLORequirementFeedback_sloId_fkey" FOREIGN KEY ("sloId") REFERENCES "SLO"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SLORequirementFeedback" ADD CONSTRAINT "SLORequirementFeedback_statusHistoryId_fkey" FOREIGN KEY ("statusHistoryId") REFERENCES "SLOStatusHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SLORequirementFeedback" ADD CONSTRAINT "SLORequirementFeedback_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "SLODocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;
