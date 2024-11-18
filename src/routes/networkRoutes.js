const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const networkController = require('../controllers/networkController');
// 獲取網路狀態
router.get('/status', networkController.getNetworkStatus);

// 獲取路由表
// 注意：這裡必須使用正確的控制器方法
router.get('/route', networkController.getRoutingTable);

// 更新/添加路由
router.post('/route', [
    body('destination').notEmpty(),
    body('gateway').notEmpty().isIP()
], networkController.updateRoute);

// 測試端點
router.get('/test', (req, res) => {
    res.json({
        status: 'ok',
        message: 'API is working',
        timestamp: new Date()
    });
});

// 路由表單頁面
router.get('/route-form', (req, res) => {
    res.send(`
        <html>
            <body>
                <h2>Add New Route</h2>
                <form id="routeForm">
                    <div>
                        <label>Destination:</label>
                        <input type="text" name="destination" required>
                    </div>
                    <div>
                        <label>Gateway:</label>
                        <input type="text" name="gateway" required>
                    </div>
                    <button type="submit">Add Route</button>
                </form>
                <div id="result"></div>

                <script>
                    document.getElementById('routeForm').onsubmit = async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        try {
                            const response = await fetch('/api/network/route', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    destination: formData.get('destination'),
                                    gateway: formData.get('gateway')
                                })
                            });
                            const result = await response.json();
                            document.getElementById('result').textContent = 
                                JSON.stringify(result, null, 2);
                        } catch (error) {
                            document.getElementById('result').textContent = 
                                'Error: ' + error.message;
                        }
                    };
                </script>
            </body>
        </html>
    `);
});

module.exports = router;