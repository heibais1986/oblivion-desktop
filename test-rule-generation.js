// 测试规则生成逻辑
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
        rules: ['DOMAIN-SUFFIX,baidu.com', 'IP-CIDR,192.168.0.0/16'],
        enabled: true
    }
];

function generateRules() {
    const enabledRuleSets = RULE_SETS.filter((rs) => rs.enabled);
    const allRules = [];

    enabledRuleSets.forEach((ruleSet) => {
        ruleSet.rules.forEach((rule) => {
            if (ruleSet.category === 'block') {
                allRules.push(`domain:!${rule.replace(/^DOMAIN-SUFFIX,/, '')}`);
            } else if (ruleSet.category === 'direct') {
                if (rule.startsWith('DOMAIN-SUFFIX,')) {
                    const domain = rule.replace('DOMAIN-SUFFIX,', '');
                    allRules.push(`domain:*.${domain}`);
                } else if (rule.startsWith('IP-CIDR,')) {
                    allRules.push(`ip:${rule.replace('IP-CIDR,', '')}`);
                }
            }
        });
    });

    return allRules.join('\n');
}

console.log('Generated rules:');
console.log(generateRules());
console.log('\nThis should be the format that the routing rule parser expects.');
