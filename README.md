# Adroit Frontend

This is a modern, responsive React frontend for the Adroit E-commerce application. It is built using **Vite**, **React**, and a suite of powerful libraries to deliver a seamless shopping experience.

## Features

- **Fast & Modern Stack:** Built with React 18 and Vite for fast development and optimized production builds.
- **Routing:** Client-side routing managed by `react-router-dom`.
- **Payment Integration:** Secure checkout implementation using `@stripe/react-stripe-js` and `@stripe/stripe-js`.
- **UI & Styling:** Responsive design powered by `bootstrap` and custom CSS, enhanced with `react-bootstrap` and `bootstrap-icons`.
- **Interactive Maps:** Location features integrated via `@react-google-maps/api`.
- **User Notifications & Alerts:** Interactive alerts using `sweetalert2` and `react-toastify`.
- **Forms & Inputs:** Specialized components like `react-select`, `react-range`, and `react-google-recaptcha`.
- **Email Integration:** Send emails directly from the client using `@emailjs/browser`.

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn package manager

## Installation

1. Clone the repository and navigate into the project directory:
   ```bash
   cd Ecom
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```

## Available Scripts

In the project directory, you can run:

### `npm run dev`
Runs the app in the development mode using Vite. Open [http://localhost:5173](http://localhost:5173) to view it in your browser. The page will reload when you make changes.

### `npm run build`
Builds the app for production to the `dist` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm run lint`
Runs ESLint to analyze the code and identify potential issues.

### `npm run preview`
Locally preview the production build after running `npm run build`.

## Project Structure

- `src/Components/`: Reusable UI components.
- `src/Pages/`: Main application views and routes (e.g., UserDashboard).
- `src/Assets/`: Static assets like images and fonts.
- `src/Config/`: Application configuration settings.
- `src/Constants/`: Shared constants across the app.

## Technologies Used

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- [Bootstrap](https://getbootstrap.com/)
- [Stripe](https://stripe.com/)
- [Axios](https://axios-http.com/)
- [SweetAlert2](https://sweetalert2.github.io/)
