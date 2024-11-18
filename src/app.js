const express = require('express');
const cors = require('cors');
const networkRoutes = require('./routes/networkRoutes');
const dhcpRoutes = require('./routes/dhcpRoutes');  // 添加這行
const firewallRoutes = require('./routes/firewallRoutes'); // 確保這個路徑正確

const app = express();

app.use(cors());
app.use(express.json());

// 路由
app.use('/api/network', networkRoutes);
app.use('/api/dhcp', dhcpRoutes);  // 添加這行
app.use('/api/firewall', firewallRoutes); // 添加這行

// 錯誤處理
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const logger = require('./utils/logger');

// 請求日誌中間件
app.use((req, res, next) => {
    logger.info({
        method: req.method,
        path: req.path,
        ip: req.ip,
        timestamp: new Date()
    });
    next();
});

// 修改錯誤處理
app.use((err, req, res, next) => {
    logger.error({
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });
    res.status(500).send('Something broke!');
});