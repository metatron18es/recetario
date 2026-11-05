-- CreateTable
CREATE TABLE "usuario" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preferencia_nutricional" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "tipo_dieta" TEXT NOT NULL,
    "objetivo_calorico_diario" INTEGER NOT NULL,

    CONSTRAINT "preferencia_nutricional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alergia" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "alergia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_alergia" (
    "usuario_id" INTEGER NOT NULL,
    "alergia_id" INTEGER NOT NULL,

    CONSTRAINT "usuario_alergia_pkey" PRIMARY KEY ("usuario_id","alergia_id")
);

-- CreateTable
CREATE TABLE "ingrediente" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "calorias_100g" INTEGER NOT NULL,

    CONSTRAINT "ingrediente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingrediente_alergia" (
    "ingrediente_id" INTEGER NOT NULL,
    "alergia_id" INTEGER NOT NULL,

    CONSTRAINT "ingrediente_alergia_pkey" PRIMARY KEY ("ingrediente_id","alergia_id")
);

-- CreateTable
CREATE TABLE "receta" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo_comida" TEXT NOT NULL,
    "tiempo_preparacion_min" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "receta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receta_ingrediente" (
    "receta_id" INTEGER NOT NULL,
    "ingrediente_id" INTEGER NOT NULL,
    "cantidad" DOUBLE PRECISION NOT NULL,
    "unidad" TEXT NOT NULL,

    CONSTRAINT "receta_ingrediente_pkey" PRIMARY KEY ("receta_id","ingrediente_id")
);

-- CreateTable
CREATE TABLE "paso_receta" (
    "id" SERIAL NOT NULL,
    "receta_id" INTEGER NOT NULL,
    "orden" INTEGER NOT NULL,
    "texto" TEXT NOT NULL,

    CONSTRAINT "paso_receta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendario_semanal" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendario_semanal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entrada_calendario" (
    "id" SERIAL NOT NULL,
    "calendario_id" INTEGER NOT NULL,
    "dia_semana" TEXT NOT NULL,
    "tipo_comida" TEXT NOT NULL,
    "receta_id" INTEGER,

    CONSTRAINT "entrada_calendario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "preferencia_nutricional_usuario_id_key" ON "preferencia_nutricional"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "alergia_nombre_key" ON "alergia"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "ingrediente_nombre_key" ON "ingrediente"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "paso_receta_receta_id_orden_key" ON "paso_receta"("receta_id", "orden");

-- CreateIndex
CREATE UNIQUE INDEX "entrada_calendario_calendario_id_dia_semana_tipo_comida_key" ON "entrada_calendario"("calendario_id", "dia_semana", "tipo_comida");

-- AddForeignKey
ALTER TABLE "preferencia_nutricional" ADD CONSTRAINT "preferencia_nutricional_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_alergia" ADD CONSTRAINT "usuario_alergia_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_alergia" ADD CONSTRAINT "usuario_alergia_alergia_id_fkey" FOREIGN KEY ("alergia_id") REFERENCES "alergia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingrediente_alergia" ADD CONSTRAINT "ingrediente_alergia_ingrediente_id_fkey" FOREIGN KEY ("ingrediente_id") REFERENCES "ingrediente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingrediente_alergia" ADD CONSTRAINT "ingrediente_alergia_alergia_id_fkey" FOREIGN KEY ("alergia_id") REFERENCES "alergia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receta" ADD CONSTRAINT "receta_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receta_ingrediente" ADD CONSTRAINT "receta_ingrediente_receta_id_fkey" FOREIGN KEY ("receta_id") REFERENCES "receta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receta_ingrediente" ADD CONSTRAINT "receta_ingrediente_ingrediente_id_fkey" FOREIGN KEY ("ingrediente_id") REFERENCES "ingrediente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paso_receta" ADD CONSTRAINT "paso_receta_receta_id_fkey" FOREIGN KEY ("receta_id") REFERENCES "receta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendario_semanal" ADD CONSTRAINT "calendario_semanal_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrada_calendario" ADD CONSTRAINT "entrada_calendario_calendario_id_fkey" FOREIGN KEY ("calendario_id") REFERENCES "calendario_semanal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrada_calendario" ADD CONSTRAINT "entrada_calendario_receta_id_fkey" FOREIGN KEY ("receta_id") REFERENCES "receta"("id") ON DELETE SET NULL ON UPDATE CASCADE;
