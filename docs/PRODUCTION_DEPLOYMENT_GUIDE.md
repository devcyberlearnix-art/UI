# CyberLearnIX / FD_LMS Enterprise Production Deployment Guide

## 1. System Topology Overview

The CyberLearnIX / FD_LMS platform employs a resilient, zero-trust cloud-native architecture connecting a high-performance React Single Page Application (SPA) to an 11-microservice matrix orchestrated by a Spring Cloud API Gateway:

```
[ Internet / Browser Client ]
             │
             ▼ HTTPS / WSS
   [ Ingress Controller / NGINX Gateway ]
      ├── / (SPA Static Assets) ────────► [ UI Pods (Nginx + React 18) ]
      ├── /api/* (REST Microservices) ──► [ Spring Cloud API Gateway (Port 8080) ]
      └── /ws/* (STOMP Duplex Stream) ──► [ Spring Cloud API Gateway (Port 8080) ]
                                                        │
                      ┌─────────────────────────────────┴─────────────────────────────────┐
                      ▼                                 ▼                                 ▼
              [ User Service : 8091 ]         [ Course Service : 8083 ]          [ Cart Service : 8081 ]
              [ Admin Service : 8087 ]        [ Instructor Service : 8088 ]      [ Coupon Service : 8082 ]
              [ Review Service : 8089 ]       [ Order Service : 8084 ]           [ Wishlist Service : 8090 ]
              [ Payment Service : 8085 ]      [ Notification Service : 8093 ]    
                      │                                 │                                 │
                      └─────────────────────────────────┬─────────────────────────────────┘
                                                        ▼
                                       [ Redis 7 & PostgreSQL 16 Data Clusters ]
```

---

## 2. Production Environment Configuration

The file [`.env.production`](file:///c:/Users/SHIVASAI/OneDrive/Desktop/FD_LMS/UI/.env.production) defines distribution configurations for the React client.

### Key Environment Variables:
| Variable | Description | Production Default |
|:---|:---|:---|
| `VITE_APP_ENV` | Environment identifier | `production` |
| `VITE_API_BASE_URL` | Base API gateway domain | `""` (relative paths via reverse proxy) |
| `VITE_WS_URL` | WebSocket STOMP broker URL | `""` (derives from host window location) |
| `VITE_FEATURE_RESILIENT_CHECKOUT` | Resilient Checkout toggle | `true` |
| `VITE_FEATURE_STAMPEDE_CACHE` | XFetch stampede protection | `true` |
| `VITE_API_TIMEOUT_MS` | Network call timeout | `30000` |
| `VITE_API_MAX_RETRIES` | Max idempotency retries | `2` |

> [!TIP]
> Leaving `VITE_API_BASE_URL` empty instructs the React application to use relative paths (`/api/v1/...`), eliminating Cross-Origin Resource Sharing (CORS) preflight round-trips and simplifying HttpOnly secure cookie delegation.

---

## 3. Docker Container Deployment & Staging

### 3.1 Build the Production Container
```bash
docker build -t cyberlearnix/ui:1.0.0 -f Dockerfile .
```

### 3.2 Launch Full 11-Microservice Production Stack with Docker Compose
The platform provides a complete [docker-compose.prod.yml](file:///c:/Users/SHIVASAI/OneDrive/Desktop/FD_LMS/UI/docker-compose.prod.yml) orchestrating all 11 microservices, PostgreSQL 16 multi-schema database, Redis 7.2 in-memory cluster, and the UI container:

```bash
# Start all microservices in detached mode
docker compose -f docker-compose.prod.yml up -d

# Verify container health
docker compose -f docker-compose.prod.yml ps

# Check UI health endpoint
curl -i http://localhost/healthz
```

---

## 4. Kubernetes Helm Deployment

The [helm/cyberlearnix](file:///c:/Users/SHIVASAI/OneDrive/Desktop/FD_LMS/UI/helm/cyberlearnix) chart provides enterprise Kubernetes orchestration.

### 4.1 Prerequisites
1. Kubernetes cluster version 1.28 or later
2. Helm 3.12+
3. Ingress-NGINX controller installed
4. Cert-Manager installed for automated TLS provisioning

### 4.2 Chart Structure
```
helm/cyberlearnix/
├── Chart.yaml                  # Chart metadata & app version
├── values.yaml                 # Centralized configuration matrix
└── templates/
    ├── _helpers.tpl            # Template naming & label helpers
    ├── configmap.yaml          # Shared platform config
    ├── secrets.yaml            # Hardened secrets (DB, JWT, Redis)
    ├── ingress.yaml            # TLS Ingress routing (UI, API, WS)
    ├── ui-deployment.yaml      # React SPA deployment with PodAntiAffinity
    ├── ui-service.yaml         # ClusterIP service on port 80
    ├── gateway-deployment.yaml # Spring Cloud Gateway deployment
    ├── gateway-service.yaml    # API Gateway ClusterIP service on port 8080
    ├── microservices.yaml      # Deployments & services for all 11 microservices
    ├── redis-statefulset.yaml  # Redis 7 in-memory cache StatefulSet
    ├── redis-service.yaml      # Redis ClusterIP service on port 6379
    ├── hpa.yaml                # Horizontal Pod Autoscalers (UI, Gateway, Services)
    └── networkpolicy.yaml      # Zero-trust microservice network isolation
```

### 4.3 Helm Deployment Commands

```bash
# 1. Create dedicated production namespace
kubectl create namespace cyberlearnix

# 2. Dry-run and lint chart templates
helm lint ./helm/cyberlearnix
helm template cyberlearnix ./helm/cyberlearnix -n cyberlearnix > rendered-manifests.yaml

# 3. Deploy the CyberLearnIX Enterprise Stack
helm upgrade --install cyberlearnix ./helm/cyberlearnix \
  --namespace cyberlearnix \
  --set global.domain="cyberlearnix.io" \
  --set global.environment="production" \
  --wait \
  --timeout 10m

# 4. Verify deployment rollout status
kubectl rollout status deployment/cyberlearnix-ui -n cyberlearnix
kubectl rollout status deployment/cyberlearnix-gateway -n cyberlearnix
kubectl get pods -n cyberlearnix -o wide
```

### 4.4 Ingress & TLS Verification
Verify the Ingress resource and automatic Let's Encrypt certificate issuance:
```bash
kubectl get ingress -n cyberlearnix
kubectl get certificate -n cyberlearnix
```

---

## 5. High Availability & Resilience Features

1. **Pod Anti-Affinity**: Both the React UI pods and API Gateway pods specify preferred anti-affinity across cluster nodes, guaranteeing fault-tolerance against single-node outages.
2. **Horizontal Pod Autoscaling**: Autoscalers dynamically scale pods between `minReplicas` and `maxReplicas` when CPU thresholds exceed target utilization.
3. **Probabilistic Early Cache Expiration (XFetch)**: The Course catalog service eliminates cache stampedes during concurrent traffic bursts.
4. **Zero-Trust Network Policies**: Backend microservices only accept inbound TCP connections originating from the API Gateway.
5. **Non-Root Hardened Containers**: The UI Nginx container executes under an unprivileged UID (`101`) with a read-only root filesystem (`readOnlyRootFilesystem: true`).
