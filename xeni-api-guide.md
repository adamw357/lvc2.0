# Xeni API Configuration Guide

## Introduction

This guide will help you configure and use the Xeni API for hotel booking and resort services. The API provides endpoints for searching, retrieving details, booking, and managing hotel reservations.

## API Products

Xeni offers two main API products:
- Hotels API v1
- Resort Service v1 API

## Authentication

### Required Headers

For **Hotel API**:
- `x-xeni-token`: Your API key (referred to as `{{API_KEY}}` in examples)
- `x-session-id`: A unique ID for tracing customer requests
- `corelationid`: (for some endpoints) A unique ID for Xeni request tracking

For **Resort Service API**:
- `x-api-key`: Your API key
- `x-correlation-id`: (for some endpoints) A correlation ID

## Base URLs

The documentation uses placeholder variables:
- For Hotel API: `{{BASE_URL}}`
- For Resort Service API: `{{base_url}}` (example: `https://dev.api.xeni.com/resortservice`)

You'll need to replace these with the actual base URLs provided to you.

## Hotel API Workflow

Here's how to use the Hotel API endpoints in a typical booking flow:

1. **Search for Hotels**
   - Endpoint: `POST {{BASE_URL}}/api/ext/hotelsearch`
   - Use this to search for hotels based on user criteria

2. **Auto-suggest Locations**
   - Endpoint: `POST {{BASE_URL}}/api/ext/hotel/autosuggest`
   - Use this to provide location suggestions based on user input

3. **Get Hotel Details**
   - Endpoint: `GET {{BASE_URL}}/api/ext/hotel/details`
   - Retrieve detailed information about a specific hotel

4. **Get Rooms and Rates**
   - Endpoint: `POST {{BASE_URL}}/api/ext/hotel/roomsandrates`
   - Get available rooms and their prices for a specific hotel
   - Required data includes check-in/out dates, currency, hotel ID, location coordinates, and occupancy details

5. **Get Price Recommendation**
   - Endpoint: `GET {{BASE_URL}}/api/ext/hotel/<<Hotel-ID>>/<<Room_Rate_Session_ID>>/price/recommendation/<<Room Choice ID>>`
   - Get specific pricing recommendations for selected rooms

6. **Book Hotel**
   - Endpoint: `POST {{BASE_URL}}/api/ext/hotel/<<hotelId>>/<<token>>/book`
   - This is where the actual booking and payment would happen
   - You'll need the hotel ID and a token (likely received from the previous steps)

7. **Get Booking Details**
   - Endpoint: `GET {{BASE_URL}}/api/ext/hotel/getBookingDetails`
   - Query parameters: `bookingId` and `currency`
   - Retrieve details of a completed booking

8. **Get Cancellation Penalties**
   - Endpoint: `GET {{BASE_URL}}/api/ext/hotel/bookingCancellationFee`
   - Query parameter: `bookingId`
   - Check cancellation fees

9. **Cancel Booking**
   - Endpoint: `POST {{BASE_URL}}/api/ext/hotel/booking/cancel`
   - Request body includes `bookingId` and `token` (cancellation policy reference ID)

## Resort Service API Workflow

1. **Auto-suggest**
   - Endpoint: `GET {{base_url}}/api/v2/search?key=<search term>`
   - Search for resort properties

2. **Get Accessibility Features**
   - Endpoint: `GET {{base_url}}/api/v2/property/{{propertyId}}?facility=accessibilities`
   - Get accessibility information for a specific property

3. **Check Availability**
   - Endpoint: `GET {{base_url}}/api/v2/properties/availability`
   - Query parameters: `checkin`, `checkout`, `property_id`, `currency`
   - Check if a resort is available for specific dates

## Example Configuration

Here's an example of how to configure the API in your code (using Node.js with Axios):

```javascript
// Configuration for Hotel API
const hotelApiConfig = {
  baseURL: 'YOUR_BASE_URL_HERE', // Replace with actual base URL
  headers: {
    'x-xeni-token': 'YOUR_API_KEY_HERE', // Replace with your API key
    'x-session-id': generateUniqueId() // Function to generate unique ID
  }
};

// Configuration for Resort Service API
const resortApiConfig = {
  baseURL: 'https://dev.api.xeni.com/resortservice', // Or your actual base URL
  headers: {
    'x-api-key': 'YOUR_API_KEY_HERE', // Replace with your API key
    'x-correlation-id': generateUniqueId() // Function to generate unique ID
  }
};

// Create axios instances
const hotelApi = axios.create(hotelApiConfig);
const resortApi = axios.create(resortApiConfig);

// Example function to generate unique IDs
function generateUniqueId() {
  return 'req-' + Date.now() + '-' + Math.random().toString(36).substring(2, 15);
}
```

## Handling Dynamic Parameters

Many endpoints use dynamic parameters in the URL or as query parameters:

- `<<Hotel-ID>>` - The ID of the hotel you're working with
- `<<Room_Rate_Session_ID>>` - A session ID received from a previous call
- `<<Room Choice ID>>` - The ID of a specific room option
- `<<token>>` - A token for specific operations, received from previous calls
- `<<bookingId>>` - An ID to track bookings

These should be replaced with actual values in your code as you progress through the booking flow.

## Troubleshooting

If you encounter connection issues:

1. Check that your API key is correct and properly included in headers
2. Verify that you're using the correct base URL for the environment
3. Ensure all required headers are included for each endpoint
4. Make sure request payloads match the expected format
5. Check network connectivity to the API endpoint

## Next Steps

1. Get your API credentials from Xeni
2. Determine the correct base URLs for your environment
3. Implement the API calls in your preferred programming language
4. Test each endpoint in sequence to understand the complete workflow
