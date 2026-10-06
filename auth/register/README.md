# X!Register - Registration Page

This is the registration page for the X!314 platform.

## Features

- Clean and modern registration form
- Social sign-up options (Google, Apple)
- Email-based registration
- Password confirmation
- Terms and conditions acceptance
- Responsive design for mobile and desktop
- Animated robot mascot (nox!314)
- Form validation

## File Structure

```
auth/register/
├── index.html          # Main registration page
├── js/
│   └── script.js       # Form validation and handler scripts
├── css/
│   └── style.css       # Additional styles and components
└── README.md           # This file
```

## Technologies Used

- HTML5
- CSS3 (with animations and transitions)
- Vanilla JavaScript (ES6)
- Responsive Grid Layout

## Components

### Navigation Bar
- Responsive header with hamburger menu on mobile
- Links to main pages and login
- Logo with branding

### Registration Form
- Full name input
- Email input
- Password input with confirmation
- Social login buttons (Google, Apple)
- Terms and conditions checkbox
- Submit button with hover effects

### Robot Mascot
- Animated nox!314 robot character
- Blinking eyes animation
- Pulsing antenna light
- Smooth bobbing motion

### Footer
- Copyright information
- Links to source code, news, and sitemap

## Styling

The page uses a consistent color scheme:
- Primary: `#624aff` (Proton Blue)
- Dark: `#1c1c1c` (Proton Dark)
- Light: `#f5f7fa` (Proton Light)
- Border: `#e0e4eb` (Proton Border)

## Responsive Design

- Desktop: Two-column layout (form + robot)
- Tablet/Mobile: Single-column layout
- Breakpoint: 768px
- Hamburger menu appears on screens smaller than 768px

## Form Validation

The form includes validation for:
- Required fields
- Email format
- Password length (minimum 8 characters)
- Password confirmation match
- Terms acceptance

## Future Enhancements

- Backend integration for user registration
- Email verification
- Password strength indicator
- CAPTCHA for security
- Multi-factor authentication setup
- Username availability checker
