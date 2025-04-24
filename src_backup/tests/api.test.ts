import { API_CONFIG, api } from '../services/api';

async function testApiConnection() {
  try {
    console.log('Testing API Configuration:');
    console.log('Base URL:', API_CONFIG.BASE_URL);
    console.log('API Key:', API_CONFIG.API_KEY ? 'Present' : 'Missing');

    // Test the API connection with a simple request
    const response = await api.get('/api/ext/hotel/locations/suggestions', {
      params: { query: 'London' }
    });

    console.log('API Test Response:', response.data);
    console.log('API Connection Successful!');
  } catch (error) {
    console.error('API Test Failed:', error);
  }
}

// Run the test
testApiConnection(); 