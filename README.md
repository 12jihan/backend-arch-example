# Backend Architecture Example

A production-ready full-stack application template with Node.js backend, Angular frontend, complete observability stack, and message queue infrastructure.

## Architecture Overview

This project demonstrates a modern microservices architecture with:

- **Frontend**: Angular 21 with SSR (Server-Side Rendering)
- **Backend**: Express 5 API with TypeScript and horizontal scaling
- **Reverse Proxy**: Nginx with load balancing and rate limiting
- **Data Layer**: PostgreSQL 15 database and Redis 7 cache
- **Observability**: Grafana + Loki + Promtail + Prometheus stack
- **Message Queue**: RabbitMQ with management UI
- **Container Orchestration**: Docker Compose with multi-replica deployment

## Visual Diagram

![Architecture Diagram](./images/Backend-Architecture-Diagram.png)

[View on Excalidraw](https://excalidraw.com/#json=R3eT5g4VDLOs_rtnTqt9H,DMZJk-e_blmapSVUPWWYFA)

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd backend-arch-example

# Start all services in production mode
docker-compose up --build

# Verify services are running
curl http://localhost/health
curl http://localhost/api
```

## Project Structure

```
.
├── docker-compose.yml           # Production compose file
├── docker-compose.dev.yml       # Development overrides (hot reload)
├── nginx/
│   └── nginx.conf              # Reverse proxy & load balancer config
├── nodeapp/                     # Backend API service
│   ├── Dockerfile              # Multi-stage production build
│   ├── Dockerfile.dev          # Development container
│   ├── src/
│   │   └── index.ts            # Express app with metrics
│   ├── package.json
│   └── tsconfig.json
├── frontend/                    # Angular frontend application
│   ├── src/
│   │   ├── app/                # Angular components
│   │   ├── main.ts             # Client entry point
│   │   └── server.ts           # SSR server
│   ├── angular.json
│   ├── package.json
│   └── tsconfig.json
├── observability/               # Monitoring & logging configs
│   ├── prometheus/
│   │   └── prometheus.yml      # Metrics scraping config
│   ├── loki/
│   │   └── loki-config.yaml    # Log aggregation config
│   └── promtail/
│       └── promtail-config.yaml # Log shipping config
└── images/
    └── Backend-Architecture-Diagram.png
```

## Services & Ports

| Service | Port(s) | Purpose | UI Access |
|---------|---------|---------|-----------|
| **proxy** (nginx) | 80 | Reverse proxy & load balancer | - |
| **backend** (Node.js) | 3000 (internal) | Express API (3 replicas) | - |
| **frontend** (Angular) | - | Angular 21 with SSR | - |
| **database** (PostgreSQL) | 5432 | PostgreSQL 15 database | - |
| **cache** (Redis) | 6379 | Redis 7 in-memory cache | - |
| **grafana** | 3001 | Visualization dashboards | http://localhost:3001 |
| **prometheus** | 9090 | Metrics collection & queries | http://localhost:9090 |
| **loki** | 3100 | Log aggregation | - |
| **promtail** | 9080 | Log shipping agent | - |
| **rabbitmq** | 5672, 15672 | Message queue & management UI | http://localhost:15672 |

### Default Credentials

- **Grafana**: `admin` / `password`
- **RabbitMQ**: `rabbit` / `rabbit`
- **PostgreSQL**: `postgres` / `postgres` (database: `testdb`)

## API Endpoints

| Route | Description | Rate Limited |
|-------|-------------|--------------|
| `GET /health` | Health check with timestamp | No |
| `GET /` | Basic hello world | No |
| `GET /api` | Returns hostname (demonstrates load balancing) | Yes (100 req/min) |
| `GET /api/db` | Database connection info | Yes |
| `GET /api/cache` | Redis connection info | Yes |
| `GET /metrics` | Prometheus metrics endpoint | No |

## Backend Configuration

### Environment Variables

Defined in `docker-compose.yml`:

```yaml
environment:
  - NODE_ENV=production
  - PORT=3000
  - DATABASE_URL=postgres
  - REDIS_URL=redis
```

### Horizontal Scaling

The backend runs 3 replicas by default. To scale:

```yaml
# In docker-compose.yml
backend:
  deploy:
    replicas: 5  # Adjust as needed
```

Nginx automatically load balances across all replicas.

### Dependencies

- **Express** 5.2.1
- **prom-client** 15.1.3 (Prometheus metrics)
- **TypeScript** 5.9.3

## Frontend (Angular)

### Stack

- **Angular** 21.0.0
- **Server-Side Rendering** (SSR) enabled
- **Testing**: Vitest 4.0.8
- **Package Manager**: npm 11.6.2

### Development

```bash
cd frontend
npm install
npm run start  # Runs on http://localhost:4200
```

### Build

```bash
cd frontend
npm run build  # Outputs to dist/
```

### Testing

```bash
npm run test  # Runs Vitest tests
```

## Observability Stack

### Prometheus (Metrics)

- Scrapes metrics from backend every 5 seconds
- Scrapes itself every 15 seconds
- Metrics endpoint: http://localhost:9090
- Backend exposes metrics at `/metrics` endpoint

### Grafana (Visualization)

- Pre-configured with Loki as data source
- Access: http://localhost:3001
- Login: `admin` / `password`
- Persistent storage via Docker volume

### Loki (Log Aggregation)

- Centralized log storage
- 14-day retention period (configurable)
- File system storage in Docker volume
- Query logs via Grafana

### Promtail (Log Shipping)

- Automatically discovers Docker containers
- Ships logs from all services to Loki
- Monitors system logs at `/var/log`
- Labels logs by container and service name

### Monitoring Configuration

All services have log rotation configured:

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

## Message Queue (RabbitMQ)

- **Version**: 3 with management plugin
- **AMQP Port**: 5672 (for applications)
- **Management UI**: http://localhost:15672
- **Credentials**: `rabbit` / `rabbit`
- **Persistent Storage**: `rabbitmq-data` volume
- **Health Check**: Automatic diagnostics every 30s

## Reverse Proxy & Security

### Nginx Configuration

- **Load Balancing**: Round-robin across backend replicas
- **Rate Limiting**: 100 requests/minute per IP on `/api/*` routes
- **Burst**: 20 requests allowed with `nodelay`
- **Health Check**: `/health` endpoint bypasses rate limiting

### Security Headers

```nginx
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
```

### Timeouts

```nginx
proxy_connect_timeout: 60s
proxy_send_timeout: 60s
proxy_read_timeout: 60s
```

### Static File Caching

- Images, CSS, JS cached for 1 year
- Cache-Control: `public, immutable`

## Data Persistence

Docker volumes for persistent data:

```yaml
volumes:
  - postgres-data      # PostgreSQL database
  - redis-data         # Redis cache
  - grafana-data       # Grafana dashboards & config
  - prometheus-data    # Prometheus time-series data
  - loki-data          # Loki log storage
  - rabbitmq-data      # RabbitMQ messages & config
```

## Health Checks

### PostgreSQL

```bash
pg_isready -U postgres
# Interval: 10s, Timeout: 5s, Retries: 5
```

### Redis

```bash
redis-cli ping
# Interval: 10s, Timeout: 3s, Retries: 5
```

### RabbitMQ

```bash
rabbitmq-diagnostics -q ping
# Interval: 30s, Timeout: 10s, Retries: 5
```

## Development Mode

For local development with hot reload:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

This enables:
- Source code mounting for backend (`nodeapp/src`)
- `tsx watch` for automatic restart on changes
- Development environment variables
- Faster iteration cycle

## Networking

All services communicate over a custom bridge network:

```yaml
networks:
  basic-network:
    driver: bridge
```

## Production Considerations

### Currently Implemented

- [x] Horizontal scaling with multiple replicas  
- [x] Health checks for critical services  
- [x] Log rotation and management  
- [x] Prometheus metrics collection  
- [x] Centralized logging with Loki  
- [x] Load balancing with Nginx  
- [x] Rate limiting on API endpoints  
- [x] Data persistence with volumes  

### Recommended Additions for Production

- [ ] **SSL/TLS**: Uncomment SSL configuration in nginx and add certificates  
- [ ] **Secrets Management**: Use Docker secrets instead of hardcoded credentials  
- [ ] **Database Replicas**: Add read replicas for PostgreSQL  
- [ ] **Container Monitoring**: Add Watchtower for automatic updates  
- [ ] **Alerting**: Integrate with PagerDuty or Slack  
- [ ] **Backup Strategy**: Implement automated backups for databases  
- [ ] **CI/CD Pipeline**: Add automated testing and deployment  

## Troubleshooting

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f database
```

### Check Service Health

```bash
# Backend health
curl http://localhost/health

# Prometheus targets
curl http://localhost:9090/api/v1/targets

# Loki readiness
curl http://localhost:3100/ready
```

### Restart Services

```bash
# Restart specific service
docker-compose restart backend

# Rebuild and restart
docker-compose up --build -d backend
```

## Common Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v

# View running containers
docker-compose ps

# Scale backend to 5 replicas
docker-compose up -d --scale backend=5

# Update and restart specific service
docker-compose up -d --build backend
```

## License

This is a template project for learning and experimentation. Use it however you want.

## Notes

- Database credentials are hardcoded for local development only
- SSL certificates are commented out but ready to enable in nginx config
