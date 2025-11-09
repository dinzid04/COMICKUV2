# COMIC KU - Comic Reading Platform

## Overview

COMIC KU is a modern web application for reading comics online. The platform provides a content-first, reading-optimized experience inspired by professional webtoon platforms like Webtoon, Tapas, and MangaDex, combined with modern streaming service UX patterns.

**Core Features:**
- Browse manhwa by categories (New, Popular, Top Rated, Ongoing, Recommendations)
- Search functionality for finding specific titles
- Genre-based filtering and exploration
- Detailed manhwa information pages with synopsis, ratings, and metadata
- Chapter reading interface with vertical scroll navigation
- Responsive design with dark/light theme support

**Technology Stack:**
- Frontend: React with TypeScript, Vite build tool
- UI Framework: Tailwind CSS with shadcn/ui components
- Routing: Wouter (lightweight React router)
- State Management: TanStack Query (React Query)
- Backend: Express.js (Node.js)
- Database: PostgreSQL with Drizzle ORM
- External API: mnhwa-api.vercel.app for manhwa content

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Component-Based React Application:**
- Built with functional components and React hooks
- TypeScript for type safety across the application
- Vite as the build tool for fast development and optimized production builds
- Single Page Application (SPA) architecture with client-side routing

**UI Design System:**
- shadcn/ui component library built on Radix UI primitives
- Tailwind CSS utility-first styling with custom design tokens
- Dark/light theme switching with system preference detection
- Custom color palette optimized for manhwa content display (vibrant purple accent, deep charcoal backgrounds)
- Typography system using Inter (body), Outfit (headings), and JetBrains Mono (monospace)

**State Management:**
- TanStack Query for server state management and API caching
- Local component state with React hooks (useState, useEffect)
- Theme state managed through React Context (ThemeProvider)
- No global state management library (Redux/Zustand) - API data cached through React Query

**Routing Strategy:**
- Wouter for lightweight client-side routing
- Key routes: Home (/), Search (/search/:query), Genres (/genres), Genre Detail (/genre/:id), Manhwa Detail (/manhwa/:id), Chapter Reader (/chapter/:id)
- SEO optimization with dynamic meta tags per route

### Backend Architecture

**Express.js Server:**
- RESTful API proxy/middleware layer
- Session management with connect-pg-simple
- Custom logging middleware for API requests
- Error handling middleware

**Development Setup:**
- Vite middleware integration in development mode
- Hot Module Replacement (HMR) support
- Separate build processes for client and server

**API Integration Pattern:**
- Frontend directly consumes external manhwa API (mnhwa-api.vercel.app)
- No backend proxy for API calls - direct client-to-API communication
- API endpoints: manhwa lists (new/popular/top/ongoing/recommendation), detail, chapter content, genres, search

### Data Storage

**Database Schema (Drizzle ORM + PostgreSQL):**
- Currently minimal schema with users table (id, username, password)
- Database configured via Drizzle Kit with connection pooling through Neon serverless driver
- Schema defined in TypeScript for type safety
- Migration system in place (drizzle-kit push)

**Storage Abstraction:**
- IStorage interface for CRUD operations
- MemStorage implementation for in-memory user data
- Designed for potential future database integration

**Data Flow:**
- External API data fetched directly from client
- React Query handles caching, revalidation, and loading states
- Type-safe interfaces defined in shared/types.ts for API responses

### External Dependencies

**Third-Party APIs:**
- **mnhwa-api.vercel.app** - Primary manhwa content API
  - Endpoints: /manhwa-new, /manhwa-popular, /manhwa-top, /manhwa-ongoing, /manhwa-recommendation, /manhwa-detail/:id, /chapter/:id, /genres, /genre/:id, /search/:query
  - No authentication required
  - Returns JSON data for manhwa metadata, chapter images, and genre listings

**Database Services:**
- **PostgreSQL** (via environment variable DATABASE_URL)
- **Neon Serverless Driver** (@neondatabase/serverless) for connection pooling and edge compatibility

**UI Component Libraries:**
- **Radix UI** - Unstyled, accessible component primitives (dialogs, dropdowns, tooltips, etc.)
- **Embla Carousel** - Carousel/slider functionality
- **Lucide React** - Icon library

**Development Tools:**
- **Replit integrations** - Cartographer, dev banner, runtime error overlay (development only)
- **Vite plugins** - React, error handling, development tooling

**Styling & Utilities:**
- **Tailwind CSS** - Utility-first CSS framework
- **class-variance-authority** - Component variant management
- **clsx & tailwind-merge** - Conditional className utilities
- **date-fns** - Date formatting utilities

**Form & Validation:**
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **@hookform/resolvers** - React Hook Form + Zod integration

**Type Safety:**
- **TypeScript** - Full type coverage
- **drizzle-zod** - Database schema to Zod schema conversion