import { app, HttpRequest, HttpResponseInit } from '@azure/functions';

export async function getStats(req: HttpRequest): Promise<HttpResponseInit> {
  const userId = req.query.get('userId');

  if (!userId) {
    return { status: 400, jsonBody: { message: 'Missing userId' } };
  }

  return {
    status: 200,
    jsonBody: {
      userId,
      totalSessions: 0,
      totalFocusSeconds: 0,
    },
  };
}

app.http('getStats', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'stats',
  handler: getStats,
});
