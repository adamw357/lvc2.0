const axios = require('axios');
const loadEnv = require('./loadEnv');

// Load environment variables
loadEnv();

// Helper function to generate headers
function getHeaders(sessionId) {
  return {
    'x-xeni-token': process.env.NEXT_PUBLIC_XENI_API_KEY,
    'accept-language': 'en',
    'x-session-id': sessionId,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
}

async function testApiConnection() {
  try {
    console.log('Testing API Configuration:');
    console.log('Base URL:', process.env.NEXT_PUBLIC_XENI_API_URL);
    console.log('API Key:', process.env.NEXT_PUBLIC_XENI_API_KEY ? 'Present' : 'Missing');

    // Generate a session ID
    const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Test Location Autosuggest API
    console.log('\nTesting Location Autosuggest API:');
    const suggestConfig = {
      method: 'post',
      url: `${process.env.NEXT_PUBLIC_XENI_API_URL}/api/ext/hotel/autosuggest`,
      headers: getHeaders(sessionId),
      data: {
        text: 'London'
      }
    };
    const suggestionsResponse = await axios(suggestConfig);
    console.log('Location Autosuggest API Response Status:', suggestionsResponse.status);
    console.log('Location Autosuggest API Response Data:', JSON.stringify(suggestionsResponse.data, null, 2));

    // Test the Hotel Search API
    console.log('\nTesting Hotel Search API:');
    const searchParams = {
      checkInDate: '2025-07-25',
      checkOutDate: '2025-07-30',
      lat: 51.5074,  // London coordinates
      lng: -0.1278,
      nationality: 'GB',
      type: 'CITY',
      occupancies: [{
        numOfRoom: 1,
        numOfAdults: 2,
        numOfChildren: 0,
        childAges: []
      }],
      destinationCountryCode: 'GB',
      radius: 20,
      isPolling: false,
      countryOfResidence: 'GB',
      currency: 'GBP',
      locationId: '437162' // Changed from 'london' to the specific ID
    };
    const searchConfig = {
      method: 'post',
      url: `${process.env.NEXT_PUBLIC_XENI_API_URL}/api/ext/hotelsearch`,
      headers: getHeaders(sessionId),
      data: searchParams
    };
    const searchResponse = await axios(searchConfig);
    console.log('Hotel Search API Response Status:', searchResponse.status);
    console.log('Hotel Search API Response Data:', JSON.stringify(searchResponse.data, null, 2));

    console.log('\nAPI Connection Test Completed!');
  } catch (error) {
    console.error('API Test Failed:', error.response ? error.response.data : error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Request URL:', error.config.url);
      console.error('Request Headers:', error.config.headers);
      console.error('Request Method:', error.config.method);
      console.error('Request Data:', JSON.stringify(error.config.data)); // Stringify data for better logging
    }
  }
}

// Run the test
testApiConnection(); 