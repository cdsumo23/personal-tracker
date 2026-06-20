-- AlterTable
ALTER TABLE "savings_goals" ADD COLUMN     "categoryId" TEXT;

-- CreateIndex
CREATE INDEX "savings_goals_categoryId_idx" ON "savings_goals"("categoryId");

-- AddForeignKey
ALTER TABLE "savings_goals" ADD CONSTRAINT "savings_goals_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
