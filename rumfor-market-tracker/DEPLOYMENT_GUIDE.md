# Rumfor Market Tracker - Deployment Guide

## Overview

This guide covers deployment strategies for the Rumfor Market Tracker application, including Docker deployment, cloud hosting, and CI/CD pipelines.

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Docker (optional but recommended)
- GitLab account (for CI/CD)

## Environment Configuration

### Environment Variables

Create `.env` files for each environment:

#### Frontend (.env)
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_APP_ENV=production
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

#### Backend (.env)
```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rumfor-prod
JWT_SECRET=your_super_secure_jwt_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Deployment Options

### 1. Docker Deployment (Recommended)

#### Build Images

```bash
# Build frontend
cd rumfor-market-tracker
docker build -t rumfor-frontend:latest .

# Build backend
cd backend
docker build -t rumfor-backend:latest .
```

#### Docker Compose Production Setup

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: secure_password
    volumes:
      - mongodb_data:/data/db
      - ./init-mongo.js:/docker-entrypoint-initdb.d/init-mongo.js:ro
    networks:
      - rumfor-network

  backend:
    image: rumfor-backend:latest
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://admin:secure_password@mongodb:27017/rumfor-prod?authSource=admin
    ports:
      - "3001:3001"
    depends_on:
      - mongodb
    networks:
      - rumfor-network
    volumes:
      - ./backend/.env:/app/.env

  frontend:
    image: rumfor-frontend:latest
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - rumfor-network

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/ssl/certs:ro
    depends_on:
      - frontend
      - backend
    networks:
      - rumfor-network

volumes:
  mongodb_data:

networks:
  rumfor-network:
    driver: bridge
```

#### Deploy with Docker Compose

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 2. Cloud Deployment

#### AWS EC2 + Docker

```bash
# On EC2 instance
sudo apt update
sudo apt install docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker

# Clone and deploy
git clone https://gitlab.com/your-username/rumfor-market-tracker.git
cd rumfor-market-tracker
docker-compose -f docker-compose.prod.yml up -d
```

#### AWS ECS (Elastic Container Service)

1. **Create ECR Repositories**
```bash
aws ecr create-repository --repository-name rumfor-frontend
aws ecr create-repository --repository-name rumfor-backend
```

2. **Build and Push Images**
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account-id.dkr.ecr.us-east-1.amazonaws.com

# Tag and push
docker tag rumfor-frontend:latest your-account-id.dkr.ecr.us-east-1.amazonaws.com/rumfor-frontend:latest
docker push your-account-id.dkr.ecr.us-east-1.amazonaws.com/rumfor-frontend:latest
```

3. **ECS Task Definition**
```json
{
  "family": "rumfor-backend",
  "containerDefinitions": [{
    "name": "backend",
    "image": "your-account-id.dkr.ecr.us-east-1.amazonaws.com/rumfor-backend:latest",
    "memory": 512,
    "essential": true,
    "portMappings": [{
      "containerPort": 3001,
      "hostPort": 3001
    }],
    "environment": [
      {"name": "NODE_ENV", "value": "production"}
    ],
    "secrets": [
      {"name": "MONGODB_URI", "valueFrom": "arn:aws:secretsmanager:region:account:secret:mongodb-uri"},
      {"name": "JWT_SECRET", "valueFrom": "arn:aws:secretsmanager:region:account:secret:jwt-secret"}
    ]
  }]
}
```

#### AWS RDS (MongoDB Atlas Alternative)

```bash
# Create DocumentDB cluster
aws docdb create-db-cluster \
  --db-cluster-identifier rumfor-cluster \
  --engine docdb \
  --master-username admin \
  --master-user-password secure_password
```

### 3. Heroku Deployment

#### Backend Deployment

```bash
# Create Heroku app
heroku create rumfor-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=mongodb+srv://...
heroku config:set JWT_SECRET=your_jwt_secret

# Deploy
git push heroku main
```

#### Frontend Deployment

```bash
# Create Heroku app
heroku create rumfor-frontend

# Configure for SPA
heroku config:set NPM_CONFIG_PRODUCTION=false
echo "web: npm run build && npm run serve" > Procfile

# Deploy
git push heroku main
```

### 4. Vercel + Railway Deployment

#### Frontend on Vercel

```javascript
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://your-backend-railway-url.com/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### Backend on Railway

```toml
# railway.toml
[build]
builder = "NIXPACKS"

[deploy]
healthcheckPath = "/api/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"

[environment]
NODE_ENV = "production"
```

## GitLab CI/CD Pipeline

### Comprehensive Pipeline (.gitlab-ci.yml)

```yaml
stages:
  - test
  - build
  - security
  - deploy

variables:
  DOCKER_TLS_CERTDIR: "/certs"

# Testing Stage
test:frontend:
  stage: test
  image: node:18
  before_script:
    - npm ci
  script:
    - npm run type-check
    - npm run lint:ci
  artifacts:
    reports:
      junit: reports/junit.xml
    paths:
      - reports/
  only:
    - merge_requests

test:backend:
  stage: test
  image: node:18
  services:
    - mongo:latest
  variables:
    MONGODB_URI: mongodb://mongo/rumfor-test
  before_script:
    - cd backend
    - npm ci
  script:
    - npm test
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'
  only:
    - merge_requests

test:e2e:
  stage: test
  image: mcr.microsoft.com/playwright:v1.40.0-jammy
  before_script:
    - npm ci
    - npx playwright install
  script:
    - npm run test:e2e:ci
  artifacts:
    when: always
    paths:
      - e2e-tests/test-results/
    expire_in: 7 days
  only:
    - merge_requests

# Build Stage
build:frontend:
  stage: build
  image: docker:24.0.5
  services:
    - docker:24.0.5-dind
  before_script:
    - docker info
  script:
    - docker build -t $CI_REGISTRY_IMAGE/frontend:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE/frontend:$CI_COMMIT_SHA
  only:
    - main
    - develop

build:backend:
  stage: build
  image: docker:24.0.5
  services:
    - docker:24.0.5-dind
  script:
    - docker build -t $CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHA backend/
    - docker push $CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHA
  only:
    - main
    - develop

# Security Stage
security:scan:
  stage: security
  image: docker:24.0.5
  services:
    - docker:24.0.5-dind
  script:
    - docker run --rm -v $(pwd):/app -w /app npm audit --audit-level high --json > security-audit.json
    - |
      if [ $(jq '.metadata.vulnerabilities.high' security-audit.json) -gt 0 ]; then
        echo "High severity vulnerabilities found!"
        exit 1
      fi
  artifacts:
    paths:
      - security-audit.json
    expire_in: 1 week
  only:
    - main
    - develop

# Deploy Stage
deploy:staging:
  stage: deploy
  script:
    - echo "Deploying to staging environment"
    - docker pull $CI_REGISTRY_IMAGE/frontend:$CI_COMMIT_SHA
    - docker pull $CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHA
    - docker stack deploy --compose-file docker-compose.staging.yml rumfor-staging
  environment:
    name: staging
    url: https://staging.rumfor-market.com
  only:
    - develop

deploy:production:
  stage: deploy
  script:
    - echo "Deploying to production"
    - docker pull $CI_REGISTRY_IMAGE/frontend:$CI_COMMIT_SHA
    - docker pull $CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHA
    - docker service update --image $CI_REGISTRY_IMAGE/frontend:$CI_COMMIT_SHA rumfor_frontend
    - docker service update --image $CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHA rumfor_backend
  environment:
    name: production
    url: https://rumfor-market.com
  when: manual
  only:
    - main
```

### Environment Variables for CI/CD

#### GitLab Variables (Settings > CI/CD > Variables)

```
# Production Environment Variables
MONGODB_URI_PROD=mongodb+srv://prod-user:password@cluster.mongodb.net/rumfor-prod
JWT_SECRET_PROD=your-production-jwt-secret
EMAIL_USER_PROD=your-production-email@gmail.com
EMAIL_PASS_PROD=your-production-email-password
CLOUDINARY_CLOUD_NAME_PROD=your-prod-cloud-name
GOOGLE_MAPS_API_KEY_PROD=your-prod-maps-key

# Staging Environment Variables
MONGODB_URI_STAGING=mongodb+srv://staging-user:password@cluster.mongodb.net/rumfor-staging
JWT_SECRET_STAGING=your-staging-jwt-secret
```

## Monitoring and Logging

### Application Monitoring

#### Install PM2 for Process Management

```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

#### PM2 Ecosystem Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'rumfor-backend',
    script: 'src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
```

### Health Checks

#### Backend Health Endpoint

```javascript
// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    await mongoose.connection.db.admin().ping()

    // Check external services
    // await externalService.ping()

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version
    })
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    })
  }
})
```

### Log Management

#### Winston Logger Configuration

```javascript
// backend/src/utils/logger.js
const winston = require('winston')

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'rumfor-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }))
}

module.exports = logger
```

## SSL/TLS Configuration

### Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Nginx SSL Configuration

```nginx
# /etc/nginx/sites-available/rumfor
server {
    listen 80;
    server_name yourdomain.com api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:80;  # Frontend
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Rate limiting
        limit_req zone=api burst=10 nodelay;
    }
}
```

## Backup and Recovery

### MongoDB Backup Strategy

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --db rumfor-prod --out /backups/backup_$DATE
find /backups -name "backup_*" -mtime +7 -delete

# Restore from backup
mongorestore --db rumfor-prod /backups/backup_20240101_120000/rumfor-prod
```

### Automated Backups with Cron

```bash
# Add to crontab
0 2 * * * /path/to/backup-script.sh
```

## Performance Optimization

### Database Optimization

```javascript
// Add indexes for performance
db.markets.createIndex({ location: "2dsphere" })
db.markets.createIndex({ category: 1, isActive: 1 })
db.users.createIndex({ email: 1 }, { unique: true })
db.applications.createIndex({ vendor: 1, market: 1 }, { unique: true })
```

### Caching Strategy

#### Redis for Session Storage

```javascript
const redis = require('redis')
const session = require('express-session')
const RedisStore = require('connect-redis')(session)

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
})

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
```

### CDN for Static Assets

```nginx
location /static/ {
    proxy_pass https://cdn.yourdomain.com;
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Troubleshooting Deployment

### Common Issues

1. **Port conflicts**
   ```bash
   sudo lsof -i :3001
   sudo netstat -tulpn | grep :3001
   ```

2. **MongoDB connection issues**
   ```bash
   # Test connection
   mongo "mongodb://username:password@localhost:27017/rumfor-prod"
   ```

3. **SSL certificate issues**
   ```bash
   # Check certificate
   openssl s_client -connect yourdomain.com:443
   ```

4. **Memory issues**
   ```bash
   # Monitor memory usage
   htop
   # PM2 monitoring
   pm2 monit
   ```

### Rollback Strategy

```bash
# Docker rollback
docker service rollback rumfor_backend

# Git rollback
git reset --hard HEAD~1
git push --force
```

---

*This deployment guide provides multiple paths to production. Choose the strategy that best fits your infrastructure and scaling needs.*