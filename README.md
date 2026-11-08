# Tupper

Aplicación web para guardar recetas, planificar la semana y generar la lista de la compra, ajustada a alergias, dieta y objetivo calórico. Proyecto intermodular de DAW.

## Flujo de trabajo

- Una rama por historia de usuario: `feature/us-XX-descripcion`, creada desde `main`.
- Commits pequeños y descriptivos.
- Integración en `main` mediante pull request que cierre su issue (`Closes #N`).
- `main` no recibe commits directos.

## Cómo arrancar

Requisitos: Node 22, Docker y un `backend/.env` (copia de `backend/.env.example`).

```bash
make install   # instala dependencias de backend y frontend
make dev       # base de datos (5434), API (3001) y app (5174)
make stop      # para la API y la app
make db-stop   # para la base de datos
```

Aplicación desplegada: https://recetario-ncgi.vercel.app (API: https://recetario-nine-sage.vercel.app/api/health).

Tupper es el nombre de la aplicación; Recetario es el nombre de trabajo del repositorio y de los servicios.
