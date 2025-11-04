export const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://ahcp-backend-production.up.railway.app/api',
  timeout: 30000,
  retries: 3,
};
