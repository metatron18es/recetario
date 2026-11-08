-- DropForeignKey
ALTER TABLE "receta" DROP CONSTRAINT "receta_usuario_id_fkey";

-- AlterTable
ALTER TABLE "ingrediente" ADD COLUMN     "propuesto_por_id" INTEGER,
ADD COLUMN     "validado" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "receta" ALTER COLUMN "usuario_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "usuario" ADD COLUMN     "rol" TEXT NOT NULL DEFAULT 'usuario';

-- AddForeignKey
ALTER TABLE "ingrediente" ADD CONSTRAINT "ingrediente_propuesto_por_id_fkey" FOREIGN KEY ("propuesto_por_id") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receta" ADD CONSTRAINT "receta_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
