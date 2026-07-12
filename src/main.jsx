import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import * as Sentry from "@sentry/react";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';

// Initialize Sentry for Error Tracking
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    // Note: We are using PostHog for Replays, so we don't enable Sentry Replays here
  });
}

// Initialize PostHog for Analytics and Replays
if (import.meta.env.VITE_POSTHOG_KEY) {
  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <PostHogProvider client={posthog}>
        <App />
      </PostHogProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
