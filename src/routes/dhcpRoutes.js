const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const dhcpController = require('../controllers/dhcpController');

// 獲取 DHCP 客戶端列表
router.get('/clients', dhcpController.getDhcpClients);

// 獲取 DHCP 配置
router.get('/config', dhcpController.getDhcpConfig);

// 更新 DHCP 配置
router.post('/config', [
    body('subnet').notEmpty().matches(/^\d+\.\d+\.\d+\.\d+$/),
    body('netmask').notEmpty().matches(/^\d+\.\d+\.\d+\.\d+$/),
    body('range.start').notEmpty().matches(/^\d+\.\d+\.\d+\.\d+$/),
    body('range.end').notEmpty().matches(/^\d+\.\d+\.\d+\.\d+$/),
    body('defaultLeaseTime').notEmpty().isInt(),
    body('maxLeaseTime').notEmpty().isInt(),
    body('routers').isArray(),
    body('dnsServers').isArray()
], dhcpController.updateDhcpConfig);

module.exports = router;