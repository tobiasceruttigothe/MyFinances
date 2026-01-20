#!/bin/bash

set -e

echo "🚀 Desplegando MyFinances en Kubernetes..."

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Función helper
wait_for_pod() {
    echo -e "${YELLOW}⏳ Esperando pod $1...${NC}"
    kubectl wait --for=condition=ready pod -l app=$1 --timeout=120s
    echo -e "${GREEN}✅ Pod $1 listo${NC}"
}

# 1. Bases de datos
echo -e "${YELLOW}📦 Desplegando bases de datos...${NC}"
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/keycloak-db.yaml

wait_for_pod "postgres-db"
wait_for_pod "keycloak-db"

# 2. Keycloak
echo -e "${YELLOW}🔐 Desplegando Keycloak...${NC}"
kubectl apply -f k8s/keycloak-configmap.yaml
kubectl apply -f k8s/keycloak.yaml

wait_for_pod "keycloak"

# 3. Config Server
echo -e "${YELLOW}⚙️  Desplegando Config Server...${NC}"
kubectl apply -f k8s/config-server.yaml

wait_for_pod "config-server"

# 4. Servicios de negocio
echo -e "${YELLOW}🏢 Desplegando servicios de negocio...${NC}"
kubectl apply -f k8s/user-service.yaml
kubectl apply -f k8s/account-service.yaml
kubectl apply -f k8s/investment-service.yaml

wait_for_pod "user-service"
wait_for_pod "account-service"
wait_for_pod "investment-service"

# 5. Gateway
echo -e "${YELLOW}🌐 Desplegando Gateway...${NC}"
kubectl apply -f k8s/gateway-service.yaml

wait_for_pod "gateway-service"

# 6. Observabilidad
echo -e "${YELLOW}📊 Desplegando Zipkin...${NC}"
kubectl apply -f k8s/zipkin.yaml

wait_for_pod "zipkin"

# Resumen
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ DESPLIEGUE COMPLETADO${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Para probar con Postman, ejecutá en terminales separadas:"
echo ""
echo -e "${YELLOW}Terminal 1 (Gateway):${NC}"
echo "  kubectl port-forward service/gateway-service 8080:8080"
echo ""
echo -e "${YELLOW}Terminal 2 (Keycloak Admin):${NC}"
echo "  kubectl port-forward service/keycloak 8082:8080"
echo ""
echo -e "${YELLOW}Terminal 3 (Zipkin):${NC}"
echo "  kubectl port-forward service/zipkin 9411:9411"
echo ""
echo "URLs:"
echo "  - Postman: http://localhost:8080"
echo "  - Keycloak Admin: http://localhost:8082 (admin/admin)"
echo "  - Zipkin: http://localhost:9411"
echo ""

# Mostrar pods
echo "Estado de los pods:"
kubectl get pods
