# Swipejobs OS Production Deployment Guide

## Prerequisites
- Kubernetes cluster (EKS, GKE, or AKS)
- Docker registry access
- kubectl configured
- Helm 3.x installed

## Architecture
- **API Service**: NestJS application (3 replicas)
- **Database**: AWS RDS PostgreSQL
- **Cache**: ElastiCache Redis
- **Search**: Elasticsearch
- **Message Queue**: Amazon MSK (Kafka)
- **Storage**: S3 for documents
- **CDN**: CloudFront

## Deployment Steps

### 1. Prepare Infrastructure
```bash
# Create EKS cluster
eksctl create cluster --name swipejobs --region us-east-1

# Create RDS database
aws rds create-db-instance \
  --db-instance-identifier swipejobs-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --master-username admin \
  --master-user-password [PASSWORD]

# Create ElastiCache cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id swipejobs-redis \
  --cache-node-type cache.t3.micro \
  --engine redis
```

### 2. Build and Push Docker Images
```bash
# Build API image
docker build -t swipejobs-api:latest services/api/

# Push to registry
docker tag swipejobs-api:latest ghcr.io/chaitanyajoshi1769/swipejobs-api:latest
docker push ghcr.io/chaitanyajoshi1769/swipejobs-api:latest

# Build mobile image
docker build -t swipejobs-mobile:latest apps/mobile/
docker push ghcr.io/chaitanyajoshi1769/swipejobs-mobile:latest
```

### 3. Deploy to Kubernetes
```bash
# Apply namespace and secrets
kubectl apply -f infrastructure/kubernetes/deployment.yml

# Create secrets
kubectl create secret generic app-secrets \
  -n swipejobs \
  --from-literal=database-url=$DATABASE_URL \
  --from-literal=jwt-secret=$JWT_SECRET

# Apply deployments
kubectl apply -f infrastructure/kubernetes/

# Verify deployment
kubectl get pods -n swipejobs
kubectl get services -n swipejobs
```

### 4. Configure Monitoring
```bash
# Install Prometheus
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack -n swipejobs

# Install Grafana
helm install grafana grafana/grafana -n swipejobs

# Install Jaeger for tracing
helm install jaeger jaegertracing/jaeger -n swipejobs
```

### 5. Configure Logging
```bash
# Install ELK stack
helm install elasticsearch bitnami/elasticsearch -n swipejobs
helm install kibana bitnami/kibana -n swipejobs
helm install logstash bitnami/logstash -n swipejobs
```

## Backup & Disaster Recovery

### Database Backups
```bash
# Enable automated backups
aws rds modify-db-instance \
  --db-instance-identifier swipejobs-db \
  --backup-retention-period 30 \
  --enable-clouddwatch-logs-exports postgresql
```

### Restore from Backup
```bash
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier swipejobs-db-restored \
  --db-snapshot-identifier swipejobs-db-snapshot-20240101
```

## Scaling

### Horizontal Scaling
```bash
# Scale API deployment
kubectl scale deployment api-deployment -n swipejobs --replicas=5

# Enable autoscaling
kubectl autoscale deployment api-deployment \
  -n swipejobs \
  --min=3 \
  --max=10 \
  --cpu-percent=70
```

### Database Scaling
```bash
# Change instance type
aws rds modify-db-instance \
  --db-instance-identifier swipejobs-db \
  --db-instance-class db.r5.large \
  --apply-immediately
```

## Health Checks
```bash
# Check API health
curl https://api.swipejobs.com/health

# Check database
kubectl exec -it postgres-0 -n swipejobs -- pg_isready

# Check Redis
redis-cli -h redis-service.swipejobs.svc.cluster.local ping
```

## Rollback Procedure
```bash
# Check deployment history
kubectl rollout history deployment/api-deployment -n swipejobs

# Rollback to previous version
kubectl rollout undo deployment/api-deployment -n swipejobs

# Rollback to specific revision
kubectl rollout undo deployment/api-deployment -n swipejobs --to-revision=5
```
