#!/bin/bash
# ========================================
# ALV.DIGITAL - SYSTEM HEALTH CHECK
# ========================================

# Colores para visualización
BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== INICIANDO VERIFICACIÓN DE CAMBIOS ===${NC}"

# 1. Verificación de Memoria y Swap
echo -e "\n${BLUE}1. Estado de Memoria Virtual:${NC}"
free -h | grep -E "Mem|Swap"

# 2. Verificación de Rutas del Frontend
echo -e "\n${BLUE}2. Estructura de Rutas Frontend:${NC}"
if [ -f "src/frontend/src/app/log/page.tsx" ]; then
    echo -e "${GREEN}[OK]${NC} Ruta /log detectada físicamente."
else
    echo -e "${RED}[ERROR]${NC} Ruta /log no encontrada."
fi

# 3. Estado de Procesos PM2
echo -e "\n${BLUE}3. Estatus de Servicios:${NC}"
pm2 status | grep -E "django-backend|nextjs-app"

# 4. Verificación de API y Datos
echo -e "\n${BLUE}4. Respuesta de la API (Datos en Vivo):${NC}"
API_DATA=$(curl -s https://alv.digital/api/stats/)
echo -e "Respuesta JSON: ${GREEN}$API_DATA${NC}"

# 5. Integridad en Base de Datos RDS
echo -e "\n${BLUE}5. Registro en PostgreSQL (RDS):${NC}"
PGPASSWORD=$RDS_PASSWORD psql -h $RDS_HOSTNAME -U $RDS_USERNAME -d $RDS_DB_NAME -c "SELECT id, type, count_or_duration, crumbs FROM migajas_interaction WHERE id=3;"

echo -e "\n${BLUE}=== FIN DE LA VERIFICACIÓN ===${NC}"
