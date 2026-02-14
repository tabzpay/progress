# Progress - Loan & Lending Tracking Platform

> **Modern fintech application for managing personal and business loans, customer relationships, and payment tracking.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-3ECF8E)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC)](https://tailwindcss.com/)

---

## 📖 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Development](#development)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**Progress** is a comprehensive loan management platform designed for individuals and businesses to track lending activities, manage customer relationships, and monitor payment schedules. Built with modern web technologies and production-ready architecture.

### Key Capabilities:
- 💰 **Loan Management** - Personal, business, and group loans
- 👥 **Customer Management** - CRM for business lending
- 📊 **Analytics** - Credit health, payment tracking, utilization metrics
- 💳 **Payment Plans** - Flexible installment schedules
- 🔔 **Notifications** - Automated payment reminders
- 🔒 **Security** - Row-level security, encryption, MFA support

---

## ✨ Features

### Loan Management
- Create and track personal, business, and group loans
- Flexible repayment schedules (one-time, installments)
- Payment terms configuration (Net 7/15/30/60/90, Due on Receipt)
- Automated due date calculations
- Tax calculation and breakdown
- Payment history tracking

### Customer Management
- Individual and company customer profiles
- Credit limit tracking and validation
- Credit utilization monitoring
- Customer transaction history
- Multi-currency support
- Contact management

### Group Lending
- Create and manage lending groups
- Group member management
- Shared loan tracking
- Group analytics

### Analytics & Reporting
- Dashboard with key metrics
- Credit health scoring
- Payment trends
- Overdue tracking
- Custom reports

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Hook Form** - Form management
- **Zod** - Validation
- **React Query** (planned) - Data fetching
- **Zustand** (planned) - State management

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication & authorization
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Edge Functions

### Development Tools
- **ESLint** - Linting
- **Prettier** - Code formatting
- **TypeScript Strict Mode** - Enhanced type checking
- **Vitest** (planned) - Unit testing
- **Playwright** (planned) - E2E testing

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- Supabase account ([supabase.com](https://supabase.com))
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/tabzpay/progress.git
   cd progress
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run database migrations**
   See [Database Setup](#database-setup) section below.

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open browser**
   Navigate to `http://localhost:5173`

---

## 📁 Project Structure

```
progress/
├── src/
│   ├── app/                      # Application layer
│   │   ├── components/          # React components
│   │   │   ├── ui/             # Primitive components (Shadcn)
│   │   │   ├── features/       # Feature-specific components
│   │   │   └── ...             # Shared components
│   │   └── screens/            # Page-level components
│   ├── lib/                      # Business logic
│   │   ├── api/                # API client (planned)
│   │   ├── contexts/           # React contexts
│   │   ├── hooks/              # Custom hooks
│   │   ├── stores/             # State management (planned)
│   │   ├── types/              # TypeScript types
│   │   ├── utils/              # Utility functions
│   │   ├── constants.ts        # App constants
│   │   ├── supabase.ts         # Supabase client
│   │   └── ...                 # Other modules
│   ├── test/                     # Test utilities (planned)
│   └── styles/                   # Global styles
├── sql/                          # Database migrations
│   ├── customers_schema.sql
│   ├── loans_business_fields.sql
│   └── ...
├── public/                       # Static assets
├── docs/                         # Documentation (planned)
├── .env.example                  # Environment template
├── tsconfig.json                 # TypeScript config
├── vite.config.ts                # Vite config
├── eslint.config.js              # ESLint config
└── package.json                  # Dependencies

```

---

## 💻 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Run type checking
npm run type-check

# Format code
npm run format
```

### Code Quality

The project enforces strict quality standards:
- ✅ TypeScript strict mode enabled
- ✅ ESLint with complexity limits
- ✅ Prettier for consistent formatting
- ✅ Pre-commit hooks (planned)
- ✅ Component size limits (< 300 lines)
- ✅ Function complexity limits

### Adding New Features

1. Create feature branch: `git checkout -b feature/your-feature`
2. Develop with error boundaries and proper types
3. Update constants in `src/lib/constants.ts`
4. Add error handling using `errorHandler.ts` utilities
5. Write tests (when testing infrastructure is ready)
6. Submit pull request

---

## 🗄️ Database Setup

### Running Migrations

The `sql/` directory contains all database migrations. Run them in order:

```bash
# Using Supabase CLI (recommended)
supabase db push

# Or manually via Supabase Dashboard
# Copy contents of each .sql file and execute in SQL Editor
```

### Migration Files

1. `customers_schema.sql` - Customer and contact tables
2. `loans_business_fields.sql` - Business loan enhancements
3. `groups_enhancements.sql` - Group soft-delete
4. `groups_rls_policies.sql` - Group security policies

### Row Level Security (RLS)

All tables have RLS enabled. Policies ensure:
- Users only access their own data
- Proper permission checks for updates/deletes
- Multi-tenant isolation

---

## 🔐 Environment Variables

Required environment variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional - Analytics (if implemented)
VITE_ANALYTICS_ID=your-analytics-id

# Optional - Error Monitoring (if implemented)
VITE_SENTRY_DSN=your-sentry-dsn
```

⚠️ **Never commit `.env` file to version control!**

---

## 🧪 Testing

Testing infrastructure is in progress. Planned:

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

Target coverage: 80%+

---

## 🚢 Deployment

### Netlify (Current)

1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard
5. Deploy!

### Vercel

```bash
npm install -g vercel
vercel --prod
```

### Custom Server

```bash
npm run build
# Serve the /dist folder with any static server
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure code passes linting and type checking
5. Write/update tests (when available)
6. Submit a pull request

### Code Style

- Use TypeScript for all new code
- Follow existing naming conventions
- Keep components under 300 lines
- Add JSDoc comments for public APIs
- Use constants from `constants.ts`

---

## 📄 License

This project is proprietary software owned by Tabzpay.

---

## 🔗 Links

- **Live Demo**: [progress.netlify.app](https://progress.netlify.app) (example)
- **Documentation**: Coming soon
- **API Reference**: Coming soon
- **Support**: [issues](https://github.com/tabzpay/progress/issues)

---

## 🙏 Acknowledgments

- Original design from [Figma Community](https://www.figma.com/design/hWS7LxWBOrFVBZDxdLCqFb/Loan-Tracking-Web-App)
- Built with [Shadcn UI](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

---

**Made with ❤️ by the Tabzpay Team**