const dhcpService = require('../services/dhcpService');
const { validationResult } = require('express-validator');

class DhcpController {
    // 獲取 DHCP 客戶端列表
    async getDhcpClients(req, res) {
        try {
            const clients = await dhcpService.getDhcpClients();
            res.json({
                success: true,
                data: clients
            });
        } catch (error) {
            console.error('DHCP clients error:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to get DHCP clients'
            });
        }
    }

    // 獲取 DHCP 配置
    async getDhcpConfig(req, res) {
        try {
            const config = await dhcpService.getDhcpConfig();
            res.json({
                success: true,
                data: config
            });
        } catch (error) {
            console.error('DHCP config error:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to get DHCP configuration'
            });
        }
    }

    // 更新 DHCP 配置
    async updateDhcpConfig(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const result = await dhcpService.updateDhcpConfig(req.body);
            res.json(result);
        } catch (error) {
            console.error('Update DHCP config error:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to update DHCP configuration'
            });
        }
    }
}

module.exports = new DhcpController();