const executeCommand = require('../utils/executeCommand');

class NetworkService {
    async getNetworkInterfaces() {
        return await executeCommand('ip a');
    }

    async getRoutingTable() {
        return await executeCommand('ip route');
    }

    async updateRoute(destination, gateway) {
        const command = `ip route add ${destination} via ${gateway}`;
        return await executeCommand(command);
    }
}

module.exports = new NetworkService();