const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const firewallController = require('../controllers/firewallController');

// 獲取所有規則
router.get('/rules', firewallController.getRules);

// 添加新規則
router.post('/rules', [
    body('chain').isString().notEmpty(),
    body('protocol').optional().isString(),
    body('source').optional().isString(),
    body('destination').optional().isString(),
    body('target').isString().notEmpty(),
    body('ports').optional().isString(),
    body('state').optional().isString()
], firewallController.addRule);

// 刪除規則
router.delete('/rules/:chain/:ruleNumber', [
    param('chain').isString().notEmpty(),
    param('ruleNumber').isInt()
], firewallController.deleteRule);

// 清空所有規則
router.delete('/rules', firewallController.flushRules);

// 設置默認策略
router.post('/policy', [
    body('chain').isString().notEmpty(),
    body('policy').isIn(['ACCEPT', 'DROP', 'REJECT'])
], firewallController.setDefaultPolicy);

module.exports = router;