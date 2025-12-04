# Hind General Store

## Overview
This is a full-featured e-commerce web application for a general store. It's built with React, TypeScript, and Vite, featuring a complete shopping experience with user authentication, product management, order tracking, and admin dashboard.

## Project Structure
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS (via CDN in index.html)
- **Routing**: React Router DOM
- **State Management**: Zustand
- **Form Handling**: React Hook Form with Zod validation
- **Internationalization**: i18next for multi-language support
- **PDF Generation**: jsPDF and html2canvas for invoice generation

## Key Features
- Product catalog with categories and search
- Shopping cart and wishlist
- User authentication (login/signup)
- Order management and tracking
- Admin dashboard for store management
- Payment integration setup
- Delivery scheduling
- Review system
- Support ticket system
- Multi-language support

## Development Setup
The application runs on port 5000 and is configured for the Replit environment:
- Development server: `npm run dev`
- Build command: `npm run build`
- Preview: `npm run preview`

## Configuration
- **vite.config.ts**: Configured for port 5000 with HMR for Replit's proxy environment
- **Deployment**: Set up as a static site deployment with build output in `dist` folder

## Environment Variables
The application supports GEMINI_API_KEY environment variable for potential AI features (currently configured but not actively used).

## Recent Changes
- **2024-12-04**: Initial project import and Replit environment setup
  - Configured Vite to run on port 5000
  - Added HMR configuration for Replit proxy
  - Fixed TypeScript import conflict with Notification type
  - Installed missing dependencies (jspdf, html2canvas, i18next packages)
  - Set up deployment configuration for static hosting

## Architecture
The application follows a component-based architecture with:
- **components/**: Reusable UI components including admin components
- **views/**: Page-level components for different routes
- **context/**: React context providers for global state
- **types.ts**: TypeScript type definitions
- **constants.ts**: Initial data and configuration
- **i18n.ts**: Internationalization configuration
