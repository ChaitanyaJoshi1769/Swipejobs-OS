# swipejobsOS Architecture

## Executive Summary

swipejobsOS is an enterprise-grade, AI-native workforce marketplace platform built using a microservices architecture with event-driven patterns, real-time processing, and machine learning at its core.

The platform is designed to handle:
- **100M+ events/day**
- **10M+ candidate profiles**
- **1M+ active jobs**
- **10K+ concurrent users**
- **Sub-second matching latency**
- **99.95% availability**

## System Architecture

### High-Level Services

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Applications                       │
├──────────────────┬──────────────────┬──────────────────────┤
│  Web (Next.js)   │ Mobile (RN)      │  Admin Dashboard     │
└──────────────────┴──────────────────┴──────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              API Gateway & Load Balancer                     │
│                    (Kong / nginx)                            │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    Microservices                             │
├──────────────────┬──────────────────┬─────────────────────┤
│  API Gateway     │ Marketplace Svc  │  Matching Engine    │
├──────────────────┼──────────────────┼─────────────────────┤
│  Scheduler Svc   │ Payments Svc     │  Notifications      │
├──────────────────┼──────────────────┼─────────────────────┤
│  Compliance Svc  │ Messaging Svc    │  Analytics Svc      │
└──────────────────┴──────────────────┴─────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                  Event Streaming                             │
│                     (Kafka)                                  │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────┬──────────────────┬──────────────────────────┐
│  PostgreSQL  │  Redis Cache     │  Elasticsearch          │
│  (Primary)   │  (Sessions)      │  (Full-text search)     │
└──────────────┴──────────────────┴──────────────────────────┘
```

## Service Architecture

### 1. API Gateway Service
**Tech**: NestJS, TypeScript, Node.js
**Purpose**: Entry point for all client requests
**Responsibilities**:
- Request routing
- Authentication/JWT validation
- Rate limiting
- Request/response transformation
- Tenant context injection
- API versioning

### 2. Marketplace Service
**Tech**: NestJS
**Purpose**: Core marketplace logic
**Domains**:
- Job management
- Candidate profiles
- Applications
- Matches
- Recommendations

### 3. AI Matching Engine
**Tech**: Python, LangChain, FastAPI
**Purpose**: Semantic matching & recommendations
**Features**:
- Resume embeddings
- Skill graph construction
- Similarity scoring
- Ranking algorithms
- Explainability engine

### 4. Scheduler Service
**Tech**: NestJS
**Purpose**: Workforce scheduling
**Domains**:
- Shift creation & management
- Shift assignment
- Availability tracking
- Labor forecasting
- Attendance tracking

### 5. Payments & Payroll Service
**Tech**: NestJS, Stripe integration
**Purpose**: Timekeeping and payroll
**Domains**:
- Time tracking
- Shift billing
- Payroll calculation
- Tax management
- Payment processing

### 6. Compliance & Onboarding Service
**Tech**: NestJS
**Purpose**: Digital onboarding workflows
**Domains**:
- Identity verification
- Document management
- Background checks
- Certifications
- Compliance tracking

### 7. Messaging & Notifications Service
**Tech**: NestJS, Socket.io
**Purpose**: Realtime communication
**Features**:
- Chat/messaging
- Email notifications
- SMS
- Push notifications
- Broadcast campaigns

### 8. Analytics & Intelligence Service
**Tech**: NestJS, Python
**Purpose**: Operational analytics
**Metrics**:
- Fill rates
- Time-to-hire
- Utilization
- Retention
- Revenue metrics

## Data Architecture

### Primary Databases

#### PostgreSQL (Primary Relational DB)
Purpose: Core transactional data
Schema:
- Organizations & tenants
- Users & authentication
- Roles & permissions
- Jobs & applications
- Candidates & profiles
- Shifts & schedules
- Compliance documents
- Messaging data

#### Redis
Purpose: Caching, sessions, realtime features
Uses:
- Session storage
- Rate limiting
- Job queues
- Cache layer
- Realtime notifications

#### Elasticsearch
Purpose: Full-text search & analytics
Indexes:
- Candidate profiles
- Job listings
- Skill graphs
- Match results
- Application history

#### Kafka
Purpose: Event streaming & CQRS
Topics:
- candidate.events
- job.events
- application.events
- match.events
- shift.events
- payment.events
- compliance.events

#### TimescaleDB
Purpose: Time-series data
Data:
- Event logs
- Metrics
- Operational events
- Performance data

### Database Schema Overview

See [DATABASE.md](./DATABASE.md) for complete schema.

## Authentication & Authorization

### Multi-Tenant Architecture

```
┌─────────────────────────────────────┐
│      Tenant/Organization            │
│  ┌─────────────┬──────────────────┐ │
│  │  Users      │  Resources       │ │
│  │  Roles      │  Data            │ │
│  │  Policies   │  Configurations  │ │
│  └─────────────┴──────────────────┘ │
└─────────────────────────────────────┘
```

### Authentication Flow

```
User Login
    ↓
JWT Generation (access + refresh)
    ↓
Tenant Context Injection
    ↓
Request Processing with Tenant Isolation
    ↓
Token Refresh (automatic)
```

### Authorization

- **RBAC**: Role-based access control
- **ABAC**: Attribute-based access control
- **Tenant Isolation**: Complete data segregation
- **Resource Policies**: Fine-grained permissions

## AI/ML Pipeline

### Matching Engine

```
Candidate Profile → Resume Parsing → Embedding Generation
                                          ↓
                                    Skill Graph
                                          ↓
                                    Vector DB
                                          ↓
Job Posting → Job Analysis → Job Embedding
                                          ↓
                        ┌─────────────────┘
                        ↓
                Semantic Similarity
                        ↓
                   Ranking Model
                        ↓
              Explainability Engine
                        ↓
                Match Scores + Reasons
```

### Recommendation Engine

Inputs:
- Candidate attributes
- Job requirements
- Historical behavior
- Market data

Process:
1. Collaborative filtering
2. Content-based filtering
3. Hybrid ranking
4. Personalization

Output:
- Ranked job recommendations
- Confidence scores
- Explainability

### Forecasting Models

- Shift completion likelihood
- Retention prediction
- Demand forecasting
- Wage predictions

## Event-Driven Architecture

### Event Topics

```
Events → Kafka Topics → Consumers
    ↓
candidate.created
candidate.updated
candidate.applied
    ↓
job.created
job.updated
job.closed
    ↓
application.submitted
application.reviewed
application.hired
    ↓
shift.created
shift.assigned
shift.completed
    ↓
payment.processed
payment.refunded
    ↓
document.verified
compliance.completed
```

### Event Consumers

- Notification service (sends messages)
- Analytics service (collects metrics)
- Search indexing (updates Elasticsearch)
- Recommendation engine (recomputes scores)
- Reporting service (builds reports)

## Scalability Architecture

### Horizontal Scaling

```
Load Balancer
    ↓
├─ API Pod 1
├─ API Pod 2
├─ API Pod N
    ↓
Connection Pool
    ↓
├─ Primary DB (write)
├─ Read Replica 1
├─ Read Replica N
```

### Caching Strategy

```
Request
    ↓
Cache Check (Redis)
    ↓
├─ Cache HIT → Return
└─ Cache MISS
    ↓
Database Query
    ↓
Cache Write
    ↓
Return to Client
```

### Database Optimization

- Connection pooling
- Read replicas
- Sharding strategy (by tenant)
- Partitioning (by date for time-series)
- Indexing strategy
- Query optimization

## Observability & Monitoring

### Tracing

OpenTelemetry + Jaeger:
- Distributed tracing
- Service dependency maps
- Latency analysis
- Error tracking

### Metrics

Prometheus:
- Request latency (p50, p95, p99)
- Error rates
- Throughput
- Resource usage
- Business metrics

### Logging

ELK Stack / Loki:
- Centralized logging
- Log aggregation
- Query interface
- Alerting

### Dashboards

Grafana:
- Service health
- Performance metrics
- Business dashboards
- Operational visibility

## Deployment Architecture

### Containerization

Docker containers for each service:
- Base images: node:18-alpine, python:3.11-slim
- Multi-stage builds for optimization
- Security scanning

### Orchestration

Kubernetes:
- Service definitions
- Deployments
- StatefulSets (for databases)
- ConfigMaps & Secrets
- Persistent Volumes

### CI/CD Pipeline

GitHub Actions:
```
Push to main
    ↓
Run tests & lint
    ↓
Build docker images
    ↓
Push to registry
    ↓
Deploy to staging
    ↓
Run integration tests
    ↓
Deploy to production
```

## Security Architecture

### Network Security

```
Internet
    ↓
WAF (DDoS protection)
    ↓
API Gateway
    ↓
Service Mesh (mTLS)
    ↓
Microservices
```

### Data Security

- Encryption at rest (AES-256)
- Encryption in transit (TLS 1.3)
- Key management (AWS KMS)
- Secret management (Vault)
- Data masking for PII

### Authentication & Authorization

- JWT tokens with short expiry
- Refresh token rotation
- MFA support
- OAuth2 support
- SAML2 support

### Compliance

- GDPR compliance
- SOC 2 Type II
- HIPAA ready
- Audit logging
- Data retention policies

## Performance Targets

| Metric | Target |
|--------|--------|
| API P99 Latency | < 100ms |
| Matching Latency | < 500ms |
| Search Latency | < 200ms |
| Throughput | 100M events/day |
| Availability | 99.95% |
| RTO | < 1 hour |
| RPO | < 15 minutes |

## Integration Architecture

### Third-Party Integrations

- **Workday**: Workforce management sync
- **ADP**: Payroll integration
- **Rippling**: HR operations
- **Slack**: Team notifications
- **Teams**: Corporate messaging
- **Stripe**: Payments
- **Twilio**: SMS/Voice

### Integration Framework

```
External Systems
    ↓
API Adapters
    ↓
Event Transformers
    ↓
Internal Services
    ↓
Database
```

## Development Workflow

### Monorepo Structure

```
Root
├── apps/
│   ├── web/ (Next.js)
│   ├── mobile/ (React Native)
│   └── admin/ (Next.js)
├── services/
│   ├── api/ (NestJS)
│   ├── matching-service/ (Python)
│   └── [other services]
├── packages/
│   ├── types/ (Shared types)
│   ├── ui/ (React components)
│   └── [shared packages]
├── infrastructure/
│   ├── terraform/
│   ├── kubernetes/
│   └── docker/
└── docs/
```

### Development Servers

```bash
npm run dev  # Starts all services in parallel
```

Servers:
- Web: http://localhost:3000
- API: http://localhost:3001
- Mobile: http://localhost:8081

## Deployment Phases

1. **Local Development**: Docker Compose
2. **Staging**: Kubernetes on AWS
3. **Production**: Multi-region Kubernetes
4. **Disaster Recovery**: Cross-region replicas

## Next Steps

See [Deployment Guide](./DEPLOYMENT.md) for deployment instructions.

