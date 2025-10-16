// Application configuration
export const config = {
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL ||'http://localhost:3001/api' //'https://ahcp-backend.vercel.app/api',
    timeout: 30000,
  },
  
  // Authentication Configuration
  auth: {
    tokenKey: 'auth-token',
    refreshTokenKey: 'refresh-token',
    storageKey: 'auth-storage',
  },
  
  // Application Settings
  app: {
    name: 'AHCP Dashboard',
    version: '1.0.0',
    description: 'لوحة تحكم إدارة تقارير خدمات الصحة الحيوانية',
    defaultLanguage: 'ar',
    direction: 'rtl',
  },
  
  // Pagination Settings
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
  },
  
  // File Upload Settings
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  },
  
  // Development Settings
  dev: {
    enableMockData: process.env.NODE_ENV === 'development',
    enableApiDocs: true,
    enableDebugMode: process.env.NODE_ENV === 'development',
  },
};

export default config;
