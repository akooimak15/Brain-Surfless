import { app } from '@azure/functions';
import { CosmosClient } from '@azure/cosmos';
function getCosmosClient() {
    const connectionString = process.env.COSMOS_CONNECTION_STRING ??
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
    const dbName = process.env.COSMOS_DB_NAME ??
        process.env.AZURE_COSMOS_DB_NAME ??
        'brainsurfless';
    const containerName = process.env.COSMOS_CONTAINER_NAME ??
        process.env.AZURE_COSMOS_CONTAINER ??
        'sessions';
    const client = getCosmosClient();
    return client.database(dbName).container(containerName);
}
export async function getStats(req, context) {
    try {
        const userId = req.query.get('userId');
        if (!userId) {
            return { status: 400, jsonBody: { error: 'userId is required' } };
        }
        const container = getContainer();
        const { resources: sessions } = await container.items
            .query({
            query: 'SELECT * FROM c WHERE c.userId = @userId ORDER BY c.startedAt DESC',
            parameters: [{ name: '@userId', value: userId }],
        })
            .fetchAll();
        const totalSessions = sessions.length;
        const totalFocusSeconds = sessions.reduce((acc, session) => acc + (typeof session.focusDuration === 'number' ? session.focusDuration : 0), 0);
        return {
            status: 200,
            jsonBody: {
                userId,
                totalSessions,
                totalFocusSeconds,
                sessions,
            },
        };
    }
    catch (error) {
        context.error('getStats error:', error);
        return { status: 500, jsonBody: { error: 'Internal server error' } };
    }
}
app.http('getStats', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'stats',
    handler: getStats,
});
