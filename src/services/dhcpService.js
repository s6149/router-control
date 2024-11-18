const executeCommand = require('../utils/executeCommand');
const fs = require('fs').promises;

class DhcpService {
    // 獲取 DHCP 客戶端列表
    async getDhcpClients() {
        try {
            // 先檢查 dhcpd.leases 文件是否存在
            const leasesExists = await executeCommand('test -f /var/lib/dhcp/dhcpd.leases && echo "exists"');
            
            if (!leasesExists.success) {
                // 如果不是用 isc-dhcp-server，嘗試使用 dnsmasq
                const dnsmasqLeases = await executeCommand('cat /var/lib/misc/dnsmasq.leases');
                if (dnsmasqLeases.success) {
                    return this.parseDnsmasqLeases(dnsmasqLeases.output);
                }
            } else {
                const dhcpdLeases = await executeCommand('cat /var/lib/dhcp/dhcpd.leases');
                return this.parseIscDhcpLeases(dhcpdLeases.output);
            }

            // 如果都沒有找到，嘗試從系統日誌獲取信息
            const systemLog = await executeCommand('journalctl -u dhcpd -n 50');
            return this.parseSystemLog(systemLog.output);
        } catch (error) {
            console.error('Error getting DHCP clients:', error);
            throw error;
        }
    }

    // 解析 ISC DHCP 租約文件
    parseIscDhcpLeases(leasesData) {
        const leases = [];
        const blocks = leasesData.split('lease');
        
        blocks.forEach(block => {
            if (!block.trim()) return;
            
            const ipMatch = block.match(/(\d+\.\d+\.\d+\.\d+)/);
            const macMatch = block.match(/hardware ethernet ([a-fA-F0-9:]+);/);
            const hostnameMatch = block.match(/client-hostname "([^"]+)";/);
            const startMatch = block.match(/starts \d+ ([^;]+);/);
            const endMatch = block.match(/ends \d+ ([^;]+);/);

            if (ipMatch) {
                leases.push({
                    ip: ipMatch[1],
                    mac: macMatch ? macMatch[1] : 'Unknown',
                    hostname: hostnameMatch ? hostnameMatch[1] : 'Unknown',
                    startTime: startMatch ? startMatch[1] : 'Unknown',
                    endTime: endMatch ? endMatch[1] : 'Unknown',
                    status: block.includes('binding state active') ? 'active' : 'inactive'
                });
            }
        });

        return leases;
    }

    // 解析 dnsmasq 租約文件
    parseDnsmasqLeases(leasesData) {
        return leasesData.split('\n')
            .filter(line => line.trim())
            .map(line => {
                const [timestamp, mac, ip, hostname, clientId] = line.split(' ');
                return {
                    ip,
                    mac,
                    hostname: hostname !== '*' ? hostname : 'Unknown',
                    startTime: new Date(timestamp * 1000).toISOString(),
                    status: 'active'
                };
            });
    }

    // 獲取 DHCP 配置
    async getDhcpConfig() {
        try {
            // 檢查是否安裝了 isc-dhcp-server
            const dhcpdConf = await executeCommand('test -f /etc/dhcp/dhcpd.conf && cat /etc/dhcp/dhcpd.conf');
            
            if (dhcpdConf.success) {
                return this.parseIscDhcpConfig(dhcpdConf.output);
            }

            // 如果沒有 isc-dhcp-server，檢查 dnsmasq
            const dnsmasqConf = await executeCommand('test -f /etc/dnsmasq.conf && cat /etc/dnsmasq.conf');
            
            if (dnsmasqConf.success) {
                return this.parseDnsmasqConfig(dnsmasqConf.output);
            }

            // 如果都沒有找到，返回錯誤
            throw new Error('No DHCP server configuration found');
        } catch (error) {
            console.error('Error getting DHCP config:', error);
            throw error;
        }
    }

    // 解析 ISC DHCP 配置
    parseIscDhcpConfig(configData) {
        const config = {
            subnet: '',
            netmask: '',
            range: {
                start: '',
                end: ''
            },
            defaultLeaseTime: '',
            maxLeaseTime: '',
            routers: [],
            dnsServers: []
        };

        const lines = configData.split('\n');
        let insideSubnet = false;

        lines.forEach(line => {
            line = line.trim();
            
            if (line.startsWith('subnet')) {
                insideSubnet = true;
                const match = line.match(/subnet\s+(\S+)\s+netmask\s+(\S+)/);
                if (match) {
                    config.subnet = match[1];
                    config.netmask = match[2];
                }
            } else if (insideSubnet && line.includes('range')) {
                const match = line.match(/range\s+(\S+)\s+(\S+)/);
                if (match) {
                    config.range.start = match[1];
                    config.range.end = match[2];
                }
            } else if (line.includes('default-lease-time')) {
                const match = line.match(/default-lease-time\s+(\d+)/);
                if (match) config.defaultLeaseTime = match[1];
            } else if (line.includes('max-lease-time')) {
                const match = line.match(/max-lease-time\s+(\d+)/);
                if (match) config.maxLeaseTime = match[1];
            } else if (line.includes('option routers')) {
                const match = line.match(/option\s+routers\s+(.+);/);
                if (match) config.routers = match[1].split(',').map(r => r.trim());
            } else if (line.includes('option domain-name-servers')) {
                const match = line.match(/option\s+domain-name-servers\s+(.+);/);
                if (match) config.dnsServers = match[1].split(',').map(d => d.trim());
            }
        });

        return config;
    }

    // 解析 dnsmasq 配置
    parseDnsmasqConfig(configData) {
        const config = {
            subnet: '',
            netmask: '',
            range: {
                start: '',
                end: ''
            },
            defaultLeaseTime: '3600', // dnsmasq 默認值
            maxLeaseTime: '7200',     // dnsmasq 默認值
            routers: [],
            dnsServers: []
        };

        const lines = configData.split('\n');
        
        lines.forEach(line => {
            line = line.trim();
            
            if (line.startsWith('dhcp-range=')) {
                const parts = line.substring(11).split(',');
                config.range.start = parts[0];
                config.range.end = parts[1];
                if (parts.length > 2) {
                    config.maxLeaseTime = parts[2];
                }
            } else if (line.startsWith('dhcp-option=3,')) {
                config.routers = [line.substring(14)];
            } else if (line.startsWith('dhcp-option=6,')) {
                config.dnsServers = line.substring(14).split(',');
            }
        });

        // 從網絡介面獲取子網信息
        return config;
    }

    // 更新 DHCP 配置
    async updateDhcpConfig(config) {
        try {
            const configContent = this.generateDhcpConfig(config);
            
            // 備份現有配置
            await executeCommand('sudo cp /etc/dhcp/dhcpd.conf /etc/dhcp/dhcpd.conf.backup');
            
            // 寫入新配置
            const writeResult = await executeCommand(`echo '${configContent}' | sudo tee /etc/dhcp/dhcpd.conf`);
            
            if (!writeResult.success) {
                throw new Error('Failed to write DHCP configuration');
            }
            
            // 重啟 DHCP 服務
            const restartResult = await executeCommand('sudo systemctl restart isc-dhcp-server');
            
            if (!restartResult.success) {
                // 如果重啟失敗，嘗試恢復備份
                await executeCommand('sudo cp /etc/dhcp/dhcpd.conf.backup /etc/dhcp/dhcpd.conf');
                throw new Error('Failed to restart DHCP server');
            }
            
            return { success: true, message: 'DHCP configuration updated successfully' };
        } catch (error) {
            console.error('Error updating DHCP config:', error);
            throw error;
        }
    }
}

module.exports = new DhcpService();