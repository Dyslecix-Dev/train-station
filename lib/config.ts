export const siteConfig = {
  name: "Train Station",
  description: "Your all-in-one wellness tracker for fitness, nutrition, sleep, and mental health",
  url: process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000",
} as const;
