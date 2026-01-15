# Splendid Wren Marketing Website

A modern, human-focused marketing website for Splendid Wren Marketing, a small-business-focused marketing consultancy based in Australia.

## Project Structure

```
├── html-site/         # Static HTML/CSS/JS site (production)
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

The live site is served from the static `html-site/` folder.
All production assets should be referenced from `html-site/images/`.

## Tech Stack

### Frontend
- **Static HTML/CSS/JS** (Bootstrap + custom CSS)

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

Open `html-site/index.html` in a browser or serve `html-site/` with a simple static server.

## Accessibility

- Semantic HTML throughout
- ARIA labels where appropriate
- Keyboard navigation support
- Reduced motion support
- Color contrast compliance
- Focus states on interactive elements

## Performance

- Lazy loading for images
- Minimal JavaScript

## Future Enhancements

The Tools section is prepared for future implementation with:
- Campaign Planner tool
- 60-Minute Marketing Plan tool
- Authentication system
- Paywalled/gated content

## Notes

- Images should be optimized for web before production
