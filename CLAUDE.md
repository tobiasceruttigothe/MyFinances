# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MyFinances is a personal finance management app with a Spring Cloud microservices backend and an (in-progress) frontend. The backend is deployed on Minikube (Kubernetes).

## Common Commands

### Build & Deploy (Kubernetes / Minikube)

```bash
# Build all service Docker images into Minikube's Docker daemon
cd backend && ./rebuild.sh

# Full deploy to Minikube (databases → Keycloak → config-server → services → gateway → zipkin)
cd backend && ./deploy-k8s.sh

# Check pod status
kubectl get pods -n default

# Port-forward the gateway for local testing
kubectl port-forward svc/gateway-service 8080:8080

# Port-forward Keycloak for auth (needed for direct login in tests)
kubectl port-forward svc/keycloak 8082:8082
```

### Build a Single Service

```bash
cd backend/<service-name>
mvn clean package -DskipTests         # fast build
mvn clean package                     # build with tests
```

### Run Postman / Newman Tests

```bash
cd backend/postman
newman run MyFinances_API.postman_collection.json -e MyFinances_Environment.postman_environment.json
```

All 63 assertions should pass. The only expected failure is Keycloak direct login when port-forward :8082 is not active.

## Architecture

### Services

| Service | Port | Responsibility |
|---|---|---|
| gateway-service | 8080 | API Gateway — JWT validation, routing |
| config-server | 8888 | Spring Cloud Config (pulls from GitHub) |
| user-service | 8084 | User registration, Keycloak integration |
| account-service | 8081 | Transactions (income/expense), categories, balance, reports |
| investment-service | 8083 | Investments; can auto-create linked EXPENSE transactions |
| goals-service | 8085 | Savings goals and progress tracking |
| keycloak | 8082 | Identity provider, JWT issuer |
| zipkin | 9411 | Distributed tracing |

### Request Flow

1. Client → gateway-service (port 8080)
2. Gateway validates JWT via Keycloak JWK Set URI, extracts `X-User-Id` claim
3. `X-User-Id` header is propagated to all downstream services
4. Downstream services trust this header for user identity — they never validate JWTs themselves

### Inter-Service Communication

- Services use **Feign clients** with **Resilience4j circuit breakers** and fallbacks
- Example: investment-service calls account-service to create a linked transaction on investment creation
- Service DNS in K8s (e.g., `http://account-service:8081`)

### Configuration

- All services fetch config from `config-server` at startup via `bootstrap.properties` (or `bootstrap.yml` for gateway)
- Config server reads from GitHub: `https://github.com/tobiasceruttigothe/myfinances-config-data.git`
- Retry is configured on all bootstrap files (6 attempts, exponential backoff) to tolerate slow config-server startup

### Authentication

- **Keycloak realm**: `myfinances-realm`
- **Test credentials**: `usuario_prueba` / `1234`
- Gateway whitelist (no auth required): only `GET /api/v1/users/health`
- All other endpoints require a valid Bearer token

## Key File Locations

```
backend/
├── docker-compose.yml                  # Local dev (alternative to Minikube)
├── rebuild.sh                          # Build all images into Minikube
├── deploy-k8s.sh                       # Full K8s deploy script
├── k8s/                                # Kubernetes manifests for all services
├── postman/                            # Newman test collection + environment
├── config-server/                      # Spring Cloud Config Server
├── gateway-service/src/main/java/.../
│   └── filter/JwtAuthenticationFilter # JWT validation + X-User-Id propagation
├── account-service/src/main/java/.../
│   ├── controller/AccountController   # Balance summary, account endpoints
│   └── service/TransactionService     # Transaction CRUD, balance calculation
├── investment-service/src/main/java/.../
│   ├── service/InvestmentService      # Investment CRUD, type validation
│   └── model/InvestmentType           # Enum of valid investment types
└── goals-service/src/main/java/.../
    └── service/GoalService            # Goals + scheduled progress updates
```

## Tech Stack

- **Java 21**, **Spring Boot 3.2.12**, **Spring Cloud 2023.0.4**
- **Maven** (each service has its own `pom.xml`, no parent aggregator)
- **PostgreSQL** (shared instance, logically isolated per service)
- **Keycloak 23.0.0**
- **Resilience4j** for circuit breakers
- **Micrometer + Zipkin** for distributed tracing
- **Docker** multi-stage builds (maven:3.9.6-eclipse-temurin-21-alpine → eclipse-temurin:21-jre-alpine)
- **Kubernetes / Minikube** — `ImagePullPolicy: Never` (images built locally)

## Frontend

The `frontend/` directory is currently empty. The backend API is stable and ready for frontend development.



## Development Guidelines

- Always run tests after editing code.
- Use English for code comments.

## Project Goal

The goal of this project is to design the most complete personal finance system possible and then use it as a test for deployment on AWS.
