-- AlterTable
ALTER TABLE "users" ADD COLUMN     "reset_otp" TEXT,
ADD COLUMN     "reset_otp_expiry" TIMESTAMP(3),
ADD COLUMN     "reset_token" TEXT,
ADD COLUMN     "reset_token_expiry" TIMESTAMP(3);
