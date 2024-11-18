const firewallService = require('../services/firewallService');
const { validationResult } = require('express-validator');

class FirewallController {
    // 獲取所有防火牆規則
    async getRules(req, res) {
        try {
            const rules = await firewallService.getRules();
            res.json({
                success: true,
                data: rules
            });
        } catch (error) {
            console.error('Get firewall rules error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // 添加新規則
    async addRule(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const result = await firewallService.addRule(req.body);
            res.json(result);
        } catch (error) {
            console.error('Add firewall rule error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // 刪除規則
    async deleteRule(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { ruleNumber, chain } = req.params;
            const result = await firewallService.deleteRule(ruleNumber, chain);
            res.json(result);
        } catch (error) {
            console.error('Delete firewall rule error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // 清空所有規則
    async flushRules(req, res) {
        try {
            const result = await firewallService.flushRules();
            res.json(result);
        } catch (error) {
            console.error('Flush firewall rules error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // 設置默認策略
    async setDefaultPolicy(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { chain, policy } = req.body;
            const result = await firewallService.setDefaultPolicy(chain, policy);
            res.json(result);
        } catch (error) {
            console.error('Set default policy error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new FirewallController();