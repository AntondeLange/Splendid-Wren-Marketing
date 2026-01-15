# Splendid Wren Marketing Website

A modern, human-focused marketing website for Splendid Wren Marketing, a small-business-focused marketing consultancy based in Australia.

## Project Structure

```
├── html-site/         # Static HTML/CSS/JS site (production)
├── frontend/          # Next.js frontend application
│   ├── app/          # Next.js App Router pages
│   ├── components/   # React components
│   ├── public/       # Static assets
│   └── ...
├── backend/          # Express.js backend API server
│   ├── src/         # Source code
│   └── ...
└── ...
```

## Features

- **Home Page**: Hero section with value proposition, "How We Help" pillars, and clear CTAs
- **About Page**: Founder-led storytelling with real photography
- **How We Work & Pricing**: Process steps and pricing guide
- **Blog**: Clean, readable layout for marketing content
- **Contact**: Friendly contact form
- **Tools Section**: Stub for future paywalled tools (Campaign Planner, 60-Minute Marketing Plan)

## Production Source of Truth

The live site is served from the static `html-site/` folder. The Next.js app in `frontend/` is retained for reference but is not the production source.
All production assets should be referenced from `html-site/images/`.

## Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React 18** for components

### Backend
- **Express.js** with TypeScript
- RESTful API endpoints
- CORS enabled for frontend communication
- Environment-based configuration

## Brand Guidelines

The site follows the Splendid Wren Marketing Brand Guidelines:

### Colors
- Primary: Soft cobalt blue (#2c60a5)
- Accent: Soft teals (#63a2aa) and light blues (#94c8e0)
- Backgrounds: Warm whites (#fbf9f4, #f8f8f8)
- Neutrals: Light greys (#bdc2b4, #d5d5d5)

### Typography
- Headings: Grotesque-style bold (system fonts)
- Body: Clean, readable sans-serif (system fonts)
- Accents: Poppins-style italic for warmth

### Design Principles
- Generous white space
- Rounded corners and soft curves
- Calm geometry, never sharp
- Subtle animations (accessibility-respecting)
- Real photography only (no stock imagery)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install all dependencies:
```bash
npm run install:all
```

Or install frontend and backend dependencies separately:
```bash
npm run frontend:install
npm run backend:install
```

2. Run both servers (frontend + backend):
```bash
npm run dev
```

This will start:
- **Frontend**: http://localhost:3000 (Next.js)
- **Backend API**: http://localhost:3001 (Express)

3. Or run servers separately:
```bash
npm run frontend:dev  # Frontend only
npm run backend:dev   # Backend only
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
# or
npm run frontend:build
npm start
```


## Development

### Frontend Development

All frontend code is in the `frontend/` directory. Navigate there to work on the Next.js application:

```bash
cd frontend
npm run dev
```

### Backend Development

The `backend/` folder contains an Express.js API server.

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies (if not already done):
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Start the backend server:
```bash
npm run dev
```

The backend server will run on http://localhost:3001

#### API Endpoints

- `GET /health` - Health check
- `GET /api/hello` - Test endpoint
- `POST /api/contact` - Contact form submission

## Project Structure Details

### Frontend (`/frontend`)
- `app/` - Next.js App Router pages and layouts
- `components/` - Reusable React components
- `public/` - Static assets (images, etc.)
- Configuration files (tailwind.config.ts, next.config.js, etc.)

### Backend (`/backend`)
- Reserved for future API services, authentication, and database integration

## Accessibility

- Semantic HTML throughout
- ARIA labels where appropriate
- Keyboard navigation support
- Reduced motion support
- Color contrast compliance
- Focus states on interactive elements

## Performance

- Next.js Image optimization
- Lazy loading for images
- Minimal JavaScript
- Optimized build output

## Future Enhancements

The Tools section is prepared for future implementation with:
- Campaign Planner tool
- 60-Minute Marketing Plan tool
- Authentication system
- Paywalled/gated content

## Notes

- All copy currently uses Lorem Ipsum placeholders - replace with final marketing copy
- Images should be optimized for web before production
- Form submissions need backend integration
- Blog posts need CMS integration or markdown support
