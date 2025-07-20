// 测试修复后的规则生成逻辑
console.log('=== 测试修复后的规则生成 ===\n');

// 模拟规则集数据
const RULE_SETS = [
    {
        id: 'loyalsoldier-reject',
        name: 'Reject',
        category: 'block',
        rules: ['DOMAIN-SUFFIX,doubleclick.net', 'DOMAIN-SUFFIX,googleadservices.com'],
        enabled: true
    },
    {
        id: 'loyalsoldier-direct',
        name: 'Direct',
        category: 'direct',
        rules: ['DOMAIN-SUFFIX,baidu.com', 'DOMAIN-SUFFIX,qq.com', 'IP-CIDR,192.168.0.0/16'],
        enabled: true
    },
    {
        id: 'loyalsoldier-proxy',
        name: 'Proxy',
        category: 'proxy',
        rules: ['DOMAIN-SUFFIX,google.com', 'DOMAIN-SUFFIX,youtube.com'],
        enabled: true
    }
];

// 修复后的规则生成函数
function generateFinalRulesForMode(mode, currentRuleSets, currentCustomRules) {
    switch (mode) {
        case 'ruleset':
            const enabledRuleSets = currentRuleSets.filter(rs => rs.enabled);
            const allRules = [];
            
            // 按优先级排序：block > direct > proxy
            const sortedRuleSets = enabledRuleSets.sort((a, b) => {
                const priority = { block: 0, direct: 1, proxy: 2 };
                return priority[a.category] - priority[b.category];
            });
            
            sortedRuleSets.forEach(ruleSet => {
                ruleSet.rules.forEach(rule => {
                    if (ruleSet.category === 'block') {
                        // 阻止规则：使用!前缀表示例外（这些域名走代理）
                        allRules.push(`domain:!${rule.replace(/^DOMAIN-SUFFIX,/, '')}`);
                    } else if (ruleSet.category === 'direct') {
                        // 直连规则
                        if (rule.startsWith('DOMAIN-SUFFIX,')) {
                            const domain = rule.replace('DOMAIN-SUFFIX,', '');
                            // 如果是通配符域名，使用domain:*.格式
                            allRules.push(`domain:*.${domain}`);
                        } else if (rule.startsWith('IP-CIDR,')) {
                            // IP段规则，使用ip:前缀
                            allRules.push(`ip:${rule.replace('IP-CIDR,', '')}`);
                        }
                    }
                    // proxy 类型的规则不需要添加到直连列表中，因为默认就是走代理
                });
            });
            
            // 使用换行符连接规则，这是解析器期望的格式
            return allRules.join('\n');
            
        case 'blacklist':
        case 'whitelist':
            return currentCustomRules;
            
        default:
            return '';
    }
}

// 测试规则集模式
console.log('1. 规则集模式测试:');
const rulesetRules = generateFinalRulesForMode('ruleset', RULE_SETS, '');
console.log(rulesetRules);
console.log('');

// 测试黑名单模式
console.log('2. 黑名单模式测试:');
const blacklistRules = `domain:google.com
domain:*.youtube.com
ip:8.8.8.8
app:chrome.exe`;
const blacklistResult = generateFinalRulesForMode('blacklist', RULE_SETS, blacklistRules);
console.log(blacklistResult);
console.log('');

// 测试白名单模式
console.log('3. 白名单模式测试:');
const whitelistRules = `domain:baidu.com
domain:*.cn
ip:114.114.114.114
app:wechat.exe`;
const whitelistResult = generateFinalRulesForMode('whitelist', RULE_SETS, whitelistRules);
console.log(whitelistResult);
console.log('');

console.log('=== 关键修复点 ===');
console.log('✅ 1. 修复了规则格式：使用换行符而不是",\\n"连接规则');
console.log('✅ 2. 修复了IP规则前缀：使用"ip:"而不是"range:"');
console.log('✅ 3. 修复了域名规则格式：使用"domain:*.domain.com"格式');
console.log('✅ 4. 只在连接状态下显示重新连接提示');
console.log('✅ 5. 实现了自动保存机制，无需手动保存按钮');
console.log('');
console.log('现在规则应该能正确应用了！用户需要在更改规则后重新连接以应用新规则。');