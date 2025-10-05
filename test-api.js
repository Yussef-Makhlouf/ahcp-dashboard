// Simple API test to verify the parasite control API is working
const testAPI = async () => {
  try {
    console.log('Testing Parasite Control API...');
    
    // Test GET all records
    const response = await fetch('https://barns-g2ou.vercel.app/parasite-control/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ API Response received:', {
      success: data.success,
      total: data.total,
      count: data.count,
      page: data.page,
      totalPages: data.totalPages,
      dataLength: data.data?.length || 0
    });
    
    if (data.data && data.data.length > 0) {
      console.log('✅ Sample record:', {
        id: data.data[0]._id,
        serial_no: data.data[0].serial_no,
        owner_name: data.data[0].owner_name,
        date: data.data[0].date,
        herd_health_status: data.data[0].herd_health_status,
        insecticide_status: data.data[0].insecticide_status
      });
    }
    
    console.log('✅ API test completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    return false;
  }
};

// Run the test
testAPI();
