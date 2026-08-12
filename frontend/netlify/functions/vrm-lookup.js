import { getVrmDetails } from '../../server/vrmHandler.js';

export async function handler(event) {
  const vrm = event.queryStringParameters?.vrm;

  try {
    const details = await getVrmDetails(vrm);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(details),
    };
  } catch (err) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: err.message || 'Lookup failed' }),
    };
  }
}
