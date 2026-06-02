#!/bin/bash

set -e

# ==============================================================
# deploy-k8s.sh — Despliega MyFinances completo en Minikube/K8s
# Uso: ./deploy-k8s.sh           → despliega todo
#      ./deploy-k8s.sh --only goals-service → solo un servicio
# ==============================================================

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
K8S_DIR="$SCRIPT_DIR/k8s"

# ==============================================================
# Helpers
# ==============================================================

log_step() { echo -e "${CYAN}▶ $1${NC}"; }
log_ok()   { echo -e "${GREEN}✅ $1${NC}"; }
log_warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_err()  { echo -e "${RED}❌ $1${NC}"; }

wait_for_pod() {
  local label=$1
  local timeout=${2:-180}

  log_step "Esperando pod con label app=$label (timeout: ${timeout}s)..."

  # Esperar a que el pod exista primero
  local elapsed=0
  until kubectl get pod -l app="$label" 2>/dev/null | grep -q "$label"; do
    if [ $elapsed -ge $timeout ]; then
      log_err "Timeout esperando que aparezca el pod $label"
      kubectl get events --sort-by='.lastTimestamp' | tail -10
      return 1
    fi
    sleep 3
    elapsed=$((elapsed + 3))
  done

  # Ahora esperar a que esté Ready
  if kubectl wait --for=condition=ready pod -l app="$label" --timeout="${timeout}s" 2>/dev/null; then
    log_ok "Pod $label listo"
  else
    log_warn "Pod $label no alcanzó Ready en ${timeout}s — revisá con: kubectl describe pod -l app=$label"
    kubectl get pod -l app="$label"
  fi
}

apply_and_log() {
  local file=$1
  if [ -f "$file" ]; then
    kubectl apply -f "$file"
    log_ok "Aplicado: $(basename $file)"
  else
    log_err "Archivo no encontrado: $file"
    exit 1
  fi
}

# ==============================================================
# Verificaciones previas
# ==============================================================

if ! minikube status | grep -q "Running"; then
  log_err "Minikube no está corriendo. Ejecutá: minikube start"
  exit 1
fi

if ! kubectl cluster-info &>/dev/null; then
  log_err "kubectl no puede conectarse al cluster"
  exit 1
fi

# Modo de despliegue parcial
if [ "$1" == "--only" ] && [ -n "$2" ]; then
  log_step "Desplegando solo: $2"
  apply_and_log "$K8S_DIR/$2.yaml"
  wait_for_pod "$2"
  exit 0
fi

# ==============================================================
# Despliegue completo
# ==============================================================

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   🚀 Desplegando MyFinances en K8s     ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 1. Bases de datos
log_step "1/6 Desplegando bases de datos..."
apply_and_log "$K8S_DIR/postgres.yaml"
apply_and_log "$K8S_DIR/keycloak-db.yaml"

wait_for_pod "postgres-db" 120
wait_for_pod "keycloak-db" 120

# 2. Keycloak
log_step "2/6 Desplegando Keycloak..."
apply_and_log "$K8S_DIR/keycloak-configmap.yaml"
apply_and_log "$K8S_DIR/keycloak-secrets.yaml"
apply_and_log "$K8S_DIR/keycloak.yaml"
wait_for_pod "keycloak" 180

# 3. Config Server
log_step "3/6 Desplegando Config Server..."
apply_and_log "$K8S_DIR/config-server.yaml"
wait_for_pod "config-server" 120

# 4. Servicios de negocio (en paralelo, luego esperamos)
log_step "4/6 Desplegando servicios de negocio..."
apply_and_log "$K8S_DIR/intake-secrets.yaml"
apply_and_log "$K8S_DIR/user-service.yaml"
apply_and_log "$K8S_DIR/account-service.yaml"
apply_and_log "$K8S_DIR/investment-service.yaml"
apply_and_log "$K8S_DIR/goals-service.yaml"
apply_and_log "$K8S_DIR/intake-service.yaml"

wait_for_pod "user-service"       150
wait_for_pod "account-service"    150
wait_for_pod "investment-service" 150
wait_for_pod "goals-service"      150
wait_for_pod "intake-service"     150

# 5. Gateway
log_step "5/6 Desplegando Gateway..."
apply_and_log "$K8S_DIR/gateway-service.yaml"
wait_for_pod "gateway-service" 120

# 6. Observabilidad
log_step "6/6 Desplegando Zipkin..."
apply_and_log "$K8S_DIR/zipkin.yaml"
wait_for_pod "zipkin" 60

# ==============================================================
# Resumen
# ==============================================================

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   ✅ DESPLIEGUE COMPLETADO             ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

echo "Estado de los pods:"
kubectl get pods -o wide
echo ""

echo "Para probar la API, abrí terminales separadas:"
echo ""
echo -e "${YELLOW}Terminal 1 — Gateway (API principal):${NC}"
echo "  kubectl port-forward service/gateway-service 8080:8080"
echo ""
echo -e "${YELLOW}Terminal 2 — Keycloak Admin:${NC}"
echo "  kubectl port-forward service/keycloak 8082:8080"
echo ""
echo -e "${YELLOW}Terminal 3 — Zipkin (Trazas):${NC}"
echo "  kubectl port-forward service/zipkin 9411:9411"
echo ""
echo "URLs:"
echo "  API:            http://localhost:8080"
echo "  Keycloak Admin: http://localhost:8082  (admin/admin)"
echo "  Zipkin:         http://localhost:9411"
