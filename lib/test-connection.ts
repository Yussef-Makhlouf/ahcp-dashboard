// Test script to verify backend connection
import { api } from './api/base-api';

export const testBackendConnection = async () => {
  try {
    console.log('🔄 Testing backend connection...');
    
    // Test health endpoint
    const healthResponse = await fetch('https://ahcp-backend.vercel.app/health');
    const healthData = await healthResponse.json();
    
    if (healthResponse.ok) {
      console.log('✅ Backend health check passed:', healthData);
      return {
        success: true,
        message: 'Backend connection successful',
        data: healthData
      };
    } else {
      throw new Error('Health check failed');
    }
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    return {
      success: false,
      message: 'Backend connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const testApiEndpoints = async () => {
  const results = {
    health: false,
    auth: false,
    clients: false,
    parasiteControl: false,
    vaccination: false,
    mobileClinic: false,
    equineHealth: false,
    laboratories: false,
    reports: false
  };

  try {
    // Test health endpoint
    const healthResponse = await fetch('https://ahcp-backend.vercel.app/health');
    results.health = healthResponse.ok;

    // Test API endpoints (these might fail due to authentication)
    const endpoints = [
      { name: 'auth', url: '/auth/profile' },
      { name: 'clients', url: '/clients' },
      { name: 'parasiteControl', url: '/parasite-control' },
      { name: 'vaccination', url: '/vaccination' },
      { name: 'mobileClinic', url: '/mobile-clinics' },
      { name: 'equineHealth', url: '/equine-health' },
      { name: 'laboratories', url: '/laboratories' },
      { name: 'reports', url: '/reports/dashboard-stats' }
    ];

    for (const endpoint of endpoints) {
      try {
        // const response = await fetch(`https://ahcp-backend.vercel.app/api/${endpoint.url}`);
        const response = await fetch(`https://ahcp-backend.vercel.app/api/${endpoint.url}`);
        // Even 401 (unauthorized) means the endpoint exists
        results[endpoint.name as keyof typeof results] = response.status !== 404;
      } catch (error) {
        results[endpoint.name as keyof typeof results] = false;
      }
    }

    return results;
  } catch (error) {
    console.error('Error testing endpoints:', error);
    return results;
  }
};

// Helper function to display connection status
export const displayConnectionStatus = async () => {
  console.log('🚀 AHCP Backend Connection Test');
  console.log('================================');
  
  const connectionTest = await testBackendConnection();
  const endpointTests = await testApiEndpoints();
  
  console.log('\n📊 Connection Results:');
  console.log('Health Check:', connectionTest.success ? '✅' : '❌');
  
  console.log('\n🔗 API Endpoints:');
  Object.entries(endpointTests).forEach(([name, status]) => {
    console.log(`${name}: ${status ? '✅' : '❌'}`);
  });
  
  if (connectionTest.success) {
    console.log('\n🎉 Backend is ready! You can now use the dashboard.');
  } else {
    console.log('\n⚠️  Backend is not running. Please start it with: npm run dev');
  }
  
  return { connectionTest, endpointTests };
};
