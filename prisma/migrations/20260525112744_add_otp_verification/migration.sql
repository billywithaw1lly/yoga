-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "otp_expiry" TIMESTAMP(3),
ADD COLUMN     "verification_otp" TEXT;
