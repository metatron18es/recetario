-- CreateTable
CREATE TABLE "imagen_receta" (
    "id" SERIAL NOT NULL,
    "receta_id" INTEGER NOT NULL,
    "paso_id" INTEGER,
    "orden" INTEGER NOT NULL,
    "archivo" TEXT NOT NULL,

    CONSTRAINT "imagen_receta_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "imagen_receta" ADD CONSTRAINT "imagen_receta_receta_id_fkey" FOREIGN KEY ("receta_id") REFERENCES "receta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagen_receta" ADD CONSTRAINT "imagen_receta_paso_id_fkey" FOREIGN KEY ("paso_id") REFERENCES "paso_receta"("id") ON DELETE CASCADE ON UPDATE CASCADE;
