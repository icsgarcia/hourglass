-- AlterTable
ALTER TABLE "ClassroomInvitation" ALTER COLUMN "status" SET DEFAULT 'PENDING',
ALTER COLUMN "respondedAt" DROP NOT NULL;
