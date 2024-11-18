const networkService = require('../services/networkService');
const { validationResult } = require('express-validator');

class NetworkController {
    // 獲取網路狀態
    async getNetworkStatus(req, res) {
        try {
            const interfaces = await networkService.getNetworkInterfaces();
            const routes = await networkService.getRoutingTable();
            
            res.json({
                interfaces: interfaces.output,
                routes: routes.output
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // 獲取路由表
    async getRoutingTable(req, res) {
        try {
            const routes = await networkService.getRoutingTable();
            res.json({
                success: true,
                data: routes.output
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // 更新路由
    async updateRoute(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { destination, gateway } = req.body;
        try {
            const result = await networkService.updateRoute(destination, gateway);
            if (result.success) {
                res.json({ 
                    success: true,
                    message: 'Route updated successfully' 
                });
            } else {
                res.status(400).json({ 
                    success: false,
                    error: result.error 
                });
            }
        } catch (error) {
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    }
}

module.exports = new NetworkController();