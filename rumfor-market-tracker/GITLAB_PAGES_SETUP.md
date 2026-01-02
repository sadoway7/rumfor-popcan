# GitLab Pages Deployment Setup Guide

## Overview
GitLab Pages is a static site hosting service that allows you to host your React application directly from your GitLab repository. This guide covers setting up GitLab Pages for the Rumfor Market Tracker application.

## Prerequisites
1. GitLab account with a project created
2. Your project pushed to GitLab repository
3. Build artifacts in the `dist/` directory

## GitLab Pages Configuration

### 1. Enable GitLab Pages
1. Go to your GitLab project
2. Navigate to **Settings** > **Pages**
3. Enable GitLab Pages
4. Set the source to "GitLab CI/CD"
5. Save changes

### 2. Pages Job in .gitlab-ci.yml
The GitLab CI/CD pipeline already includes a `pages` job that:
- Builds the React application
- Copies the `dist/` directory to `public/`
- Deploys to GitLab Pages

### 3. Project URL Structure
Your site will be available at:
- **Development**: `https://your-project.gitlab.io/rumfor-market-tracker/`
- **Production**: `https://your-username.gitlab.io/rumfor-market-tracker/`

### 4. Custom Domain Configuration (Optional)
1. Go to **Settings** > **Pages**
2. Add your custom domain (e.g., `app.yourdomain.com`)
3. Configure DNS records as instructed
4. Enable HTTPS (automatic with Let's Encrypt)

## Environment-Specific Deployment

### Development Branch (develop)
```yaml
pages:
  stage: deploy
  only:
    - develop
  script:
    - npm run build
    - mkdir -p public
    - cp -r dist/* public/
    - echo "Development deployment completed"
```

### Production Branch (main)
```yaml
pages:
  stage: deploy
  only:
    - main
  script:
    - npm run build
    - mkdir -p public
    - cp -r dist/* public/
    - echo "Production deployment completed"
```

## Advanced Configuration

### 1. Environment Variables for Pages
Configure these variables in **Settings** > **CI/CD** > **Variables**:
- `VITE_API_BASE_URL`: Your API endpoint
- `VITE_ENVIRONMENT`: "production" or "development"

### 2. Custom nginx Configuration
Create a `public/nginx.conf` file for custom server configuration:
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. Redirects Configuration
Create a `public/_redirects` file for SPA routing:
```
/*    /index.html   200
```

## GitLab Pages Build Process

### 1. Build Stage
```yaml
build_pages:
  stage: build
  script:
    - npm install
    - npm run build
  artifacts:
    paths:
      - public/
    expire_in: 1 week
  only:
    - main
    - develop
```

### 2. Deploy Stage
```yaml
deploy_pages:
  stage: deploy
  dependencies:
    - build_pages
  script:
    - echo "Deploying to GitLab Pages..."
  artifacts:
    paths:
      - public/
  only:
    - main
    - develop
```

## Domain and SSL Configuration

### 1. Custom Domain Setup
1. **DNS Configuration**: Add a CNAME record pointing to `your-project.gitlab.io`
2. **GitLab Pages Settings**: Add the domain in Pages settings
3. **SSL Certificate**: Automatically provided by Let's Encrypt

### 2. HTTPS Enforcement
Create a `public/.htaccess` file:
```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

## Performance Optimization

### 1. Gzip Compression
The nginx configuration already includes gzip compression for:
- JavaScript files
- CSS files
- HTML files
- JSON responses

### 2. Browser Caching
Static assets are cached for 1 year with immutable headers.

### 3. CDN Integration
GitLab Pages automatically provides CDN for static assets.

## Monitoring and Analytics

### 1. Build Status Badges
Add to your README.md:
```markdown
[![Pages Build Status](https://gitlab.com/your-username/your-project/-/badges/main/pipeline.svg)](https://gitlab.com/your-username/your-project/-/commits/main)
```

### 2. Analytics Integration
Configure Google Analytics or other tracking services in your React app.

## Troubleshooting

### Common Issues
1. **404 Errors**: Check that `public/` directory contains `index.html`
2. **Build Failures**: Verify Node.js version compatibility
3. **Routing Issues**: Ensure SPA redirects are configured

### Debug Steps
1. Check build logs in GitLab CI/CD
2. Verify artifact paths
3. Test locally with `npm run build && npm run preview`

## Security Considerations

### 1. Environment Variables
- Never commit secrets to the repository
- Use GitLab CI/CD variables for sensitive data
- Enable protected variables for production

### 2. Content Security Policy
Add CSP headers in your nginx configuration:
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

### 3. HTTPS Requirements
- Always use HTTPS in production
- Enable HSTS headers
- Use secure cookies if applicable

## Deployment Checklist

- [ ] GitLab Pages enabled in project settings
- [ ] Pages job configured in .gitlab-ci.yml
- [ ] Environment variables set
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate obtained
- [ ] Build status badge added to README
- [ ] Performance monitoring configured
- [ ] Security headers implemented