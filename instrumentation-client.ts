// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const integrations = [];
if (typeof window !== "undefined" && Sentry.replayIntegration) {
  integrations.push(Sentry.replayIntegration());
}

const isProduction = process.env.NODE_ENV === "production";
const sentryEnabled = process.env.SENTRY_ENABLED === "true" || isProduction;

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  enabled: sentryEnabled,
  integrations,
  tracesSampleRate: isProduction ? 0.1 : 0.01,
  enableLogs: true,
  replaysSessionSampleRate: isProduction ? 0.1 : 0.01,
  replaysOnErrorSampleRate: 1.0,
  sendDefaultPii: false,
  debug: process.env.NODE_ENV === "development" && sentryEnabled,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
