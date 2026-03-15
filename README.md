# Despensa Inteligente

**TFG DAW — ThePower FP**
Autor: Jonathan Jiménez Salazar
Tutor: Ignacio Poveda Salinas

Aplicación web para gestionar el inventario de la despensa del hogar y reducir el desperdicio alimentario mediante alertas de caducidad y sugerencias de recetas con IA.

---

## Requisitos previos

- [Node.js 22 LTS](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

```bash
node -v   # debe mostrar v22.x.x
docker -v # cualquier versión reciente
```

---

## Opción A — Arranque automático (Mac / Linux)

```bash
git clone https://github.com/jonathanjs-daw-dev/tfg-despensa-inteligente.git
cd tfg-despensa-inteligente
./start.sh
```

El script crea los `.env`, arranca Docker, instala dependencias, ejecuta las migraciones y arranca ambos servidores automáticamente. Pulsa **Ctrl+C** para detenerlos todos a la vez.

---

## Opción B — Pasos manuales (Windows o preferencia manual)

### 1. Clonar el repositorio

```bash
git clone https://github.com/jonathanjs-daw-dev/tfg-despensa-inteligente.git
cd tfg-despensa-inteligente
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Los valores por defecto funcionan directamente en local sin modificación.

### 4. Levantar la base de datos

```bash
docker-compose up -d
```

Verificar que está corriendo:

```bash
docker ps   # debe aparecer despensa_db con estado Up
```

### 5. Crear las tablas en la base de datos

```bash
cd backend
npx prisma migrate deploy
cd ..
```

### 6. Arrancar el backend (terminal 1)

```bash
npm run dev:backend
```

El backend queda corriendo en `http://localhost:3000`

### 7. Arrancar el frontend (terminal 2)

```bash
npm run dev:frontend
```

El frontend queda corriendo en `http://localhost:5173`

### 8. Abrir la aplicación

Abrir `http://localhost:5173` en el navegador y registrar una cuenta nueva. La contraseña debe de tener al menos 8 caracteres.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + Vite + React Router |
| Backend | Node.js 22 + Express 5 |
| Base de datos | PostgreSQL 17 (Docker) + Prisma ORM |
| Autenticación | JWT (access token + refresh cookie httpOnly) |

---

## Estructura del proyecto

```
tfg-despensa-inteligente/
├── frontend/          ← aplicación React
├── backend/           ← API Express + Prisma
├── docker-compose.yml ← PostgreSQL en Docker
├── start.sh           ← arranque automático (Mac/Linux)
└── README.md
```
