# Recetario — Decisiones del proyecto

_Última actualización: 8 nov 2026. Documento de contexto del proyecto (decisiones de producto, datos y arquitectura)._

## Resumen

Recetario es una app de planificación de recetas y menús semanales (TFG/proyecto DAW). Este documento recoge las decisiones de arquitectura, stack y producto ya tomadas durante el desarrollo del esqueleto con Claude Code, para poder retomar el trabajo en otra herramienta (orca) sin perder contexto.

Estado actual (8 nov 2026): esqueleto desplegado de extremo a extremo — frontend en Vercel, API Express en Vercel y PostgreSQL en Neon, con CI en GitHub Actions y trabajo por rama y pull request. La API solo expone comprobaciones de salud (`/api/health` y `/api/health/db`); la funcionalidad (autenticación, recetas, preferencias, motor de reglas) se implementa en la fase de prototipo. El prototipo visual del frontend (componentes, vistas con datos de ejemplo, Storybook) está pendiente de incorporarse al repositorio por PRs; las secciones de más abajo sobre estructura del frontend, diseño visual, rutas y funcionalidades describen ese prototipo.

## Stack tecnológico

| Capa | Elección | Notas |
| --- | --- | --- |
| Frontend | Vue 3 + TypeScript (`<script setup>`) | Vite como bundler/dev server |
| Routing | Vue Router 4 | Rutas anidadas, props por parámetro dinámico |
| Estado | Pinia | Store único `recetario` con datos de ejemplo |
| Backend | Express + TypeScript | `tsx watch` en dev, compila con `tsc` |
| ORM | Prisma | `schema.prisma` + migraciones versionadas |
| Base de datos | PostgreSQL 16 (Docker) | Contenedor local `recetario-db` |
| Auth (prevista, no cableada) | JWT (`jsonwebtoken`) + `bcrypt` | Dependencias instaladas, sin endpoints aún |
| Validación (prevista) | Zod | Instalada, no usada todavía en las rutas |
| Testing backend | Vitest + Supertest | Un test de humo sobre `/api/health` |

No se han añadido dependencias nuevas de las ya decididas en la memoria del proyecto; imágenes de receta/paso se manejan como *data URLs* en el cliente (sin backend de almacenamiento/subida de ficheros).

## Puertos y entorno local

| Servicio | Puerto | Motivo |
| --- | --- | --- |
| Frontend (Vite) | 5174 | 5173 ya ocupado por otro proyecto local (opositatest) |
| Backend (Express) | 3001 | 3000 ya ocupado por opositatest |
| PostgreSQL (Docker) | 5434 → 5432 | 5432 ya ocupado por opositatest |

Credenciales de desarrollo (Docker Compose, solo local): usuario `recetario`, contraseña `recetario`, base de datos `recetario`, contenedor `recetario-db`.

## Estructura del repo

```
recetario/
├─ frontend/          Vue 3 + Vite
│  ├─ src/views/       7 pantallas (recetas, detalle, crear/editar, calendario, lista de la compra, perfil, login)
│  ├─ src/layouts/     AppShell.vue (nav + estado de conexión con la API)
│  ├─ src/stores/      recetario.ts (Pinia, datos de ejemplo)
│  ├─ src/router/      rutas (ver sección Rutas)
│  └─ src/assets/recipes/  ilustraciones SVG propias (sin descargas externas)
├─ backend/           Express + TypeScript
│  ├─ src/app.ts, src/index.ts
│  ├─ src/routes/health.ts
│  ├─ prisma/schema.prisma + prisma/migrations/
│  └─ docker-compose.yml  (servicio `db`, Postgres 16)
└─ docs/ y PDFs de la memoria académica (planificación, ER, tecnologías)
```

## Modelo de datos

Schema Prisma ya migrado a Postgres (12 tablas), fiel al ER de la memoria académica con una excepción:

| Entidad | Notas |
| --- | --- |
| `Usuario` | email único, `passwordHash`, `rol` (`usuario` o `admin`), relación 1:1 con `PreferenciaNutricional` |
| `PreferenciaNutricional` | tipo de dieta + objetivo calórico diario |
| `Alergia` / `UsuarioAlergia` / `IngredienteAlergia` | tablas puente (PK compuesta) |
| `Ingrediente` | catálogo con calorías por 100g; `validado` y `propuestoPorId` (los propone un usuario, los valida el administrador) |
| `Receta` / `RecetaIngrediente` | receta pública con autor (`usuarioId` opcional: `onDelete: SetNull`); ingredientes con cantidad + unidad |
| `PasoReceta` **(añadida, no estaba en el ER original)** | pasos de preparación como filas (`orden` + `texto`) en vez de texto libre multilínea en `Receta` |
| `CalendarioSemanal` / `EntradaCalendario` | planificación semanal; `recetaId` nulable (`onDelete: SetNull`) |

La lista de la compra **no es una tabla**: se calcula en el frontend sumando `RecetaIngrediente` de las recetas programadas en el calendario (getter derivado en Pinia).

Las imágenes (de receta y de cada paso) viven solo en el frontend (mock, `string[]` de data URLs) — el schema de backend todavía no tiene columnas de imagen; es una decisión pendiente para el prototipo real (¿tabla de assets, o campo URL tras subir a almacenamiento?).

## Reglas de negocio: recetas e ingredientes (decididas el 8 nov 2026)

- **Las recetas son públicas.** Todas las recetas son visibles para todos los usuarios; no existen recetas privadas. Se guarda quién la sube (`Receta.usuarioId`) y el listado debe poder filtrar por «Mis recetas».
- **Solo el autor edita** su receta. **Los usuarios no pueden borrar recetas**: solo el administrador. Al borrarla, desaparece para todos y las celdas de calendario que la usaban quedan vacías (`EntradaCalendario.recetaId` con `onDelete: SetNull`).
- **Si un usuario se da de baja, sus recetas se conservan** (el autor queda vacío: `usuarioId` con `onDelete: SetNull`).
- **Ingredientes nuevos:** un usuario puede proponerlos al crear una receta; entran con `validado = false` y no se ofrecen al motor de reglas hasta que el administrador los valida. El administrador los valida desde un panel de administración que se construirá más adelante.
- **Rol de administrador:** `Usuario.rol = 'admin'`. Hay un único administrador (el autor del proyecto).
- **Tipos de comida:** desayuno, almuerzo, comida, merienda y cena (5 por día, 35 celdas por semana). No se usa «snack», que no es un término de uso en España. `tipo_comida` es texto libre en el esquema; la lista cerrada se valida en el backend.

## Diseño visual

Se exploraron 14 direcciones de arte distintas en un canvas de diseño; tras iterar, el usuario eligió:

- **Diseño 1 — "Editorial cálido"**: el implementado en código. Tipografía Fraunces (títulos) + Inter (cuerpo), paleta cálida/tierra (`--terracotta`, `--sage`, `--cream`, `--green-dark`), chips redondeados, cards con foto real.
- **Diseño 10 — "Cocina Clay"** y **Diseño 14 — "Tablero de corcho"**: aprobados como alternativas, pulidos (grids responsive, accesibilidad), guardados como artefacto pero **no implementados en código**.
- Las otras 9 propuestas se archivaron en un artefacto aparte ("desechadas") por si se reutilizan más adelante.

La elección de Fraunces/Inter es deliberada (no un default genérico de IA) y está registrada como excepción sancionada en `.impeccable/config.json` del repo.

## Rutas y pantallas

| Ruta | Vista | Notas |
| --- | --- | --- |
| `/login` | `LoginView` | Toggle login/registro, sin auth real aún |
| `/recetas` | `RecetasView` | Grid de recetas, búsqueda + filtro por tipo |
| `/recetas/nueva` | `CrearRecetaView` | Alta de receta |
| `/recetas/:id` | `DetalleRecetaView` | Galería de fotos, pasos, ingredientes, alerta de alérgenos (simulada) |
| `/recetas/:id/editar` | `CrearRecetaView` (`editId` prop) | Mismo formulario que alta, precargado |
| `/calendario` | `CalendarioView` | Grid semanal, "Generar automáticamente" (aleatorio, de momento) |
| `/lista-compra` | `ListaCompraView` | Derivada del calendario, agrupada por categoría |
| `/perfil` | `PerfilView` | Preferencias nutricionales + alérgenos del usuario |

Todas menos `/login` cuelgan del layout `AppShell` (nav superior + badge de estado de la API).

## Funcionalidades implementadas (sobre datos de ejemplo)

- CRUD de recetas en memoria (crear, editar; sin borrar aún), con validación mínima de formulario.
- Autocompletar de ingredientes del catálogo + opción de "proponer ingrediente nuevo" (pendiente de validación).
- Selector de unidad por ingrediente (g, kg, ml, l, unidad, cucharada, cucharadita, pizca).
- Varias fotos por receta (galería con miniaturas en el detalle) y varias fotos opcionales por paso de preparación; todo vía `FileReader` + data URL, sin subida a servidor.
- Calendario semanal con asignación manual o generación aleatoria por tipo de comida (el motor de reglas real —filtrado por dieta/alergias/objetivo calórico— queda pendiente).
- Lista de la compra derivada automáticamente del calendario, agrupada por categoría, con checkboxes de "comprado".
- Gestión de alérgenos del usuario y preferencias nutricionales (perfil).
- Conectividad real frontend↔backend: badge de estado en la nav que hace ping a `/api/health`.
- Backend con Postgres real migrado (Prisma), pero sin endpoints de negocio todavía; solo el health-check.
- Test automatizado (Vitest + Supertest) del health-check, en verde.

## Pendiente (fase "Prototipo" del roadmap académico)

- Al incorporar el prototipo del frontend, sustituir «Snack» por «Almuerzo» y «Merienda» (tipos de comida, filtros, calendario de 5 filas, datos de ejemplo y generación automática).
- Autenticación real: endpoints de registro/login, JWT + bcrypt contra la tabla `Usuario`, con el rol de administrador.
- Panel de administración (fase futura): validar ingredientes propuestos y borrar recetas.
- CRUD real contra Postgres (recetas, calendario, preferencias, alérgenos) sustituyendo el store mock de Pinia.
- Motor de reglas real para "Generar automáticamente" el calendario (filtra por dieta, alergias y objetivo calórico; hoy es aleatorio).
- Validación de entrada en el backend con Zod (ya instalado, sin usar).
- Decidir estrategia de almacenamiento de imágenes para el prototipo real (hoy son data URLs solo en el frontend, no persisten en servidor).

## Comandos para levantar el entorno

```bash
# Todo de una vez (base de datos, API y app); más detalles en el README
make dev

# O por separado:
# Base de datos
cd backend && docker compose up -d

# Backend (http://localhost:3001)
cd backend && npm run dev

# Frontend (http://localhost:5174)
cd frontend && npm run dev

# Migraciones Prisma
cd backend && npm run prisma:migrate

# Tests backend
cd backend && npm test
```

`backend/.env` se crea copiando `backend/.env.example` (no se versiona). Variables clave: `DATABASE_URL`, `FRONTEND_ORIGIN`, `JWT_SECRET`, `PORT`.

## Registro de decisiones (3 nov 2026)

La sesión de revisión fijó ocho decisiones; lo aparcado no está descartado.

| Decisión | Motivo | Estado |
| --- | --- | --- |
| Dieta por ingrediente (opción A): campo `Ingrediente.dietaMinima` y dieta de receta derivada | La dieta de la receta se calcula de sus ingredientes y no puede desincronizarse; el flujo funcional pregunta "¿cumple la dieta?" y el modelo no lo permitía | Hecho: schema, migración y store (`dietaDeReceta`) |
| Componentes por carpetas: `ui/`, `layout/`, `alergias/`, `recetas/` | Con ~17 componentes, agrupar por rol facilita encontrarlos y defender el código | Hecho |
| Primero primitivas de UI, luego componentes de dominio | Las primitivas eliminan la duplicación de estilos de las 8 vistas | Hecho |
| Actualizar solo el diagrama ER; arquitectura y flujo siguen vigentes | Solo el ER difería del código | Hecho: SVG/PNG y PDF `Recetario_Entrega2_..._actualizado.pdf` (originales intactos) |
| Identidad Git: `metatron18es <metatron18es@gmail.com>` para todo `~/Repos/Curso/` | Los commits deben salir con esa cuenta; `includeIf` lo aplica por carpeta | Hecho; alias `git metatron` / `git trabajo` para cambiar a mano |
| Commits sin ninguna atribución a Claude; PDFs fuera de Git (`*.pdf` en `.gitignore`) | Regla del usuario; la guía y las memorias no son código | Hecho: 9 commits locales |
| Push por HTTPS con `gh auth switch --user metatron18es`, sin cambiar `origin` | La clave SSH de la máquina autentica como `robertodelacasa-opositatest` y no tiene permiso en el repo | Pendiente: el push por SSH falló con esa cuenta |
| Aparcar riesgos, funcionalidad pendiente y bugs del análisis | El usuario pidió centrarse en calidad del código, memoria y defensa | Aparcado (ver Backlog) |

## Documentación oficial a seguir

La entrega debe cumplir la guía FPD y la memoria ya entregada; ambas condicionan el orden de trabajo.

- **Guía FPD (LOOIFP):** nota = memoria 20 % + código 50 % + defensa 30 %. Suspenso inmediato si el software no funciona en la demo, por plagio, o por no declarar el uso de IA (sección "Uso de herramientas generativas" en la memoria; hay que poder explicar el 100 % del código).
- **Memoria técnica:** 25–40 páginas, Calibri 12, interlineado sencillo, justificado, márgenes de 2,5 cm, un solo PDF de máximo 10 MB con enlaces al repositorio y a producción en la primera página.
- **Defensa:** 15 minutos de exposición y 5 de preguntas, con datos de prueba realistas y copia local de respaldo.
- **Compromisos de la memoria aún sin cumplir en el repo:** despliegue en Vercel + Neon, CI con GitHub Actions (lint + tests), ramas `feature/us-XX`, PRs, issues y tablero Kanban.
- **Calendario:** Prototipo 9 nov – 6 dic; Cierre, calidad y despliegue 7 dic – 10 ene; defensa 11 – 18 ene.
- **Flujo funcional del motor de reglas:** cargar preferencias y alergias, filtrar por dieta y alérgenos, agrupar por tipo de comida, asignar 7 × 4 celdas, comprobar calorías diarias en ±10 % del objetivo, guardar `EntradaCalendario`.

## Modelo de datos: cambios sobre el ER original

El ER de la memoria pasa de 10 a 11 entidades; el diagrama y el PDF ya lo reflejan, pero el texto de la memoria final debe mencionarlo.

| Cambio | Motivo |
| --- | --- |
| Tabla `PasoReceta` (orden + texto) | Pasos como filas en vez de texto libre multilínea |
| `Receta.descripcion` | Texto del detalle de receta |
| `Usuario.creado_en` | Auditoría básica |
| `Ingrediente.dieta_minima` | Dieta más restrictiva que admite: Vegana < Vegetariana < Pescetariana < Omnívora; por defecto Omnívora, para no ofrecer el ingrediente a dietas restrictivas por error |

## Frontend: estructura de componentes

Las vistas bajan de 2.109 a unas 1.600 líneas (`CrearRecetaView` de 724 a 170) al apoyarse en componentes.

```
src/components/
├─ ui/        BaseButton, BaseCard, BaseChip, BaseInput, BaseSelect, BaseTextarea
├─ layout/    PageHeader, BackLink, SectionHeader
├─ alergias/  AlergiaSelector, AlertaAlergenos
└─ recetas/   RecetaCard, FotosReceta, IngredientesEditor, PasosEditor, ImagenQuitable, filaIngrediente.ts
src/lib/      api.ts, imagenes.ts (lectura de fotos como data URL)
```

- `BaseButton` tiene variantes `primary`, `secondary`, `ghost`, `link` e `icon`, y se convierte en enlace con la prop `to`.
- `BaseInput`, `BaseSelect` y `BaseTextarea` aceptan etiqueta opcional, usan `v-model` y pasan `class` al contenedor.
- Los editores (`FotosReceta`, `IngredientesEditor`, `PasosEditor`) usan `v-model` y llevan sus propios estilos.
- En `main.css` quedan solo `.page`, `.empty` y `.sr-only` como estilos compartidos.
- La tarjeta de Login no usa `BaseCard`: es más grande y con sombra.
- Cambios visuales menores: espacio entre bloques unificado en 26 px y etiquetas en negrita 700.

## Backlog pendiente

**Calidad del código (en alcance):**

- Dividir el store (`types/`, `data/`, stores por dominio) y añadir una capa `api/`.
- Tests en el frontend con Vitest, empezando por lista de la compra y alérgenos.
- ESLint y Prettier; seguridad OWASP (Zod, rate limit, helmet, CORS acotado).
- Accesibilidad (`aria-label`, `aria-pressed`), página 404, títulos de ruta y errores de red.

**Memoria y defensa (en alcance):** reflejar `PasoReceta`, `dietaMinima` y `descripcion` en el texto; apartados que faltan (requisitos, pruebas y despliegue, conclusiones, bibliografía APA 7); sección de uso de IA; datos de prueba realistas; ensayo cronometrado.

**Aparcado por decisión del usuario:**

- Riesgos: despliegue en Vercel + Neon sin probar, flujo Git y CI, declaración de uso de IA.
- Funcionalidad: autenticación, CRUD real, motor de reglas con límite de reintentos, calorías calculadas desde ingredientes, almacenamiento de imágenes.
- Bugs: la lista de la compra pierde cantidad si el mismo ingrediente aparece con unidades distintas; `anadirReceta` genera id `-Infinity` sin recetas; el buscador dice "o ingrediente" pero solo busca por nombre; los alérgenos marcados al crear una receta no se guardan; `comprados` es un `Set` dentro de Pinia.
