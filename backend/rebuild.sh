#!/bin/bash

set -e

# ==============================================================
# rebuild.sh — Compila y carga todas las imágenes en Minikube
# Uso: ./rebuild.sh              → reconstruye todos los servicios
#      ./rebuild.sh goals-service → reconstruye solo uno
# ==============================================================

SERVICES=(
  config-server
  account-service
  gateway-service
  investment-service
  user-service
  goals-service
  intake-service
)

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Si se pasa un argumento, reconstruir solo ese servicio
if [ $# -eq 1 ]; then
  SERVICES=("$1")
  echo -e "${YELLOW}🔨 Reconstruyendo solo: $1${NC}"
fi

# Verificar que Minikube está corriendo
if ! minikube status | grep -q "Running"; then
  echo -e "${RED}❌ Minikube no está corriendo. Ejecutá: minikube start${NC}"
  exit 1
fi

# ⭐ Apuntar Docker al daemon de Minikube para que las imágenes queden
# directamente disponibles sin necesidad de 'minikube image load'
echo -e "${YELLOW}🔧 Configurando Docker para usar el daemon de Minikube...${NC}"
eval $(minikube docker-env)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${GREEN}🚀 Build de microservicios directamente en Minikube${NC}"
echo "Directorio base: $SCRIPT_DIR"
echo ""

for SERVICE in "${SERVICES[@]}"; do
  SERVICE_DIR="$SCRIPT_DIR/$SERVICE"

  if [ ! -d "$SERVICE_DIR" ]; then
    echo -e "${RED}⚠️  Directorio no encontrado: $SERVICE_DIR — omitiendo${NC}"
    continue
  fi

  if [ ! -f "$SERVICE_DIR/Dockerfile" ]; then
    echo -e "${RED}⚠️  Sin Dockerfile en $SERVICE_DIR — omitiendo${NC}"
    continue
  fi

  echo "=============================="
  echo -e "${YELLOW}🔨 Building $SERVICE...${NC}"

  docker build -t "$SERVICE:latest" "$SERVICE_DIR"

  echo -e "${GREEN}✅ $SERVICE — imagen lista en Minikube${NC}"
  echo ""
done

echo "=============================="
echo -e "${GREEN}✅ Build completado para: ${SERVICES[*]}${NC}"
echo ""
echo "Podés verificar las imágenes con:"
echo "  minikube image ls | grep -E '$(IFS="|"; echo "${SERVICES[*]}")'"
