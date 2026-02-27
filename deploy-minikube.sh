#!/bin/bash
set -e

# ============================================================
#  Collector.shop — Minikube Full Deployment Script
# ============================================================
#  Usage: ./deploy-minikube.sh
#  Prerequisites: minikube, kubectl, docker
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Collector.shop — Minikube Deployment  ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# ----------------------------------------------------------
# 1. Start Minikube (if not running)
# ----------------------------------------------------------
echo -e "${YELLOW}[1/7]${NC} Checking Minikube status..."
if minikube status | grep -q "Running"; then
  echo -e "${GREEN}  ✓ Minikube is already running${NC}"
else
  echo -e "${YELLOW}  → Starting Minikube...${NC}"
  minikube start --driver=docker --memory=4096 --cpus=2
  echo -e "${GREEN}  ✓ Minikube started${NC}"
fi

# ----------------------------------------------------------
# 2. Point Docker to Minikube's daemon
# ----------------------------------------------------------
echo ""
echo -e "${YELLOW}[2/7]${NC} Configuring Docker to use Minikube's daemon..."
eval $(minikube docker-env)
echo -e "${GREEN}  ✓ Docker now points to Minikube${NC}"

# ----------------------------------------------------------
# 3. Build Docker images inside Minikube
# ----------------------------------------------------------
echo ""
echo -e "${YELLOW}[3/7]${NC} Building Docker images..."

echo -e "  → Building ${BLUE}collector-backend:local${NC}..."
docker build -t collector-backend:local "$SCRIPT_DIR/services/backend"
echo -e "${GREEN}  ✓ Backend image built${NC}"

echo -e "  → Building ${BLUE}collector-frontend:local${NC}..."
docker build -t collector-frontend:local "$SCRIPT_DIR/services/frontend"
echo -e "${GREEN}  ✓ Frontend image built${NC}"

# ----------------------------------------------------------
# 4. Apply Kubernetes manifests (in order)
# ----------------------------------------------------------
echo ""
echo -e "${YELLOW}[4/7]${NC} Applying Kubernetes manifests..."

echo -e "  → Namespace..."
kubectl apply -f "$SCRIPT_DIR/k8s/namespace.yaml"

echo -e "  → Secrets..."
kubectl apply -f "$SCRIPT_DIR/k8s/secrets.yaml"

echo -e "  → PostgreSQL..."
kubectl apply -f "$SCRIPT_DIR/k8s/postgres.yaml"

echo -e "  → Redis..."
kubectl apply -f "$SCRIPT_DIR/k8s/redis.yaml"

echo -e "${GREEN}  ✓ Infrastructure deployed${NC}"

# ----------------------------------------------------------
# 5. Wait for database to be ready
# ----------------------------------------------------------
echo ""
echo -e "${YELLOW}[5/7]${NC} Waiting for PostgreSQL to be ready..."
kubectl wait --namespace=collector-shop \
  --for=condition=ready pod \
  --selector=app=postgres \
  --timeout=120s
echo -e "${GREEN}  ✓ PostgreSQL is ready${NC}"

echo -e "  Waiting for Redis to be ready..."
kubectl wait --namespace=collector-shop \
  --for=condition=ready pod \
  --selector=app=redis \
  --timeout=60s
echo -e "${GREEN}  ✓ Redis is ready${NC}"

# ----------------------------------------------------------
# 6. Deploy application services
# ----------------------------------------------------------
echo ""
echo -e "${YELLOW}[6/7]${NC} Deploying application services..."

echo -e "  → Backend (2 replicas)..."
kubectl apply -f "$SCRIPT_DIR/k8s/backend-deployment.yaml"

echo -e "  → Frontend (2 replicas)..."
kubectl apply -f "$SCRIPT_DIR/k8s/frontend-deployment.yaml"

echo -e "  → Prometheus (monitoring)..."
kubectl apply -f "$SCRIPT_DIR/k8s/prometheus.yaml"

echo -e "  → Grafana (dashboards)..."
kubectl apply -f "$SCRIPT_DIR/k8s/grafana.yaml"

echo -e "${GREEN}  ✓ All services deployed${NC}"

# ----------------------------------------------------------
# 7. Wait and display status
# ----------------------------------------------------------
echo ""
echo -e "${YELLOW}[7/7]${NC} Waiting for all pods to be ready..."
sleep 5

kubectl wait --namespace=collector-shop \
  --for=condition=ready pod \
  --selector=app=backend \
  --timeout=120s 2>/dev/null && echo -e "${GREEN}  ✓ Backend pods ready${NC}" || echo -e "${RED}  ✗ Backend pods not ready yet (may still be starting)${NC}"

kubectl wait --namespace=collector-shop \
  --for=condition=ready pod \
  --selector=app=frontend \
  --timeout=60s 2>/dev/null && echo -e "${GREEN}  ✓ Frontend pods ready${NC}" || echo -e "${RED}  ✗ Frontend pods not ready yet${NC}"

# ----------------------------------------------------------
# Display summary
# ----------------------------------------------------------
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}  ✅ Deployment Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "  📋 All pods:"
kubectl get pods -n collector-shop
echo ""
echo -e "  🌐 Services:"
kubectl get svc -n collector-shop
echo ""

# Get the Minikube IP
MINIKUBE_IP=$(minikube ip)
echo -e "${BLUE}========================================${NC}"
echo -e "  Access your application:${NC}"
echo -e "  ${GREEN}Frontend${NC}:   http://${MINIKUBE_IP}:30081"
echo -e "  ${GREEN}Backend${NC}:    http://${MINIKUBE_IP}:30080"
echo -e "  ${GREEN}Prometheus${NC}: http://${MINIKUBE_IP}:30090"
echo -e "  ${GREEN}Grafana${NC}:    http://${MINIKUBE_IP}:30091  (admin/admin)"
echo -e ""
echo -e "  Or use minikube service:"
echo -e "  ${YELLOW}minikube service collector-frontend-service -n collector-shop${NC}"
echo -e "  ${YELLOW}minikube service collector-backend-service -n collector-shop${NC}"
echo -e "${BLUE}========================================${NC}"
