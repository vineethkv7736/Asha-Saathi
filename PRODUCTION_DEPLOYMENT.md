# Production Deployment Guide for BabyAssist AI

This guide covers deploying the BabyAssist AI application to production with security best practices.

## 🚀 **Pre-Deployment Checklist**

### **1. Environment Variables**
Ensure all production environment variables are set:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-production-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Security (Optional)
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.com
```

### **2. Supabase Production Setup**

#### **Database Security**
1. **Enable Row Level Security (RLS)** on all tables
2. **Set up proper RLS policies** for data isolation
3. **Configure backup schedules** (daily backups recommended)
4. **Enable point-in-time recovery**

#### **Authentication Settings**
1. **Enable email confirmation** for new users
2. **Configure password reset** functionality
3. **Set up proper redirect URLs**
4. **Enable rate limiting** on auth endpoints

#### **API Security**
1. **Configure CORS** with your domain
2. **Set up API rate limiting**
3. **Enable request logging**
4. **Configure IP allowlisting** if needed

### **3. Security Hardening**

#### **Password Policy**
- Minimum 8 characters
- Require uppercase, lowercase, numbers, and special characters
- Password history (prevent reuse of last 5 passwords)
- Account lockout after 5 failed attempts

#### **Session Management**
- Secure session cookies with `httpOnly` and `secure` flags
- Implement session timeout (8 hours for production)
- Enable session rotation on privilege escalation

#### **Data Protection**
- Encrypt sensitive data at rest
- Use HTTPS for all communications
- Implement proper data backup and recovery

## 🏗️ **Deployment Options**

### **Option 1: Vercel (Recommended)**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

### **Option 2: AWS Amplify**

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

### **Option 3: Docker Deployment**

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

## 🔒 **Security Checklist**

### **Application Security**
- [ ] Input validation and sanitization
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Rate limiting implemented
- [ ] Error handling without information disclosure

### **Infrastructure Security**
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Content Security Policy (CSP) set
- [ ] HSTS enabled
- [ ] Secure cookie settings
- [ ] Environment variables secured

### **Database Security**
- [ ] RLS policies configured
- [ ] Database backups enabled
- [ ] Connection encryption (SSL/TLS)
- [ ] Access logging enabled
- [ ] Regular security updates

## 📊 **Monitoring & Logging**

### **Application Monitoring**
```javascript
// Add to your application
import { productionConfig } from '@/lib/production-config';

// Health check endpoint
export async function GET() {
  try {
    // Check database connection
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      return Response.json({ status: 'error', message: 'Database connection failed' }, { status: 500 });
    }
    
    return Response.json({ status: 'healthy', timestamp: new Date().toISOString() });
  } catch (error) {
    return Response.json({ status: 'error', message: 'Health check failed' }, { status: 500 });
  }
}
```

### **Error Tracking**
Consider integrating error tracking services:
- **Sentry**: For error monitoring and performance tracking
- **LogRocket**: For session replay and debugging
- **New Relic**: For application performance monitoring

## 🔄 **CI/CD Pipeline**

### **GitHub Actions Example**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 📈 **Performance Optimization**

### **Build Optimization**
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },
  images: {
    domains: ['your-image-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
}

module.exports = nextConfig
```

### **Database Optimization**
- Create indexes on frequently queried columns
- Use connection pooling
- Implement query caching where appropriate
- Monitor slow queries and optimize

## 🚨 **Incident Response**

### **Security Incident Response Plan**
1. **Detection**: Monitor logs and alerts
2. **Assessment**: Evaluate the scope and impact
3. **Containment**: Isolate affected systems
4. **Eradication**: Remove the threat
5. **Recovery**: Restore normal operations
6. **Lessons Learned**: Document and improve

### **Contact Information**
- **Security Team**: security@your-domain.com
- **DevOps Team**: devops@your-domain.com
- **Emergency Contact**: +1-XXX-XXX-XXXX

## 📋 **Post-Deployment Checklist**

- [ ] All environment variables configured
- [ ] Database migrations completed
- [ ] SSL certificate installed and valid
- [ ] Monitoring and alerting configured
- [ ] Backup systems tested
- [ ] Performance benchmarks established
- [ ] Security scan completed
- [ ] User acceptance testing passed
- [ ] Documentation updated
- [ ] Team trained on new deployment

## 🔄 **Maintenance Schedule**

### **Daily**
- Monitor application health
- Check error rates and performance
- Review security alerts

### **Weekly**
- Review access logs
- Update dependencies
- Backup verification

### **Monthly**
- Security audit
- Performance review
- Capacity planning

### **Quarterly**
- Penetration testing
- Disaster recovery drill
- Compliance review

---

**Remember**: Security is an ongoing process, not a one-time setup. Regularly review and update your security measures based on new threats and best practices. 