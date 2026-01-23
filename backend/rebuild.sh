#!/bin/bash

set -e  # corta si algo falla

SERVICES=(
  account-service
  config-server
  gateway-service
  investment-service
  user-service
)

echo "🚀 Build + Load de microservicios en Minikube"

for SERVICE in "${SERVICES[@]}"; do
  echo "=============================="
  echo "🔨 Building $SERVICE"
  cd "$SERVICE"

  docker build -t "$SERVICE:latest" .

  echo "📦 Loading $SERVICE into Minikube"
  minikube image load "$SERVICE:latest"

  cd ..
done

echo "=============================="
echo "✅ Todos los servicios cargados en Minikube"

