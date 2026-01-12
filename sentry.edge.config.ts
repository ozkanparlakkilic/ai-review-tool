import * as Sentry from "@sentry/nextjs";

const isProduction = process.env.NODE_ENV === "production";
const sentryEnabled = process.env.SENTRY_ENABLED === "true" || isProduction;

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  enabled: sentryEnabled,
  tracesSampleRate: isProduction ? 0.1 : 0.01,
  enableLogs: true,
  sendDefaultPii: false,
  debug: process.env.NODE_ENV === "development" && sentryEnabled,
});
