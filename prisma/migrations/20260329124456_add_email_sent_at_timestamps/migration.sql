-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "confirmationEmailSentAt" TIMESTAMP(3),
ADD COLUMN     "shippedEmailSentAt" TIMESTAMP(3);
