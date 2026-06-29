# DevMarket Deployment Guide

This guide provides step-by-step instructions for deploying DevMarket to production on Vercel.

## Prerequisites

Before deploying, ensure you have:

1. **GitHub Account**: For version control and Vercel integration
2. **Vercel Account**: Free tier available at [vercel.com](https://vercel.com)
3. **PostgreSQL Database**: 
   - Option A: Vercel Postgres (recommended)
   - Option B: External PostgreSQL provider (Neon, Railway, etc.)
4. **Stripe Account**: For payment processing at [stripe.com](https://stripe.com)
5. **Domain Name** (optional): For custom domain

## Step 1: Prepare Your Repository

### 1.1 Initialize Git Repository
```bash
cd /home/ubuntu/devmarket
git init
git add .
git commit -m "Initial commit: DevMarket marketplace"
```

### 1.2 Create GitHub Repository
1. Go to [github.com/new](https://github.com/new)
2. Create a new repository named `devmarket`
3. Push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/devmarket.git
git branch -M main
git push -u origin main
```

## Step 2: Set Up Database

### Option A: Vercel Postgres (Recommended)

1. Go to [vercel.com/storage](https://vercel.com/storage)
2. Click "Create Database" → "Postgres"
3. Select your region and create
4. Copy the connection string (you'll need this later)

### Option B: External PostgreSQL Provider

**Using Neon:**
1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string

**Using Railway:**
1. Go to [railway.app](https://railway.app)
2. Create a new project
3. Add PostgreSQL plugin
4. Copy the connection string

## Step 3: Configure Stripe

### 3.1 Get Stripe Keys
1. Go to [stripe.com/dashboard](https://stripe.com/dashboard)
2. Navigate to "Developers" → "API Keys"
3. Copy:
   - **Publishable Key** (starts with `pk_`)
   - **Secret Key** (starts with `sk_`)

### 3.2 Create Webhook Endpoint
1. Go to "Developers" → "Webhooks"
2. Click "Add endpoint"
3. Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Webhook Secret** (starts with `whsec_`)

## Step 4: Deploy to Vercel

### 4.1 Connect Repository
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Select "Next.js" framework
4. Click "Deploy"

### 4.2 Add Environment Variables
After deployment starts, go to "Settings" → "Environment Variables" and add:

```env
# Database
DATABASE_URL=postgresql://user:password@host/database

# Auth.js
NEXTAUTH_SECRET=your-random-secret-key-here
NEXTAUTH_URL=https://your-domain.vercel.app

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4.3 Generate NEXTAUTH_SECRET
```bash
# Generate a secure random string
openssl rand -base64 32
```

## Step 5: Run Database Migrations

After deployment, run migrations:

```bash
# Connect to Vercel
vercel env pull

# Run migrations
pnpm prisma migrate deploy

# Seed database (optional)
pnpm prisma db seed
```

## Step 6: Verify Deployment

1. **Visit Your Site**: Go to `https://your-domain.vercel.app`
2. **Test Authentication**: 
   - Register a new account
   - Log in
   - Verify session works
3. **Test Marketplace**:
   - Browse courses
   - Add course to cart
   - Test checkout (use Stripe test card: `4242 4242 4242 4242`)
4. **Test Seller Features**:
   - Create a course as seller
   - Publish course
   - Verify it appears in marketplace

## Step 7: Configure Custom Domain (Optional)

1. In Vercel project settings, go to "Domains"
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` environment variable:
   ```env
   NEXTAUTH_URL=https://your-custom-domain.com
   ```

## Step 8: Set Up Monitoring

### 8.1 Enable Analytics
1. In Vercel project settings, enable "Web Analytics"
2. Monitor performance metrics

### 8.2 Set Up Error Tracking
Consider adding error tracking service:
- Sentry: [sentry.io](https://sentry.io)
- LogRocket: [logrocket.com](https://logrocket.com)

## Production Checklist

- [ ] Database is configured and migrations are run
- [ ] All environment variables are set
- [ ] Stripe webhook is configured
- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] NEXTAUTH_URL matches your domain
- [ ] Custom domain is configured (if applicable)
- [ ] SSL certificate is valid
- [ ] Email notifications are working
- [ ] Backup strategy is in place
- [ ] Monitoring and logging are enabled

## Troubleshooting

### Database Connection Error
```bash
# Verify connection string
vercel env pull
echo $DATABASE_URL

# Test connection
pnpm prisma db push
```

### Authentication Issues
```bash
# Verify NEXTAUTH_SECRET is set
vercel env list

# Check Auth.js configuration
cat auth.config.ts
```

### Stripe Payment Failures
1. Verify Stripe keys are correct
2. Check webhook endpoint is receiving events
3. Review Stripe dashboard for error logs
4. Test with Stripe test cards

### Build Failures
```bash
# Check build logs in Vercel dashboard
# Common issues:
# - TypeScript errors: Fix type issues
# - Missing dependencies: Run pnpm install
# - Environment variables: Verify all are set
```

## Performance Optimization

### 1. Enable Caching
```typescript
// In your API routes
export const revalidate = 60; // Cache for 60 seconds
```

### 2. Use Image Optimization
```typescript
import Image from "next/image";

<Image
  src={url}
  alt="description"
  width={300}
  height={200}
  priority={false}
/>
```

### 3. Database Query Optimization
```typescript
// Use Prisma select to fetch only needed fields
const courses = await prisma.course.findMany({
  select: {
    id: true,
    title: true,
    price: true,
  },
});
```

## Scaling Considerations

### Database Scaling
- Monitor connection pool usage
- Consider read replicas for high traffic
- Use database indexes for common queries

### API Rate Limiting
```typescript
// Implement rate limiting for API routes
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 h"),
});
```

### CDN Configuration
- Vercel automatically uses Edge Network
- Configure cache headers for static assets
- Use Image Optimization for images

## Security Hardening

### 1. Environment Variables
- Never commit `.env.local` to git
- Use strong, unique secrets
- Rotate secrets regularly

### 2. Database Security
- Use strong passwords
- Enable SSL connections
- Restrict database access by IP
- Regular backups

### 3. API Security
- Implement rate limiting
- Validate all inputs
- Use HTTPS only
- Set security headers

### 4. Payment Security
- Never log sensitive payment data
- Use Stripe-hosted checkout
- Follow PCI compliance
- Regular security audits

## Backup and Recovery

### 1. Database Backups
```bash
# Export database
pg_dump $DATABASE_URL > backup.sql

# Restore database
psql $DATABASE_URL < backup.sql
```

### 2. Code Backups
- GitHub is your code backup
- Use branch protection rules
- Require pull request reviews

## Monitoring and Logging

### 1. Application Logs
```bash
# View Vercel logs
vercel logs

# View specific deployment
vercel logs --follow
```

### 2. Database Monitoring
```bash
# Connect to database
psql $DATABASE_URL

# Check connection count
SELECT count(*) FROM pg_stat_activity;
```

### 3. Stripe Monitoring
- Monitor webhook delivery in Stripe dashboard
- Check payment success rate
- Review failed transactions

## Maintenance

### Regular Tasks
- **Weekly**: Review error logs
- **Monthly**: Update dependencies
- **Quarterly**: Security audit
- **Annually**: Full system review

### Update Process
```bash
# Update dependencies
pnpm update

# Run tests
pnpm test

# Deploy to staging
git push origin staging

# Deploy to production
git push origin main
```

## Support and Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Prisma Docs**: [prisma.io/docs](https://prisma.io/docs)
- **Auth.js Docs**: [authjs.dev](https://authjs.dev)
- **Stripe Docs**: [stripe.com/docs](https://stripe.com/docs)

---

**Need help?** Create an issue on GitHub or contact support@devmarket.com
