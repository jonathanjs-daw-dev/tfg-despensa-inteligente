#!/bin/bash

echo "=== Despensa Inteligente — Jonathan Jiménez Salazar - Arranque ==="

# 1. Crear .env si no existen
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo "✓ backend/.env creado"
fi

if [ ! -f frontend/.env ]; then
  cp frontend/.env.example frontend/.env
  echo "✓ frontend/.env creado"
fi

# 2. Arrancar PostgreSQL
echo "→ Arrancando base de datos..."
docker-compose up -d
sleep 3

# 3. Instalar dependencias
echo "→ Instalando dependencias..."
npm install

# 4. Ejecutar migraciones
echo "→ Ejecutando migraciones..."
cd backend && npx prisma migrate deploy && cd ..

echo ""
echo "→ Arrancando servidores..."
echo "   Backend:  http://localhost:3000"
echo "   Frontend: http://localhost:5173"
echo ""
echo "Pulsa Ctrl+C para detener ambos servidores."
echo ""

npm run dev:backend &
BACKEND_PID=$!
trap "kill $BACKEND_PID" EXIT

npm run dev:frontend
