import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

type Session = {
  id: string;
  userId: string;
  taskName: string;
  startedAt: string;
  endedAt: string;
  focusDuration: number;
  interrupted: boolean;
};

export async function recordSession(
  req: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const body = (await req.json()) as Session | null;

  if (!body || !body.userId || !body.taskName) {
    return { status: 400, jsonBody: { message: 'Invalid session payload' } };
  }

  context.log('Record session', body.id);

  return {
    status: 200,
    jsonBody: { ok: true },
  };
}

app.http('recordSession', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'sessions',
  handler: recordSession,
});
