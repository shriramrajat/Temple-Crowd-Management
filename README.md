# 🕉️ Smart Darshan Slot Booking System

A modern, full-stack web application for managing temple darshan bookings with real-time crowd management, QR-based entry verification, and emergency alert systems.

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## 🌟 Features

### 👥 For Devotees
- 📅 **Smart Booking** - Book specific time slots with real-time availability
- 🔮 **Crowd Prediction** - AI-powered crowd forecasting and peak hour insights
- 📱 **Digital QR Passes** - Auto-generated QR codes for contactless entry
- ✉️ **Email Notifications** - Instant booking confirmations and reminders
- 🗺️ **Live Heatmap** - Real-time crowd density visualization
- 🚨 **Emergency SOS** - Quick access to emergency alerts and assistance
- ♿ **Accessibility Support** - Special accommodations and priority booking

### 👨‍💼 For Temple Administrators
- 📊 **Command Center** - Comprehensive dashboard with real-time analytics
- ⚙️ **Slot Management** - Dynamic slot configuration with capacity controls
- 👥 **Booking Oversight** - Advanced search, filter, and management tools
- 🚨 **Alert System** - Crowd risk monitoring and emergency management
- 📈 **Analytics** - Detailed reports on footfall, capacity, and trends
- 👷 **Volunteer Coordination** - Staff and volunteer management tools
- 🎯 **Performance Monitoring** - System health and optimization metrics

### 📱 For Temple Staff
- 📷 **QR Scanner** - Fast camera-based entry verification
- ✅ **Instant Validation** - Real-time booking verification
- 🚪 **Quick Check-in** - Streamlined entry process

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Resend account (for emails)

### Installation

```bash
# Navigate to project directory
cd TeamDigitalDaredevils

# Install dependencies
npm install

# Set up environment
npm run setup:env

# Generate secrets
npm run generate:secrets

# Set up database
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```

Visit http://localhost:3000 to see your app!

For detailed setup instructions, see [QUICKSTART.md](./QUICKSTART.md)

## 📚 Documentation

- **[Quick Start Guide](./QUICKSTART.md)** - Get up and running in minutes
- **[Deployment Guide](./DEPLOYMENT.md)** - Complete deployment instructions
- **[Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)** - Pre-deployment checklist

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI**: React 19, Radix UI, Tailwind CSS, shadcn/ui
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Email**: Resend
- **QR Codes**: qrcode, html5-qrcode
- **Forms**: React Hook Form + Zod
- **Deployment**: Vercel

## 📁 Project Structure

```
TeamDigitalDaredevils/
├── app/                    # Next.js app directory
│   ├── darshan/           # User-facing pages (booking flow)
│   ├── admin/             # Admin dashboard
│   ├── staff/             # Staff QR scanner
│   └── api/               # API routes
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Feature-specific components
├── lib/                   # Utilities and services
│   ├── services/         # Business logic services
│   ├── generated/        # Prisma client
│   └── utils.ts          # Helper functions
├── prisma/               # Database configuration
│   ├── schema.prisma     # Database schema
│   ├── seed.ts           # Seed script
│   └── migrations/       # Database migrations
├── public/               # Static assets
├── scripts/              # Helper scripts
│   ├── generate-secrets.js
│   └── setup-env.js
└── docs/                 # Additional documentation
```

## 🔐 Environment Variables

Required environment variables:

```env
DATABASE_URL=              # PostgreSQL connection string
NEXTAUTH_SECRET=           # NextAuth.js secret
NEXTAUTH_URL=              # Application URL
RESEND_API_KEY=            # Resend API key
EMAIL_FROM=                # Sender email address
QR_SECRET_KEY=             # QR code signing key
```

See [.env.example](./.env.example) for complete configuration.

## 🗄️ Database Schema

### Models
- **Slot**: Time slot configurations with capacity management
- **Booking**: User bookings with QR codes and status tracking
- **AdminUser**: Admin authentication and authorization

See [prisma/schema.prisma](./prisma/schema.prisma) for complete schema.

## 🔧 Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint

# Database
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed initial data
npm run db:generate      # Generate Prisma client
npm run db:studio        # Open Prisma Studio

# Deployment
npm run generate:secrets # Generate secure secrets
npm run setup:env        # Set up .env file
npm run vercel-build     # Vercel build command
```

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project to Vercel
3. Configure environment variables
4. Deploy!

For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

### Post-Deployment

```bash
# Run migrations
npm run db:migrate

# Seed database
npm run db:seed
```

## 🔒 Security Features

- ✅ Input validation with Zod schemas
- ✅ SQL injection protection via Prisma
- ✅ XSS protection (React default)
- ✅ CSRF protection
- ✅ Secure QR code signing
- ✅ Rate limiting ready
- ✅ Admin authentication
- ✅ Encrypted passwords (bcrypt)

## 📊 API Routes

### Public APIs
- `GET /api/slots` - Get available slots
- `POST /api/bookings` - Create booking
- `GET /api/bookings/[id]` - Get booking details
- `DELETE /api/bookings/[id]` - Cancel booking
- `POST /api/verify` - Verify QR code

### Admin APIs (Protected)
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/slots` - Manage slots
- `GET /api/admin/bookings` - Manage bookings

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Deployed on [Vercel](https://vercel.com/)

## 📞 Support

For issues or questions:
- Check the [documentation](./DEPLOYMENT.md)
- Open an issue on GitHub
- Contact the development team

---

**Made with ❤️ by Team Digital Daredevils**
