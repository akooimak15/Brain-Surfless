import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { CosmosClient } from '@azure/cosmos';

type Session = {
  id: string;
  userId: string;
  taskName: string;
  startedAt: string;
  endedAt: string;
  focusDuration: number;
  interrupted: number | boolean;
  pointsEarned?: number;
  createdAt?: string;
};

function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function getCosmosClient() {
  const connectionString =
    process.env.COSMOS_CONNECTION_STRING ??
    process.env.AZURE_COSMOS_CONNECTION_STRING;

  if (connectionString) {
    return new CosmosClient(connectionString);
  }

  const endpoint = process.env.AZURE_COSMOS_ENDPOINT;
  const key = process.env.AZURE_COSMOS_KEY;
  if (!endpoint || !key) {
    throw new Error('Cosmos env vars are missing');
  }

  return new CosmosClient({ endpoint, key });
}

function getContainer() {
  const dbName =
    process.env.COSMOS_DB_NAME ??
    process.env.AZURE_COSMOS_DB_NAME ??
    'brainsurfless';
  const containerName =
    process.env.COSMOS_CONTAINER_NAME ??
    process.env.AZURE_COSMOS_CONTAINER ??
    'sessions';

  const client = getCosmosClient();
  return client.database(dbName).container(containerName);
}

function toInterruptedCount(value: number | boolean | undefined) {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return Math.floor(value);
  }
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }
  return 0;
}

export async function recordSession(
  req: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    const body = (await req.json()) as Partial<Session> | null;

    if (!body || typeof body !== 'object') {
      return { status: 400, jsonBody: { message: 'Invalid session payload' } };
    }

    if (!body.userId || typeof body.userId !== 'string') {
      return { status: 400, jsonBody: { message: 'userId is required' } };
    }
    if (!body.taskName || typeof body.taskName !== 'string') {
      return { status: 400, jsonBody: { message: 'taskName is required' } };
    }
    if (!body.startedAt || typeof body.startedAt !== 'string') {
      return { status: 400, jsonBody: { message: 'startedAt is required' } };
    }
    if (!body.endedAt || typeof body.endedAt !== 'string') {
      return { status: 400, jsonBody: { message: 'endedAt is required' } };
    }
    if (typeof body.focusDuration !== 'number' || !Number.isFinite(body.focusDuration) || body.focusDuration < 0) {
      return { status: 400, jsonBody: { message: 'focusDuration is invalid' } };
    }

    if (body.id !== undefined && typeof body.id !== 'string') {
      return { status: 400, jsonBody: { message: 'id is invalid' } };
    }

    const session: Session = {
      id: body.id ?? createId('session'),
      userId: body.userId,
      taskName: body.taskName,
      startedAt: body.startedAt,
      endedAt: body.endedAt,
      focusDuration: body.focusDuration,
      interrupted: toInterruptedCount(body.interrupted),
      pointsEarned:
        typeof body.pointsEarned === 'number' && Number.isFinite(body.pointsEarned)
          ? body.pointsEarned
          : 0,
      createdAt: typeof body.createdAt === 'string' ? body.createdAt : new Date().toISOString(),
    };

    const container = getContainer();
    await container.items.upsert(session);

    context.log('Record session', session.id);

    return {
      status: 201,
      jsonBody: { success: true, session },
    };
  } catch (error) {
    context.error('recordSession error:', error);

    const cosmosCode = (error as any)?.code;
    if (cosmosCode === 401) {
      return {
        status: 500,
        jsonBody: { error: 'Cosmos unauthorized (check COSMOS_CONNECTION_STRING / AZURE_COSMOS_KEY)' },
      };
    }

    return { status: 500, jsonBody: { error: 'Internal server error' } };
  }
}

app.http('recordSession', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'sessions',
  handler: recordSession,
});
