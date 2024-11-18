const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function executeCommand(command) {
    try {
        // 添加錯誤處理和日誌
        console.log(`Executing command: ${command}`);
        
        const { stdout, stderr } = await exec(command, {
            // 設置超時
            timeout: 10000,
            // 設置最大緩衝區
            maxBuffer: 1024 * 1024,
            // 設置環境變數
            env: { ...process.env, LANG: 'en_US.UTF-8' }
        });

        if (stderr) {
            console.error(`Command stderr: ${stderr}`);
        }

        return {
            success: true,
            output: stdout,
            error: stderr
        };
    } catch (error) {
        console.error(`Command error: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = executeCommand;