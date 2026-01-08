# Backend API Server

Express.js backend server for Splendid Wren Marketing website.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Start development server:
```bash
npm run dev
```

## API Endpoints

- `GET /health` - Health check endpoint
- `GET /api/hello` - Test endpoint
- `POST /api/contact` - Contact form submission

## Environment Variables

- `PORT` - Server port (default: 3001)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:3000)
- `NODE_ENV` - Environment (development/production)

## Future Implementation

- Authentication system for Tools section
- Database integration
- Email service integration
- Payment processing (if needed)
