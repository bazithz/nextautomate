// Netlify Serverless Function - Secure API Handler
// This runs on Netlify's servers, NOT in the browser

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed. Please use POST.' })
    };
  }

  try {
    console.log('Function called');
    
    // Parse the request body
    const { prompt } = JSON.parse(event.body);

    if (!prompt || prompt.trim().length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Prompt is required' })
      };
    }

    console.log('Prompt received:', prompt);

    // Get API key from environment variable
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY not found in environment variables');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API key not configured. Please add ANTHROPIC_API_KEY to Netlify environment variables.' })
      };
    }

    console.log('API key found, calling Anthropic API...');

    // Call Anthropic API using native fetch (available in Node 18+)
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `You are helping a user write a detailed automation workflow description for a contact form. The user has provided this brief idea: "${prompt}"

Generate a professional, detailed description (approximately 200 words) that explains:
1. What automation workflow they want to build
2. Key features and processes involved
3. Expected outcomes and benefits
4. Any technical requirements

Write in first person (use "I" and "we") as if the user is describing their needs. Be specific and professional. Do not use bullet points, write in paragraph form.`
        }]
      })
    });

    console.log('Anthropic API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', errorText);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: 'Failed to generate text from AI',
          details: errorText 
        })
      };
    }

    const data = await response.json();
    console.log('Successfully received AI response');
    
    // Extract the generated text
    const generatedText = data.content[0].text;

    // Return success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        generatedText: generatedText,
        success: true
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};