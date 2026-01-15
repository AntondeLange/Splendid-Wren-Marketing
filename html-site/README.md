# Splendid Wren Marketing - HTML/CSS/Bootstrap/JavaScript Site

This is a static HTML version of the Splendid Wren Marketing website, rebuilt from the Next.js/React version while maintaining the exact same visual design.

## Structure

```
html-site/
├── index.html          # Home page
├── about.html          # About page
├── how-we-work.html    # How We Work page
├── blog.html           # Blog listing page
├── blog-post.html      # Individual blog post page
├── contact.html        # Contact form page
├── tools.html          # Tools page
├── css/
│   └── style.css      # Custom CSS matching Tailwind design
├── js/
│   ├── loading.js      # Loading animation
│   ├── hero.js         # Hero video, audio, and ripple effects
│   ├── contact.js      # Contact form handler
│   └── navigation.js   # Navigation active states
├── images/             # All images and media files
└── images/logo_loader.svg         # Site favicon
```

## Features

- **Bootstrap 5.3.2** for responsive layout and components
- **Custom CSS** matching the original Tailwind design
- **Vanilla JavaScript** for all interactive features:
  - Loading animation (5 seconds, once per session)
  - Hero video with hover audio and ripple effects
  - Contact form with validation and API integration
  - Mobile navigation
- **All pages** converted from React components
- **Same visual design** as the Next.js version

## Setup

1. Simply open `index.html` in a web browser, or
2. Serve using a local web server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (http-server)
   npx http-server -p 8000
   ```

## API Configuration

The contact form submits to the backend API. To configure the API URL:

1. Set `window.API_URL` in your HTML before loading `contact.js`, or
2. Defaults to `http://localhost:3001` for development

Example:
```html
<script>
  window.API_URL = 'https://your-api-url.com';
</script>
<script src="js/contact.js"></script>
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive
- Works without JavaScript (with reduced functionality)

## Notes

- All images should be in the `images/` directory
- Bootstrap is loaded from CDN
- Fonts are loaded from Google Fonts
- The site maintains the same color scheme and styling as the original Next.js version
