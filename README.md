# DevMarket - Digital Products Marketplace

A full-featured digital products marketplace built with **Next.js 16**, **TypeScript**, **Tailwind CSS**, **Prisma**, and **Auth.js v5**. Perfect for selling and buying digital courses and learning resources.

## Features

### 🛍️ Marketplace Features
- **Course Catalog**: Browse and search thousands of courses
- **Advanced Filtering**: Filter by level, category, and price
- **Course Details**: Comprehensive course information with modules and lessons
- **Shopping Cart**: Add courses to cart and manage items
- **Secure Checkout**: Integrated Stripe payment processing
- **Order Management**: Track orders and purchase history

### 👥 User Management
- **User Authentication**: Secure registration and login with Auth.js v5
- **Role-Based Access**: Buyer and Seller roles
- **User Profiles**: Manage profile information and settings
- **Session Management**: Persistent user sessions

### 👨‍🏫 Seller Features
- **Seller Dashboard**: Comprehensive dashboard with statistics
- **Course Management**: Create, edit, and publish courses
- **Analytics**: Track course performance and earnings
- **Student Management**: View enrolled students and their progress
- **Course Modules**: Organize courses into modules and lessons

### ⭐ Reviews & Ratings
- **Course Reviews**: Students can leave reviews and ratings
- **Rating System**: 5-star rating system with comments
- **Review Management**: View and manage course reviews
- **Average Ratings**: Automatic calculation of course ratings

### 💳 Payment Processing
- **Stripe Integration**: Secure payment processing
- **Multiple Courses**: Purchase multiple courses in one checkout
- **Order Confirmation**: Email confirmation after purchase
- **Refund Management**: Handle refunds and cancellations

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Next.js 16** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first CSS framework |
| **Prisma** | ORM for database management |
| **Auth.js v5** | Authentication and authorization |
| **Stripe** | Payment processing |
| **PostgreSQL** | Primary database |
| **React Server Components** | Server-side rendering |
| **Server Actions** | Server-side mutations |

## Getting Started

### Prerequisites

- **Node.js**: v18 or higher
- **pnpm**: v11 or higher (or npm/yarn)
- **PostgreSQL**: v12 or higher (or any Prisma-supported database)
- **Stripe Account**: For payment processing

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd devmarket
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` and configure:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/devmarket"

# Auth.js
NEXTAUTH_SECRET="generate-a-random-string"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

4. **Set up the database**
```bash
pnpm prisma migrate dev --name init
```

5. **Generate Prisma client**
```bash
pnpm prisma generate
```

6. **Run the development server**
```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
devmarket/
├── app/
│   ├── api/                    # API routes and handlers
│   │   ├── auth/              # Authentication routes
│   │   ├── courses/           # Course API endpoints
│   │   ├── cart/              # Shopping cart endpoints
│   │   ├── checkout/          # Payment processing
│   │   ├── reviews/           # Review endpoints
│   │   ├── seller/            # Seller-specific endpoints
│   │   └── my-courses/        # Student course endpoints
│   ├── auth/                   # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── courses/                # Course pages
│   │   ├── page.tsx           # Course listing
│   │   └── [slug]/            # Course detail
│   ├── seller/                 # Seller pages
│   │   ├── dashboard/
│   │   └── courses/
│   ├── cart/                   # Shopping cart page
│   ├── checkout/               # Checkout pages
│   ├── my-courses/             # Student courses page
│   └── layout.tsx              # Root layout
├── components/
│   ├── header.tsx              # Navigation header
│   ├── footer.tsx              # Footer
│   ├── course-card.tsx         # Course card component
│   ├── reviews-section.tsx     # Reviews component
│   └── ui/                     # Reusable UI components
├── lib/
│   ├── prisma.ts               # Prisma client
│   ├── utils.ts                # Utility functions
│   └── validations/            # Zod schemas
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Database migrations
├── middleware.ts               # Next.js middleware
├── auth.ts                     # Auth.js configuration
├── auth.config.ts              # Auth.js config
└── .env.local                  # Environment variables
```

## Database Schema

### Core Models
- **User**: User accounts with roles (BUYER, SELLER, ADMIN)
- **Course**: Digital courses with metadata
- **Module**: Course modules/sections
- **Lesson**: Individual lessons within modules
- **Enrollment**: Student enrollment tracking
- **Review**: Course reviews and ratings
- **CartItem**: Shopping cart items
- **Order**: Purchase orders
- **OrderItem**: Items in orders
- **Notification**: User notifications

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/signin` - Sign in user
- `POST /api/auth/signout` - Sign out user

### Courses
- `GET /api/courses` - List all published courses
- `GET /api/courses/[slug]` - Get course details
- `POST /api/seller/courses` - Create new course
- `PUT /api/seller/courses/[id]` - Update course
- `DELETE /api/seller/courses/[id]` - Delete course
- `POST /api/seller/courses/[id]/publish` - Publish course

### Shopping Cart
- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add item to cart
- `DELETE /api/cart/[id]` - Remove item from cart

### Checkout
- `POST /api/checkout` - Create checkout session
- `POST /api/checkout/verify` - Verify payment

### Reviews
- `GET /api/reviews` - Get course reviews
- `POST /api/reviews` - Create review

### Student Courses
- `GET /api/my-courses` - Get enrolled courses

## Deployment

### Deploy to Vercel

1. **Push to GitHub**
```bash
git push origin main
```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Add environment variables
   - Deploy

3. **Set up database**
   - Use Vercel Postgres or your own PostgreSQL instance
   - Update `DATABASE_URL` in Vercel environment variables

4. **Run migrations**
```bash
pnpm prisma migrate deploy
```

### Environment Variables for Production
```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_SECRET="generate-a-strong-secret"
NEXTAUTH_URL="https://your-domain.com"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## Development

### Running Tests
```bash
pnpm test
```

### Linting
```bash
pnpm lint
```

### Format Code
```bash
pnpm format
```

### Database Management
```bash
# Open Prisma Studio
pnpm prisma studio

# Create migration
pnpm prisma migrate dev --name migration-name

# Reset database
pnpm prisma migrate reset
```

## Authentication Flow

1. **Registration**: Users create account with email and password
2. **Login**: Credentials validated against database
3. **Session**: Auth.js creates secure session token
4. **Protected Routes**: Middleware checks session for protected pages
5. **Role-Based Access**: Routes check user role (BUYER/SELLER)

## Payment Flow

1. **Add to Cart**: User adds courses to cart
2. **Checkout**: User proceeds to checkout
3. **Stripe Session**: Create Stripe checkout session
4. **Payment**: User completes payment on Stripe
5. **Verification**: Verify payment and create order
6. **Enrollment**: Create course enrollments
7. **Confirmation**: Show success page

## Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **Session Management**: Auth.js secure session handling
- **CSRF Protection**: Built-in Next.js CSRF protection
- **Input Validation**: Zod schemas for input validation
- **Role-Based Access**: Middleware for route protection
- **Secure Payments**: Stripe integration for PCI compliance

## Performance Optimizations

- **Server Components**: React Server Components by default
- **Image Optimization**: Next.js Image component
- **Database Indexing**: Optimized Prisma queries
- **Caching**: Vercel automatic caching
- **Code Splitting**: Automatic code splitting

## Troubleshooting

### Database Connection Issues
```bash
# Test database connection
pnpm prisma db push

# Check connection string
echo $DATABASE_URL
```

### Authentication Issues
```bash
# Verify NEXTAUTH_SECRET is set
echo $NEXTAUTH_SECRET

# Check Auth.js configuration
cat auth.config.ts
```

### Stripe Integration Issues
```bash
# Verify Stripe keys
echo $STRIPE_SECRET_KEY
echo $NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

# Test Stripe connection in API routes
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@devmarket.com or open an issue on GitHub.

## Roadmap

- [ ] Mobile app with React Native
- [ ] Live video streaming
- [ ] Discussion forums
- [ ] Certificates and badges
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] API for third-party integrations
- [ ] Affiliate program

## Changelog

### Version 1.0.0 (Initial Release)
- Core marketplace functionality
- User authentication
- Course management
- Shopping cart and checkout
- Reviews and ratings
- Seller dashboard

---

**Built with ❤️ using Next.js 16**
