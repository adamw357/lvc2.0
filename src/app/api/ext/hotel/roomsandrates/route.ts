import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { XENI_BASE_URL, XENI_API_KEY } from '@/config/xeni'; // Assuming config is here
import { randomUUID } from 'crypto'; // For generating new correlation IDs

// App Route handler for POST requests
export async function POST(req: NextRequest) {
  console.log('[App Route] Received POST request');

  // 1. Extract required data from the incoming request body
  let body;
  try {
    body = await req.json();
  } catch (e) {
    console.error('[App Route] Failed to parse request body:', e);
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { hotelId, checkInDate, checkOutDate, occupancies, lat, lng, currency } = body;

  // Basic validation (can add more thorough checks)
  if (!hotelId || !checkInDate || !checkOutDate || !occupancies || lat === undefined || lng === undefined || !currency) {
    console.error('[App Route] Missing required fields:', body);
    return NextResponse.json({ error: 'Missing required fields in request body.' }, { status: 400 });
  }

  // 2. Prepare request for the external Xeni API
  const externalApiPath = '/hotel/roomsandrates'; // Path at Xeni API
  const cleanBaseUrl = XENI_BASE_URL?.replace(/\/$/, '') || '';
  const externalUrl = `${cleanBaseUrl}${externalApiPath}`;

  const externalSessionId = randomUUID();
  const externalCorelationId = randomUUID();

  const externalHeaders = {
    'Content-Type': 'application/json',
    'x-xeni-token': XENI_API_KEY || '',
    'x-session-id': externalSessionId,
    'corelationId': externalCorelationId,
    'Accept-Encoding': 'gzip, deflate, br',
  };

  // Use the original parsed body for the external request
  const externalBody = JSON.stringify(body);

  console.log(`[App Route] Proxying to Xeni API: ${externalUrl}`);

  // 3. Make the call to the external Xeni API
  try {
    const externalResponse = await fetch(externalUrl, {
      method: 'POST',
      headers: externalHeaders,
      body: externalBody,
    });

    // Log raw response text for debugging the persistent parsing issue
    const responseTextForDebug = await externalResponse.clone().text(); 
    console.log('[App Route] Raw response text from Xeni:', responseTextForDebug);

    // 4. Handle the response from Xeni
    if (!externalResponse.ok) {
      console.error(`[App Route] Xeni API Error (${externalResponse.status}): ${responseTextForDebug}`);
      // Forward the status and potentially the error text
      // Use NextResponse for App Router responses
      return NextResponse.json(
        { 
          error: `External API Error: ${externalResponse.statusText}`,
          details: responseTextForDebug
        },
        { status: externalResponse.status }
      );
    }

    // If Xeni API call is successful, try parsing its JSON response
    let responseData;
    try {
        // IMPORTANT: Use the cloned text response for parsing, as response.json() might have issues
        responseData = JSON.parse(responseTextForDebug);
    } catch (parseError) {
        console.error('[App Route] Failed to parse Xeni response text:', parseError, responseTextForDebug);
        return NextResponse.json(
            { error: 'Failed to parse response from external API.' }, 
            { status: 500 } 
        );
    }

    // 5. Send the successful response back to the frontend client
    // Use NextResponse.json to send the response
    return NextResponse.json(responseData); 

  } catch (error) {
    // Handle network errors during the fetch to Xeni
    console.error('[App Route] Error fetching from external API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json(
        { error: 'Failed to fetch data from external API.', details: errorMessage }, 
        { status: 500 } 
    );
  }
} 