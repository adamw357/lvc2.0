import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { XENI_BASE_URL, XENI_API_KEY } from '@/config/xeni';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  console.log('[Hotel Search Route] Received POST request');

  // Extract search parameters from the request body
  let body;
  try {
    body = await req.json();
  } catch (e) {
    console.error('[Hotel Search Route] Failed to parse request body:', e);
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Get pagination parameters from query string
  const searchParams = req.nextUrl.searchParams;
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '50';

  // Add pagination to the request body
  const requestBody = {
    ...body,
    page: parseInt(page),
    limit: parseInt(limit)
  };

  // Prepare request for the external Xeni API
  const externalApiPath = '/hotel/search';
  const cleanBaseUrl = XENI_BASE_URL?.replace(/\/$/, '') || '';
  const externalUrl = `${cleanBaseUrl}${externalApiPath}`;

  const externalSessionId = randomUUID();
  const externalCorelationId = randomUUID();

  const externalHeaders = {
    'Content-Type': 'application/json',
    'x-xeni-token': XENI_API_KEY || '',
    'x-session-id': externalSessionId,
    'corelationId': externalCorelationId,
  };

  const externalBody = JSON.stringify(requestBody);

  console.log(`[Hotel Search Route] Proxying to Xeni API: ${externalUrl}`);

  try {
    const externalResponse = await fetch(externalUrl, {
      method: 'POST',
      headers: externalHeaders,
      body: externalBody,
    });

    const responseTextForDebug = await externalResponse.clone().text();
    console.log('[Hotel Search Route] Raw response text from Xeni:', responseTextForDebug);

    if (!externalResponse.ok) {
      console.error(`[Hotel Search Route] Xeni API Error (${externalResponse.status}): ${responseTextForDebug}`);
      return NextResponse.json(
        { 
          error: `External API Error: ${externalResponse.statusText}`,
          details: responseTextForDebug
        },
        { status: externalResponse.status }
      );
    }

    let responseData;
    try {
      responseData = JSON.parse(responseTextForDebug);
    } catch (parseError) {
      console.error('[Hotel Search Route] Failed to parse Xeni response text:', parseError, responseTextForDebug);
      return NextResponse.json(
        { error: 'Failed to parse response from external API.' }, 
        { status: 500 } 
      );
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('[Hotel Search Route] Error fetching from external API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json(
      { error: 'Failed to fetch data from external API.', details: errorMessage }, 
      { status: 500 } 
    );
  }
} 