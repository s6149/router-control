const networkService = require('../../src/services/networkService');
const executeCommand = require('../../src/utils/executeCommand');

// 在所有測試開始前 mock executeCommand
jest.mock('../../src/utils/executeCommand', () => {
    return jest.fn().mockImplementation((command) => {
        return Promise.resolve({
            success: true,
            output: 'mock output',
            error: ''
        });
    });
});

describe('NetworkService Unit Tests', () => {
    // 每個測試開始前清除 mock 的調用記錄
    beforeEach(() => {
        executeCommand.mockClear();
    });

    test('getNetworkInterfaces should execute ip command', async () => {
        const result = await networkService.getNetworkInterfaces();
        expect(result).toBeDefined();
        expect(executeCommand).toHaveBeenCalledWith('ip a');
    });

    test('getRoutingTable should execute ip route command', async () => {
        const result = await networkService.getRoutingTable();
        expect(result).toBeDefined();
        expect(executeCommand).toHaveBeenCalledWith('ip route');
    });

    test('updateRoute should validate input parameters', async () => {
        const destination = '192.168.1.0/24';
        const gateway = '192.168.1.1';
        const result = await networkService.updateRoute(destination, gateway);
        expect(result.success).toBeDefined();
        expect(executeCommand).toHaveBeenCalledWith(`ip route add ${destination} via ${gateway}`);
    });
});