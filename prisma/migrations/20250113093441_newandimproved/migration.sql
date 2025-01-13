-- AlterTable
ALTER TABLE "gyakorlat" ADD COLUMN     "user_id" INTEGER;

-- CreateTable
CREATE TABLE "User_Gyakorlat" (
    "user_id" INTEGER NOT NULL,
    "gyakorlat_id" INTEGER NOT NULL,

    CONSTRAINT "User_Gyakorlat_pkey" PRIMARY KEY ("user_id","gyakorlat_id")
);

-- AddForeignKey
ALTER TABLE "User_Gyakorlat" ADD CONSTRAINT "User_Gyakorlat_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Gyakorlat" ADD CONSTRAINT "User_Gyakorlat_gyakorlat_id_fkey" FOREIGN KEY ("gyakorlat_id") REFERENCES "gyakorlat"("gyakorlat_id") ON DELETE RESTRICT ON UPDATE CASCADE;
