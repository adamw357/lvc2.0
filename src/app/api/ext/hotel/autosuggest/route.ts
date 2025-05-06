import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { XENI_BASE_URL, XENI_API_KEY } from '@/config/xeni';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  console.log('[Autosuggest Route] Received POST request');

  // Extract the search text from the request body
  let body;
  try {
    body = await req.json();
  } catch (e) {
    console.error('[Autosuggest Route] Failed to parse request body:', e);
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { text } = body;

  if (!text) {
    console.error('[Autosuggest Route] Missing text field:', body);
    return NextResponse.json({ error: 'Missing text field in request body.' }, { status: 400 });
  }

  // Prepare request for the external Xeni API
  const externalApiPath = '/hotel/autosuggest';
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

  const externalBody = JSON.stringify({ text });

  console.log(`[Autosuggest Route] Proxying to Xeni API: ${externalUrl}`);

  try {
    const externalResponse = await fetch(externalUrl, {
      method: 'POST',
      headers: externalHeaders,
      body: externalBody,
    });

    const responseTextForDebug = await externalResponse.clone().text();
    console.log('[Autosuggest Route] Raw response text from Xeni:', responseTextForDebug);

    if (!externalResponse.ok) {
      console.error(`[Autosuggest Route] Xeni API Error (${externalResponse.status}): ${responseTextForDebug}`);
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
      console.error('[Autosuggest Route] Failed to parse Xeni response text:', parseError, responseTextForDebug);
      return NextResponse.json(
        { error: 'Failed to parse response from external API.' }, 
        { status: 500 } 
      );
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('[Autosuggest Route] Error fetching from external API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json(
      { error: 'Failed to fetch data from external API.', details: errorMessage }, 
      { status: 500 } 
    );
  }
} 