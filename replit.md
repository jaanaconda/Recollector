# Recollector Application

## Overview

Recollector is a privacy-focused digital legacy platform that captures and preserves a person's authentic voice, personality, and memories to create a conversational AI that can respond exactly as they would. The primary goal is to enable loved ones to continue having meaningful conversations with someone's digital essence after they pass away. The platform allows users to record memories across different categories while maintaining complete privacy by default, with selective sharing through unique passcodes. The AI learns communication patterns, values, and personality traits to generate responses that authentically sound like the person speaking, creating a lasting digital legacy for families.

## Recent Changes (August 2025)

**Digital Legacy Focus & AI Personality Modeling:**
- Shifted core focus from memory storage to digital legacy creation and personality preservation
- Enhanced OpenAI service with advanced personality profiling to capture authentic communication patterns
- Created digital legacy interface component for post-death conversational AI interactions
- Added digital legacy conversation route to backend API for generating authentic responses
- Updated project focus from privacy-first sharing to AI personality preservation and legacy conversations
- Enhanced personality analysis to capture communication style, values, and thought patterns for authentic response generation

**Life Events Feature Addition:**
- Added comprehensive life events system to capture major milestones like marriage, divorce, having children
- Created life events database table with emotional context, lessons learned, and personal growth fields
- Implemented detailed life events component with forms for adding significant life experiences
- Added sample life events for Sarah Johnson showing how she felt about divorce, having Emma, naming decisions
- Enhanced digital legacy personality modeling to include major life transitions and emotional responses
- Added life events API endpoints for full CRUD operations on milestone data

**Religious & Spiritual Legacy Section:**
- Added comprehensive religious section for faith-based memory preservation and spiritual legacy
- Created religious profiles database table supporting multiple faiths (Christianity, Islam, Judaism, Buddhism, Hinduism)
- Implemented religious memories database with scripture references, spiritual context, and emotional impact tracking
- Built faith-specific AI question generation that references scriptures, prayers, and religious practices
- Created multi-faith interface with denomination support and culturally respectful spiritual question prompts
- Enhanced OpenAI service with specialized religious question generation for different faith traditions
- Added optional religious toggle allowing users to include or exclude faith-based questions from digital legacy
- Completed interactive religious milestone timeline with chronological display and detailed milestone management

**Life Event Messaging System:**
- Implemented comprehensive messaging system for major life events (pregnancy, wedding, divorce, miscarriage, falling in/out of love)
- Created LifeEventMessage schema supporting video uploads, written letters, and audio recordings
- Added recipient management with relationship tracking (baby, child, spouse, family, friends)
- Built delivery scheduling system for future message delivery
- Integrated emotional tone capture and private note functionality
- Added legal disclaimer clarifying app is not replacement for legal documents like wills or trusts
- Created sample messages from Sarah to her unborn baby and explanations about divorce

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built as a React single-page application using modern tooling:

**Framework & Build Tools:**
- React 18 with TypeScript for type-safe component development
- Vite for fast development builds and hot module replacement
- Wouter for lightweight client-side routing instead of React Router

**UI Component System:**
- Shadcn/UI component library built on Radix UI primitives for accessibility
- Tailwind CSS for utility-first styling with custom CSS variables for theming
- Responsive design with mobile-first approach using CSS Grid and Flexbox

**State Management & Data Fetching:**
- TanStack React Query for server state management, caching, and background updates
- Custom query client with error handling and credential management
- React Hook Form for form state management with Zod schema validation

**Key Design Patterns:**
- Component composition using Radix UI slot pattern for flexibility
- Custom hooks for reusable logic (useToast, useIsMobile)
- TypeScript interfaces for type safety across components
- CSS variables for consistent theming and dark mode support

### Backend Architecture

The backend implements a REST API using Express.js with TypeScript:

**Server Framework:**
- Express.js with TypeScript for type-safe API development
- Custom middleware for request logging and error handling
- ESM modules for modern JavaScript import/export syntax

**Database Layer:**
- Drizzle ORM with PostgreSQL for type-safe database operations
- Schema-first approach with automatic TypeScript type generation
- Database migrations managed through Drizzle Kit

**Service Architecture:**
- Repository pattern with IStorage interface for data access abstraction
- In-memory storage implementation for development/testing
- Modular route handlers organized by feature domains

**Development Setup:**
- Custom Vite integration for development with HMR support
- Automatic TypeScript compilation and error overlay
- Request/response logging middleware for debugging

### Data Architecture

**Database Schema:**
- Users table with basic profile information
- Memory categories with progress tracking
- Memories linked to users and categories with emotional context
- Conversations with participant information and timestamps
- Messages within conversations with AI response flagging
- Family members with access level permissions

**Data Flow:**
- Frontend components use React Query to fetch data from REST endpoints
- Backend routes validate requests and delegate to storage layer
- Storage layer abstracts database operations behind interface
- Shared schema types ensure consistency between client and server

**Memory Organization:**
- Categorical organization (childhood, relationships, achievements, etc.)
- Progress tracking per category to gamify memory collection
- Emotional context capture for richer memory preservation
- Chronological ordering with creation timestamps

### AI Integration Architecture

**OpenAI Integration:**
- GPT-4o model integration for personality analysis and response generation
- Personality profiling based on user memories to create personalized responses
- Question suggestion generation for guided memory recording
- Conversational AI that adapts to user communication patterns

**AI Features:**
- Personality analysis from recorded memories to understand communication style
- Personalized response generation that matches user's tone and vocabulary
- Smart question suggestions to help users recall specific memories
- Adaptive conversation flow based on emotional context

## External Dependencies

### Core Infrastructure
- **Neon Database**: PostgreSQL hosting service for production data storage
- **Replit**: Development and hosting platform with built-in database provisioning
- **OpenAI API**: GPT-4o model access for AI-powered conversation features

### Frontend Libraries
- **React Query**: Server state management and caching layer
- **Radix UI**: Accessible component primitives for complex UI interactions
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Wouter**: Lightweight routing library for single-page navigation
- **Date-fns**: Date manipulation and formatting utilities
- **React Hook Form**: Form state management with validation
- **Zod**: Schema validation for type-safe data handling

### Backend Dependencies
- **Drizzle ORM**: Type-safe database ORM with PostgreSQL adapter
- **Express.js**: Web application framework for REST API
- **Connect-pg-simple**: PostgreSQL session store for Express sessions
- **Nanoid**: Cryptographically secure unique ID generation

### Development Tools
- **TypeScript**: Static type checking across full stack
- **Vite**: Fast build tool with development server and HMR
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind and Autoprefixer
- **Drizzle Kit**: Database migration and introspection tools

### Authentication & Security
- **Session-based authentication**: Using PostgreSQL session storage
- **CORS configuration**: Secure cross-origin resource sharing
- **Input validation**: Zod schemas for request/response validation
- **SQL injection protection**: Parameterized queries through Drizzle ORM

The architecture emphasizes type safety, performance, and maintainability while providing a scalable foundation for memory preservation and family sharing features.