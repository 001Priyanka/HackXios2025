# CropCare - Smart Crop Advisory for Farmers

A modern, mobile-first React application built with Vite that provides agricultural advisory services to farmers.

## Features

- **Landing Page**: Beautiful, responsive landing page with language selector
- **Multi-language Support**: English, Hindi, Marathi, Kannada, Tamil, Telugu, Gujarati, Bengali
- **Mobile-First Design**: Optimized for mobile devices with responsive design
- **Routing**: Complete routing setup for all major pages
- **Modern UI**: Clean, accessible interface with smooth animations

## Tech Stack

- **Frontend**: React 18 + Vite
- **Routing**: React Router DOM
- **Styling**: CSS3 with mobile-first approach
- **Build Tool**: Vite

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/
│   ├── Landing/          # Landing page component
│   ├── Auth/             # Login & Signup components
│   ├── Dashboard/        # Dashboard component
│   ├── Advisory/         # Advisory form & results
│   ├── Market/           # Market prices component
│   ├── Feedback/         # Feedback component
│   └── Navigation/       # Navigation component
├── App.jsx              # Main app component with routing
├── App.css              # Global app styles
├── index.css            # Global base styles
└── main.jsx             # App entry point
```

## Routes

- `/` - Landing Page
- `/signup` - User Registration
- `/login` - User Login
- `/dashboard` - User Dashboard
- `/advisory` - Advisory Form
- `/result` - Advisory Results
- `/market` - Market Prices
- `/feedback` - User Feedback

## Design Features

- **Gradient Background**: Beautiful green gradient representing agriculture
- **Responsive Typography**: Scales appropriately across devices
- **Accessibility**: High contrast support, reduced motion support
- **Touch-Friendly**: Large buttons optimized for mobile interaction
- **Language Selector**: Dropdown with multiple Indian languages

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT License