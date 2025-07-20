// 测试应用程序规则处理
console.log('=== 测试应用程序规则处理 ===\n');

// 模拟Windows环境
const isWindows = true;

// 模拟processAppRule函数
function processAppRule(value, result) {
    const app = isWindows && !value.endsWith('.exe') ? `${value}.exe` : value;
    result.processSet.push(app);
}

// 模拟路由规则解析器
function parseRoutingRules(routingRules) {
    const result = {
        ipSet: [],
        domainSet: ['api.cloudflareclient.com'],
        domainSuffixSet: [],
        processSet: []
    };

    if (typeof routingRules !== 'string' || routingRules.trim() === '') {
        return result;
    }

    routingRules
        .split('\n')
        .map(line => line.trim().replace(/,$/, ''))
        .filter(Boolean)
        .forEach(line => {
            const [prefix, value] = line.split(':').map(part => part.trim());
            if (!value) return;

            switch (prefix) {
                case 'ip':
                    result.ipSet.push(value);
                    break;
                case 'domain':
                    if (value.startsWith('*')) {
                        result.domainSuffixSet.push(value.substring(2));
                    } else {
                        result.domainSet.push(value.replace('www.', ''));
                    }
                    break;
                case 'app':
                    processAppRule(value, result);
                    break;
                default:
                    break;
            }
        });

    return result;
}

// 测试你的应用程序规则
const testRules = `app:wechat.exe
app:boarderfree.exe
app:firefox.exe
app:WeChatAppEx.exe`;

console.log('输入的规则:');
console.log(testRules);
console.log('');

const parsedResult = parseRoutingRules(testRules);
console.log('解析后的processSet:');
console.log(parsedResult.processSet);
console.log('');

// 测试不同的应用程序名称格式
const testCases = [
    'wechat.exe',
    'WeChat.exe', 
    'WECHAT.EXE',
    'wechat',
    'WeChat',
    'WECHAT'
];

console.log('测试不同格式的应用程序名称:');
testCases.forEach(appName => {
    const testRule = `app:${appName}`;
    const result = parseRoutingRules(testRule);
    console.log(`${appName} -> ${result.processSet[0]}`);
});

console.log('');
console.log('=== 关键发现 ===');
console.log('1. 应用程序规则解析正常');
console.log('2. Windows下会自动添加.exe后缀');
console.log('3. 应用程序名称是大小写敏感的！');
console.log('4. 需要确保应用程序名称与实际进程名完全匹配');
console.log('');
console.log('=== 可能的问题 ===');
console.log('1. 应用程序名称大小写不匹配');
console.log('2. 实际进程名与配置的名称不同');
console.log('3. 某些应用可能有多个进程名');
console.log('');
console.log('建议: 使用进程监视器查看实际的进程名称');