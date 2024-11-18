const axios = require('axios');

// 先安裝 axios
// npm install axios

async function runTests() {
    try {
        // 測試 API 是否活著
        console.log('Testing API health...');
        const healthCheck = await axios.get('http://localhost:3000/api/network/test');
        console.log('Health check response:', healthCheck.data);

        // 測試獲取網路狀態
        console.log('\nTesting network status...');
        const networkStatus = await axios.get('http://localhost:3000/api/network/status');
        console.log('Network status response:', networkStatus.data);

        // 測試路由更新
        console.log('\nTesting route update...');
        const routeUpdate = await axios.post('http://localhost:3000/api/network/route', {
            destination: '192.168.1.0/24',
            gateway: '192.168.1.1'
        });
        console.log('Route update response:', routeUpdate.data);

    } catch (error) {
        console.error('Test failed:', error.response ? error.response.data : error.message);
    }
}

runTests();