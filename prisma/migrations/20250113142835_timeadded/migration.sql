/*
  Warnings:

  - Added the required column `ido` to the `edzes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "edzes" ADD COLUMN     "ido" INTEGER NOT NULL;
