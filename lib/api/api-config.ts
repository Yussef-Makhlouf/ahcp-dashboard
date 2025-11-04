export const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://ahcp-backend.vercel.app/api',
  timeout: 30000,
  retries: 3,
};
