# Production Deployment Guide - Rumfor Market Tracker

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [SSL Certificate Setup](#ssl-certificate-setup)
4. [CI/CD Pipeline Configuration](#cicd-pipeline-configuration)
5. [Deployment Procedure](#deployment-procedure)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Monitoring & Alerting Setup](#monitoring--alerting-setup)
8. [Rollback Procedures](#rollback-procedures)
9. [Scaling & Performance](#scaling--performance)
10. [Security Checklist](#security-checklist)

## Prerequisites

### Infrastructure Requirements
- Docker >= 24.0
- Docker Compose >= 2.0
- Node.js >= 18.0.0
- MongoDB >= 5.0 (Atlas recommended for production)
- SSL certificates (Let's Encrypt or commercial)

### Network Configuration
- Domain: rumfor.sadoway.ca (or production domain)
- HTTPS enforcement required
- Firewall configuration for ports 80, 443

### GitLab CI/CD Variables
Set the following in GitLab project settings:

```
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rumfor-prod

# Security (Generate strong random values)
JWT_SECRET=your-256-bit-jwt-secret-here
JWT_REFRESH_SECRET=your-256-bit-refresh-secret-here
SESSION_SECRET=your-256-bit-session-secret-here

# SSH Deployment
SSH_PRIVATE_KEY_BASE64=base64-encoded-private-key
UNRAID_IP=your-server-ip
DEPLOY_PATH=/path/to/deployment/directory

# Frontend
VITE_API_BASE_URL=https://rumfor.sadoway.ca/api
```

## Environment Setup

### 1. Server Preparation
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com | sh
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create deployment directory
sudo mkdir -p /opt/rumfor-market-tracker
sudo chown $USER:$USER /opt/rumfor-market-tracker
```

### 2. SSL Certificate Setup
```bash
# Using certbot for Let's Encrypt
sudo apt install snapd -y
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Generate certificate
sudo certbot certonly --standalone -d rumfor.sadoway.ca

# Create SSL directory and copy certificates
sudo mkdir -p /opt/rumfor/ssl
sudo cp /etc/letsencrypt/live/rumfor.sadoway.ca/fullchain.pem /opt/rumfor/ssl/
sudo cp /etc/letsencrypt/live/rumfor.sadoway.ca/privkey.pem /opt/rumfor/ssl/
sudo chown -R $USER:$USER /opt/rumfor/ssl
```

### 3. Environment Configuration
Create production environment files:

```bash
# Create .env file for frontend build
cat > rumfor-market-tracker/.env << EOF
VITE_API_BASE_URL=https://rumfor.sadoway.ca/api
EOF

# Backend environment is handled via GitLab CI variables
```

## CI/CD Pipeline Configuration

### GitLab CI Variables Setup
1. Navigate to Project Settings > CI/CD > Variables
2. Add all required variables listed in Prerequisites
3. Mark sensitive variables as "Protected" and "Masked"

### Pipeline Stages
The CI/CD pipeline includes:
- **Build**: Multi-stage Docker build with optimization
- **Test**: Unit tests, linting, security scanning, E2E tests
- **Deploy**: Automated deployment to production server

## Deployment Procedure

### Automated Deployment (via GitLab CI)

1. **Code Push**: Push changes to `master` branch
2. **Pipeline Trigger**: GitLab CI automatically builds and tests
3. **Manual Approval**: Review test results and approve deployment
4. **Automated Deploy**: Pipeline deploys to production server

### Manual Deployment (Emergency)

```bash
# On deployment server
cd /opt/rumfor-market-tracker

# Pull latest changes
git pull origin master

# Build and deploy
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Verify deployment
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f --tail=50
```

## Post-Deployment Verification

### Health Checks
```bash
# Check container status
docker-compose -f docker-compose.prod.yml ps

# Test health endpoints
curl -f https://rumfor.sadoway.ca/health
curl -f https://rumfor.sadoway.ca/api/health

# Test application functionality
curl -f https://rumfor.sadoway.ca/
```

### Functional Tests
Execute E2E tests against production:
```bash
cd e2e-tests
E2E_BASE_URL=https://rumfor.sadoway.ca npm run e2e:playwright
```

### Performance Verification
- Check Core Web Vitals in Chrome DevTools
- Verify API response times < 500ms
- Confirm database connection pool utilization

## Monitoring & Alerting Setup

### Application Performance Monitoring
```bash
# APM setup (example with New Relic)
npm install @newrelic/native-metrics
# Configure NEW_RELIC_LICENSE_KEY in environment
```

### Database Monitoring
- Enable MongoDB Atlas monitoring
- Set up alerts for:
  - Connection pool exhaustion
  - Slow queries (>100ms)
  - Database size growth

### Error Tracking
Consider implementing:
- Sentry for error tracking
- LogRocket for user session replay
- DataDog for comprehensive monitoring

## Rollback Procedures

### Immediate Rollback
```bash
# Stop current deployment
docker-compose -f docker-compose.prod.yml down

# Deploy previous version
docker-compose -f docker-compose.prod.rollback.yml up -d

# Verify rollback success
curl -f https://rumfor.sadoway.ca/health
```

### Git-based Rollback
```bash
# Identify last working commit
git log --oneline -10

# Reset to previous commit
git reset --hard <previous-commit-hash>

# Rebuild and deploy
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

## Scaling & Performance

### Horizontal Scaling
```yaml
# docker-compose.prod.scaled.yml
version: '3.8'
services:
  backend:
    deploy:
      replicas: 3
    environment:
      - NODE_ENV=production
    # Load balancer configuration needed
```

### Database Scaling
- Implement read replicas for analytics queries
- Use MongoDB Atlas auto-scaling
- Configure connection pooling limits

### CDN Configuration
```nginx
# nginx.conf CDN configuration
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header X-CDN-Cache "HIT";
}
```

## Security Checklist

### Pre-deployment
- [ ] All secrets moved to environment variables
- [ ] SSL certificates installed and configured
- [ ] Firewall configured (ports 80, 443 only)
- [ ] Database encryption enabled
- [ ] Rate limiting configured

### Post-deployment
- [ ] Security headers verified (CSP, HSTS, X-Frame-Options)
- [ ] HTTPS enforcement working
- [ ] No sensitive data in logs
- [ ] API endpoints secured with authentication
- [ ] CSRF protection enabled

### Ongoing Security
- [ ] Regular dependency updates
- [ ] Security scanning in CI/CD
- [ ] Access log monitoring
- [ ] SSL certificate renewal automation
- [ ] Database backup encryption

## Performance Benchmarks

### Target Metrics
- **First Load**: <3 seconds
- **Subsequent Loads**: <1 second
- **API Response**: <500ms (95th percentile)
- **Core Web Vitals**:
  - LCP: <2.5s
  - FID: <100ms
  - CLS: <0.1

### Monitoring Commands
```bash
# Nginx performance
docker exec rumfor-app nginx -s reload
tail -f /var/log/nginx/access.log

# Application logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Database performance
mongosh "mongodb+srv://cluster.mongodb.net" --eval "db.serverStatus().connections"
```

## Incident Response

### Emergency Contacts
- DevOps Team: devops@rumfor.com
- Security Team: security@rumfor.com
- On-call Engineer: +1-555-0123

### Escalation Procedure
1. **P1 Incident**: Alert on-call engineer immediately
2. **P2 Incident**: Page within 15 minutes
3. **P3 Incident**: Create ticket, fix in next sprint

### Communication Plan
- Status updates every 30 minutes during incidents
- Post-mortem within 24 hours
- Stakeholder notification for >1 hour downtime

---

**Last Updated**: 2026-01-14
**Version**: 1.0
**Review Frequency**: Monthly