const { api } = require('../utils/testHelpers');

describe('Network API Integration Tests', () => {
    test('GET /network/test should return status ok', async () => {
        const response = await api.get('/network/test');
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('status', 'ok');
    });

    test('GET /network/status should return network information', async () => {
        const response = await api.get('/network/status');
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('interfaces');
        expect(response.data).toHaveProperty('routes');
    });

    test('POST /network/route should validate input', async () => {
        try {
            await api.post('/network/route', {
                // 缺少必要欄位
            });
        } catch (error) {
            expect(error.response.status).toBe(400);
        }
    });
});