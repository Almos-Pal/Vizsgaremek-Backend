-- CreateTable
CREATE TABLE "user" (
    "user_id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "edzesterv" (
    "edzesterv_id" SERIAL NOT NULL,
    "edzesterv_neve" TEXT NOT NULL,
    "napokszama" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "edzesterv_pkey" PRIMARY KEY ("edzesterv_id")
);

-- CreateTable
CREATE TABLE "edzes" (
    "edzes_id" SERIAL NOT NULL,
    "edzes_neve" TEXT NOT NULL,
    "datum" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "edzes_pkey" PRIMARY KEY ("edzes_id")
);

-- CreateTable
CREATE TABLE "Edzesterv_Edzes" (
    "edzesterv_id" INTEGER NOT NULL,
    "edzes_id" INTEGER NOT NULL,

    CONSTRAINT "Edzesterv_Edzes_pkey" PRIMARY KEY ("edzesterv_id","edzes_id")
);

-- CreateTable
CREATE TABLE "gyakorlat" (
    "gyakorlat_id" SERIAL NOT NULL,
    "gyakorlat_neve" TEXT NOT NULL,
    "personal_best" INTEGER,
    "eszkoz" TEXT,
    "gyakorlat_leiras" TEXT,

    CONSTRAINT "gyakorlat_pkey" PRIMARY KEY ("gyakorlat_id")
);

-- CreateTable
CREATE TABLE "Edzes_Gyakorlat" (
    "edzes_id" INTEGER NOT NULL,
    "gyakorlat_id" INTEGER NOT NULL,

    CONSTRAINT "Edzes_Gyakorlat_pkey" PRIMARY KEY ("edzes_id","gyakorlat_id")
);

-- CreateTable
CREATE TABLE "izomcsoport" (
    "izomcsoport_id" SERIAL NOT NULL,
    "nev" TEXT NOT NULL,

    CONSTRAINT "izomcsoport_pkey" PRIMARY KEY ("izomcsoport_id")
);

-- CreateTable
CREATE TABLE "Gyakorlat_Izomcsoport" (
    "gyakorlat_id" INTEGER NOT NULL,
    "izomcsoport_id" INTEGER NOT NULL,

    CONSTRAINT "Gyakorlat_Izomcsoport_pkey" PRIMARY KEY ("gyakorlat_id","izomcsoport_id")
);

-- CreateTable
CREATE TABLE "set" (
    "set_id" SERIAL NOT NULL,
    "ismetles" INTEGER NOT NULL,
    "suly" DOUBLE PRECISION NOT NULL,
    "gyakorlat_id" INTEGER NOT NULL,

    CONSTRAINT "set_pkey" PRIMARY KEY ("set_id")
);

-- CreateTable
CREATE TABLE "cardio" (
    "cardio_id" SERIAL NOT NULL,
    "kardio_tipusa" TEXT NOT NULL,
    "kaloria" INTEGER,
    "ido" INTEGER NOT NULL,

    CONSTRAINT "cardio_pkey" PRIMARY KEY ("cardio_id")
);

-- CreateTable
CREATE TABLE "Edzes_Cardio" (
    "edzes_id" INTEGER NOT NULL,
    "cardio_id" INTEGER NOT NULL,

    CONSTRAINT "Edzes_Cardio_pkey" PRIMARY KEY ("edzes_id","cardio_id")
);

-- AddForeignKey
ALTER TABLE "edzesterv" ADD CONSTRAINT "edzesterv_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "edzes" ADD CONSTRAINT "edzes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edzesterv_Edzes" ADD CONSTRAINT "Edzesterv_Edzes_edzesterv_id_fkey" FOREIGN KEY ("edzesterv_id") REFERENCES "edzesterv"("edzesterv_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edzesterv_Edzes" ADD CONSTRAINT "Edzesterv_Edzes_edzes_id_fkey" FOREIGN KEY ("edzes_id") REFERENCES "edzes"("edzes_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edzes_Gyakorlat" ADD CONSTRAINT "Edzes_Gyakorlat_edzes_id_fkey" FOREIGN KEY ("edzes_id") REFERENCES "edzes"("edzes_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edzes_Gyakorlat" ADD CONSTRAINT "Edzes_Gyakorlat_gyakorlat_id_fkey" FOREIGN KEY ("gyakorlat_id") REFERENCES "gyakorlat"("gyakorlat_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gyakorlat_Izomcsoport" ADD CONSTRAINT "Gyakorlat_Izomcsoport_gyakorlat_id_fkey" FOREIGN KEY ("gyakorlat_id") REFERENCES "gyakorlat"("gyakorlat_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gyakorlat_Izomcsoport" ADD CONSTRAINT "Gyakorlat_Izomcsoport_izomcsoport_id_fkey" FOREIGN KEY ("izomcsoport_id") REFERENCES "izomcsoport"("izomcsoport_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "set" ADD CONSTRAINT "set_gyakorlat_id_fkey" FOREIGN KEY ("gyakorlat_id") REFERENCES "gyakorlat"("gyakorlat_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edzes_Cardio" ADD CONSTRAINT "Edzes_Cardio_edzes_id_fkey" FOREIGN KEY ("edzes_id") REFERENCES "edzes"("edzes_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edzes_Cardio" ADD CONSTRAINT "Edzes_Cardio_cardio_id_fkey" FOREIGN KEY ("cardio_id") REFERENCES "cardio"("cardio_id") ON DELETE RESTRICT ON UPDATE CASCADE;
