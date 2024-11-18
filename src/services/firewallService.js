const executeCommand = require('../utils/executeCommand');

class FirewallService {
    // 獲取所有 iptables 規則
    async getRules() {
        try {
            const result = await executeCommand('sudo iptables-save');
            if (!result.success) {
                throw new Error('Failed to get firewall rules');
            }
            return this.parseRules(result.output);
        } catch (error) {
            console.error('Error getting firewall rules:', error);
            throw error;
        }
    }

    // 解析 iptables 規則
    parseRules(rulesString) {
        const chains = {};
        let currentChain = null;
        
        rulesString.split('\n').forEach(line => {
            line = line.trim();
            
            // 跳過空行和註釋
            if (!line || line.startsWith('#')) return;

            // 處理鏈的聲明
            if (line.startsWith('*')) {
                currentChain = line.substring(1);
                chains[currentChain] = {
                    policies: {},
                    rules: []
                };
            }
            // 處理鏈的默認策略
            else if (line.startsWith(':')) {
                const [chain, policy] = line.substring(1).split(' ');
                if (currentChain && chains[currentChain]) {
                    chains[currentChain].policies[chain] = policy.replace('[', '').replace(']', '');
                }
            }
            // 處理具體規則
            else if (line.startsWith('-A')) {
                if (currentChain) {
                    chains[currentChain].rules.push(this.parseRule(line));
                }
            }
        });

        return chains;
    }

    // 解析單條規則
    parseRule(ruleLine) {
        const parts = ruleLine.split(' ');
        const rule = {
            chain: parts[1],
            protocol: null,
            source: null,
            destination: null,
            target: null,
            ports: null,
            state: null,
            extra: []
        };

        for (let i = 2; i < parts.length; i++) {
            switch (parts[i]) {
                case '-p':
                    rule.protocol = parts[++i];
                    break;
                case '-s':
                    rule.source = parts[++i];
                    break;
                case '-d':
                    rule.destination = parts[++i];
                    break;
                case '-j':
                    rule.target = parts[++i];
                    break;
                case '--dport':
                case '--sport':
                    rule.ports = parts[++i];
                    break;
                case '-m':
                    if (parts[i + 1] === 'state') {
                        i += 2;
                        rule.state = parts[i];
                    } else {
                        rule.extra.push(parts[i]);
                    }
                    break;
                default:
                    rule.extra.push(parts[i]);
            }
        }

        return rule;
    }

    // 添加新規則
    async addRule(ruleData) {
        try {
            let command = 'sudo iptables -A';
            
            // 構建 iptables 命令
            if (ruleData.chain) {
                command += ` ${ruleData.chain}`;
            }
            if (ruleData.protocol) {
                command += ` -p ${ruleData.protocol}`;
            }
            if (ruleData.source) {
                command += ` -s ${ruleData.source}`;
            }
            if (ruleData.destination) {
                command += ` -d ${ruleData.destination}`;
            }
            if (ruleData.ports) {
                if (ruleData.protocol === 'tcp' || ruleData.protocol === 'udp') {
                    command += ` --dport ${ruleData.ports}`;
                }
            }
            if (ruleData.state) {
                command += ` -m state --state ${ruleData.state}`;
            }
            if (ruleData.target) {
                command += ` -j ${ruleData.target}`;
            }

            const result = await executeCommand(command);
            if (!result.success) {
                throw new Error(`Failed to add firewall rule: ${result.error}`);
            }

            // 保存規則
            const saveResult = await executeCommand('sudo iptables-save > /etc/iptables/rules.v4');
            if (!saveResult.success) {
                throw new Error('Failed to save firewall rules');
            }

            return { success: true };
        } catch (error) {
            console.error('Error adding firewall rule:', error);
            throw error;
        }
    }

    // 刪除規則
    async deleteRule(ruleNumber, chain = 'INPUT') {
        try {
            const result = await executeCommand(`sudo iptables -D ${chain} ${ruleNumber}`);
            if (!result.success) {
                throw new Error(`Failed to delete firewall rule: ${result.error}`);
            }

            // 保存規則
            const saveResult = await executeCommand('sudo iptables-save > /etc/iptables/rules.v4');
            if (!saveResult.success) {
                throw new Error('Failed to save firewall rules');
            }

            return { success: true };
        } catch (error) {
            console.error('Error deleting firewall rule:', error);
            throw error;
        }
    }

    // 清空所有規則
    async flushRules() {
        try {
            const result = await executeCommand('sudo iptables -F');
            if (!result.success) {
                throw new Error('Failed to flush firewall rules');
            }

            // 保存規則
            const saveResult = await executeCommand('sudo iptables-save > /etc/iptables/rules.v4');
            if (!saveResult.success) {
                throw new Error('Failed to save firewall rules');
            }

            return { success: true };
        } catch (error) {
            console.error('Error flushing firewall rules:', error);
            throw error;
        }
    }

    // 設置默認策略
    async setDefaultPolicy(chain, policy) {
        try {
            const result = await executeCommand(`sudo iptables -P ${chain} ${policy}`);
            if (!result.success) {
                throw new Error(`Failed to set default policy: ${result.error}`);
            }

            // 保存規則
            const saveResult = await executeCommand('sudo iptables-save > /etc/iptables/rules.v4');
            if (!saveResult.success) {
                throw new Error('Failed to save firewall rules');
            }

            return { success: true };
        } catch (error) {
            console.error('Error setting default policy:', error);
            throw error;
        }
    }
}

module.exports = new FirewallService();