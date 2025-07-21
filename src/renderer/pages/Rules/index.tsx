import React, { useState, useEffect, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import classNames from 'classnames';
import { settings } from '../../lib/settings';
import useTranslate from '../../../localization/useTranslate';
import { useStore } from '../../store';
import { settingsHaveChangedToast } from '../../lib/toasts';
import { defaultSettings } from '../../../defaultSettings';
import Tabs from '../../components/Tabs';
import { RulesConfigManager, RuleMode } from '../../lib/rulesConfig';
import './Rules.css';

// 预定义规则集
interface RuleSet {
    id: string;
    name: string;
    description: string;
    category: string;
    url?: string;
    rules: string[];
    enabled: boolean;
}

// 预定义规则集数据
const RULE_SETS: RuleSet[] = [
    {
        id: 'loyalsoldier-reject',
        name: 'Reject',
        description: '广告域名列表',
        category: 'block',
        url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/reject.txt',
        rules: ['DOMAIN-SUFFIX,doubleclick.net', 'DOMAIN-SUFFIX,googleadservices.com'],
        enabled: true
    },
    {
        id: 'loyalsoldier-icloud',
        name: 'iCloud',
        description: 'iCloud 域名列表',
        category: 'direct',
        url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/icloud.txt',
        rules: ['DOMAIN-SUFFIX,icloud.com', 'DOMAIN-SUFFIX,apple-cloudkit.com'],
        enabled: true
    },
    {
        id: 'loyalsoldier-apple',
        name: 'Apple',
        description: 'Apple 在中国大陆可直连的域名列表',
        category: 'direct',
        url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/apple.txt',
        rules: ['DOMAIN-SUFFIX,apple.com', 'DOMAIN-SUFFIX,apple.com.cn'],
        enabled: true
    },
    {
        id: 'loyalsoldier-google',
        name: 'Google',
        description: 'Google 域名列表',
        category: 'proxy',
        url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/google.txt',
        rules: ['DOMAIN-SUFFIX,google.com', 'DOMAIN-SUFFIX,youtube.com'],
        enabled: false
    },
    {
        id: 'loyalsoldier-proxy',
        name: 'Proxy',
        description: '代理域名列表',
        category: 'proxy',
        url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/proxy.txt',
        rules: ['DOMAIN-SUFFIX,twitter.com', 'DOMAIN-SUFFIX,facebook.com'],
        enabled: false
    },
    {
        id: 'loyalsoldier-direct',
        name: 'Direct',
        description: '直连域名列表',
        category: 'direct',
        url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/direct.txt',
        rules: ['DOMAIN-SUFFIX,baidu.com', 'DOMAIN-SUFFIX,qq.com'],
        enabled: true
    },
    {
        id: 'loyalsoldier-private',
        name: 'Private',
        description: '私有网络专用域名列表',
        category: 'direct',
        url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/private.txt',
        rules: ['IP-CIDR,192.168.0.0/16', 'IP-CIDR,10.0.0.0/8'],
        enabled: true
    },
    {
        id: 'loyalsoldier-gfw',
        name: 'GFW',
        description: 'GFW 域名列表',
        category: 'proxy',
        url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/gfw.txt',
        rules: ['DOMAIN-SUFFIX,github.com', 'DOMAIN-SUFFIX,stackoverflow.com'],
        enabled: true
    },
    {
        id: 'loyalsoldier-tld-not-cn',
        name: 'TLD-NOT-CN',
        description: '非中国大陆使用的顶级域名列表',
        category: 'proxy',
        url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/tld-not-cn.txt',
        rules: ['DOMAIN-SUFFIX,edu', 'DOMAIN-SUFFIX,gov'],
        enabled: false
    },
    {
        id: 'loyalsoldier-telegramcidr',
        name: 'Telegram CIDR',
        description: 'Telegram 使用的 IP 地址列表',
        category: 'proxy',
        url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/telegramcidr.txt',
        rules: ['IP-CIDR,91.108.4.0/22', 'IP-CIDR,91.108.8.0/22'],
        enabled: false
    },
    {
        id: 'loyalsoldier-cncidr',
        name: 'CN CIDR',
        description: '中国大陆 IP 地址列表',
        category: 'direct',
        url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/cncidr.txt',
        rules: ['IP-CIDR,1.0.1.0/24', 'IP-CIDR,1.0.2.0/23'],
        enabled: true
    },
    {
        id: 'loyalsoldier-lancidr',
        name: 'LAN CIDR',
        description: '局域网 IP 及保留 IP 地址列表',
        category: 'direct',
        url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/lancidr.txt',
        rules: ['IP-CIDR,127.0.0.0/8', 'IP-CIDR,169.254.0.0/16'],
        enabled: true
    }
];

const Rules: React.FC = () => {
    // 基础状态
    const [error, setError] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [ruleMode, setRuleMode] = useState<RuleMode>('ruleset');
    const [proxyMode, setProxyMode] = useState<string>('');

    // 规则相关状态
    const [ruleSets, setRuleSets] = useState<RuleSet[]>(RULE_SETS);
    const [customRules, setCustomRules] = useState<string>('');
    const [rulesetCustomRules, setRulesetCustomRules] = useState<string>('');

    // Hooks - 使用安全的方式
    const appLang = useTranslate();
    const { isConnected, isLoading } = useStore();

    // 如果有错误，显示错误信息
    if (error) {
        return (
            <div className='rules-page'>
                <div
                    style={{
                        padding: '20px',
                        background: '#fee',
                        border: '1px solid #fcc',
                        borderRadius: '8px',
                        margin: '20px'
                    }}
                >
                    <h2 style={{ color: '#c33' }}>规则页面错误</h2>
                    <p>错误信息: {error}</p>
                    <p>请检查浏览器控制台获取更多详细信息</p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '10px 20px',
                            background: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        重新加载页面
                    </button>
                </div>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className='rules-page'>
                <div className='loading-state'>
                    <div className='spinner'></div>
                    <p>Loading routing rules...</p>
                </div>
            </div>
        );
    }

    // Load settings on component mount - 使用安全的异步处理
    useEffect(() => {
        let isMounted = true; // 防止组件卸载后状态更新

        const loadSettings = async () => {
            try {
                console.log('开始加载规则设置...');

                if (!isMounted) return;

                // 1. 加载代理模式
                console.log('1. 加载代理模式...');
                const proxyModeValue = await settings.get('proxyMode');
                if (!isMounted) return;
                setProxyMode(
                    typeof proxyModeValue === 'undefined'
                        ? defaultSettings.proxyMode
                        : (proxyModeValue as string)
                );
                console.log('代理模式加载完成:', proxyModeValue);

                // 2. 加载当前规则模式
                console.log('2. 加载当前规则模式...');
                const currentMode = await RulesConfigManager.getCurrentMode();
                if (!isMounted) return;
                setRuleMode(currentMode);
                console.log('当前规则模式:', currentMode);

                // 3. 加载规则集配置
                console.log('3. 加载规则集配置...');
                const ruleSetConfig = await RulesConfigManager.getRuleSetConfig();
                if (!isMounted) return;
                console.log('规则集配置:', ruleSetConfig);

                setRuleSets((prev) =>
                    prev.map((rs) => ({
                        ...rs,
                        enabled:
                            ruleSetConfig[rs.id] !== undefined ? ruleSetConfig[rs.id] : rs.enabled
                    }))
                );

                // 4. 根据当前模式加载对应的自定义规则
                console.log('4. 加载自定义规则...');
                if (currentMode === 'blacklist') {
                    const blacklistRules = await RulesConfigManager.getBlacklistRules();
                    if (!isMounted) return;
                    setCustomRules(blacklistRules);
                    console.log('黑名单规则加载完成');
                } else if (currentMode === 'whitelist') {
                    const whitelistRules = await RulesConfigManager.getWhitelistRules();
                    if (!isMounted) return;
                    setCustomRules(whitelistRules);
                    console.log('白名单规则加载完成');
                } else if (currentMode === 'ruleset') {
                    try {
                        const rulesetCustom = await RulesConfigManager.getRulesetCustomRules();
                        if (!isMounted) return;
                        setRulesetCustomRules(rulesetCustom || '');
                        console.log('规则集自定义规则加载完成');
                    } catch (error) {
                        console.error('Failed to load ruleset custom rules:', error);
                        if (!isMounted) return;
                        setRulesetCustomRules('');
                    }
                }

                console.log('5. 所有设置加载完成');
                if (!isMounted) return;
                setIsLoaded(true);
            } catch (error) {
                console.error('Failed to load settings:', error);
                if (!isMounted) return;
                setError(error instanceof Error ? error.message : 'Failed to load settings');
                setIsLoaded(true);
            }
        };

        loadSettings();

        // 清理函数
        return () => {
            isMounted = false;
        };
    }, []);

    // 处理规则集切换 - 立即保存
    const handleRuleSetToggle = useCallback(
        async (ruleSetId: string) => {
            const newRuleSets = ruleSets.map((rs) =>
                rs.id === ruleSetId ? { ...rs, enabled: !rs.enabled } : rs
            );
            setRuleSets(newRuleSets);

            // 立即保存到配置文件
            const ruleSetConfig = newRuleSets.reduce(
                (acc, rs) => {
                    acc[rs.id] = rs.enabled;
                    return acc;
                },
                {} as { [key: string]: boolean }
            );

            await RulesConfigManager.saveRuleSetConfig(ruleSetConfig);
            await saveCurrentRulesToSettings(
                ruleMode,
                newRuleSets,
                customRules,
                rulesetCustomRules
            );

            // 如果当前已连接，提示用户重新连接以应用新规则
            if (isConnected) {
                settingsHaveChangedToast({ isConnected, isLoading, appLang });
            }
        },
        [ruleSets, ruleMode, customRules, rulesetCustomRules, isConnected, isLoading, appLang]
    );

    // 处理模式切换 - 立即保存并加载对应配置
    const handleModeChange = useCallback(
        async (mode: RuleMode) => {
            // 保存当前模式的配置
            if (ruleMode === 'blacklist') {
                await RulesConfigManager.saveBlacklistRules(customRules);
            } else if (ruleMode === 'whitelist') {
                await RulesConfigManager.saveWhitelistRules(customRules);
            }

            // 切换模式
            setRuleMode(mode);
            await RulesConfigManager.setCurrentMode(mode);

            // 加载新模式的配置
            if (mode === 'blacklist') {
                const blacklistRules = await RulesConfigManager.getBlacklistRules();
                setCustomRules(blacklistRules);
            } else if (mode === 'whitelist') {
                const whitelistRules = await RulesConfigManager.getWhitelistRules();
                setCustomRules(whitelistRules);
            } else {
                setCustomRules('');
            }

            await saveCurrentRulesToSettings(
                mode,
                ruleSets,
                mode === 'blacklist'
                    ? await RulesConfigManager.getBlacklistRules()
                    : mode === 'whitelist'
                      ? await RulesConfigManager.getWhitelistRules()
                      : '',
                mode === 'ruleset' ? rulesetCustomRules : undefined
            );

            // 如果当前已连接，提示用户重新连接以应用新规则
            if (isConnected) {
                settingsHaveChangedToast({ isConnected, isLoading, appLang });
            }
        },
        [ruleMode, customRules, ruleSets, rulesetCustomRules, isConnected, isLoading, appLang]
    );

    // 处理自定义规则更改 - 使用防抖延迟保存
    const handleCustomRulesChange = useCallback((rules: string) => {
        setCustomRules(rules);
    }, []);

    // 处理输入框失焦 - 立即保存
    const handleCustomRulesBlur = useCallback(async () => {
        if (ruleMode === 'blacklist') {
            await RulesConfigManager.saveBlacklistRules(customRules);
        } else if (ruleMode === 'whitelist') {
            await RulesConfigManager.saveWhitelistRules(customRules);
        }
        await saveCurrentRulesToSettings(ruleMode, ruleSets, customRules, rulesetCustomRules);

        // 如果当前已连接，提示用户重新连接以应用新规则
        if (isConnected) {
            settingsHaveChangedToast({ isConnected, isLoading, appLang });
        }
    }, [ruleMode, customRules, ruleSets, rulesetCustomRules, isConnected, isLoading, appLang]);

    // 处理规则集自定义规则更改
    const handleRulesetCustomRulesChange = useCallback((rules: string) => {
        setRulesetCustomRules(rules);
    }, []);

    // 处理规则集自定义规则失焦 - 立即保存
    const handleRulesetCustomRulesBlur = useCallback(async () => {
        await RulesConfigManager.saveRulesetCustomRules(rulesetCustomRules);
        await saveCurrentRulesToSettings(ruleMode, ruleSets, customRules, rulesetCustomRules);

        // 如果当前已连接，提示用户重新连接以应用新规则
        if (isConnected) {
            settingsHaveChangedToast({ isConnected, isLoading, appLang });
        }
    }, [ruleMode, ruleSets, customRules, rulesetCustomRules, isConnected, isLoading, appLang]);

    // 保存当前规则到系统设置
    const saveCurrentRulesToSettings = useCallback(
        async (
            mode: RuleMode,
            currentRuleSets: RuleSet[],
            currentCustomRules: string,
            rulesetCustom?: string
        ) => {
            try {
                const finalRules = generateFinalRulesForMode(
                    mode,
                    currentRuleSets,
                    currentCustomRules,
                    rulesetCustom
                );
                await settings.set('routingRules', finalRules);
            } catch (error) {
                console.error('Failed to save rules to settings:', error);
            }
        },
        [generateFinalRulesForMode]
    );

    // 为指定模式生成最终规则
    const generateFinalRulesForMode = useCallback(
        (
            mode: RuleMode,
            currentRuleSets: RuleSet[],
            currentCustomRules: string,
            rulesetCustom?: string
        ): string => {
            switch (mode) {
                case 'ruleset':
                    const enabledRuleSets = currentRuleSets.filter((rs) => rs.enabled);
                    const allRules: string[] = [];

                    // 按优先级排序：block > direct > proxy
                    const sortedRuleSets = enabledRuleSets.sort((a, b) => {
                        const priority = { block: 0, direct: 1, proxy: 2 };
                        return (
                            priority[a.category as keyof typeof priority] -
                            priority[b.category as keyof typeof priority]
                        );
                    });

                    sortedRuleSets.forEach((ruleSet) => {
                        ruleSet.rules.forEach((rule) => {
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

                    // 添加用户自定义规则（如果有的话）
                    if (rulesetCustom && rulesetCustom.trim()) {
                        const customRuleLines = rulesetCustom
                            .trim()
                            .split('\n')
                            .filter((line) => line.trim());
                        allRules.push(...customRuleLines);
                    }

                    // 使用换行符连接规则，这是解析器期望的格式
                    return allRules.join('\n');

                case 'blacklist':
                case 'whitelist':
                    return currentCustomRules;

                default:
                    return '';
            }
        },
        []
    );

    // 生成最终的路由规则（用于预览）
    const generateFinalRules = useCallback((): string => {
        return generateFinalRulesForMode(ruleMode, ruleSets, customRules, rulesetCustomRules);
    }, [ruleMode, ruleSets, customRules, rulesetCustomRules, generateFinalRulesForMode]);

    if (!isLoaded) {
        return (
            <div className='rules-page'>
                <div className='loading-state'>
                    <div className='spinner'></div>
                    <p>Loading routing rules...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='rules-page'>
            <div className='rules-header'>
                <div className='rules-title'>
                    <h2>{appLang?.rules?.title}</h2>
                    <p className='rules-subtitle'>{appLang?.rules?.subtitle} - 配置会自动保存</p>
                </div>
            </div>

            {proxyMode !== 'none' && (
                <div
                    className={classNames('alert', {
                        'alert-info': proxyMode === 'tun',
                        'alert-warning': proxyMode === 'system'
                    })}
                >
                    <i className='material-icons'>info</i>
                    <div>
                        <strong>
                            Current Mode: {proxyMode === 'tun' ? 'TUN' : 'System Proxy'}
                        </strong>
                        <p>
                            {proxyMode === 'tun'
                                ? 'Rules will be applied at the network interface level using Sing-Box routing.'
                                : 'Rules will be applied through system proxy settings with PAC script.'}
                        </p>
                    </div>
                </div>
            )}

            {/* 模式选择 */}
            <div className='mode-selector'>
                <div className='mode-tabs'>
                    <button
                        className={classNames('mode-tab', { active: ruleMode === 'ruleset' })}
                        onClick={() => handleModeChange('ruleset')}
                    >
                        <i className='material-icons'>rule</i>
                        <span>{appLang?.rules?.mode_ruleset}</span>
                        <small>{appLang?.rules?.mode_ruleset_desc}</small>
                    </button>
                    <button
                        className={classNames('mode-tab', { active: ruleMode === 'blacklist' })}
                        onClick={() => handleModeChange('blacklist')}
                    >
                        <i className='material-icons'>block</i>
                        <span>{appLang?.rules?.mode_blacklist}</span>
                        <small>{appLang?.rules?.mode_blacklist_desc}</small>
                    </button>
                    <button
                        className={classNames('mode-tab', { active: ruleMode === 'whitelist' })}
                        onClick={() => handleModeChange('whitelist')}
                    >
                        <i className='material-icons'>check_circle</i>
                        <span>{appLang?.rules?.mode_whitelist}</span>
                        <small>{appLang?.rules?.mode_whitelist_desc}</small>
                    </button>
                </div>
            </div>

            {/* 规则集模式 */}
            {ruleMode === 'ruleset' && (
                <div className='ruleset-mode'>
                    <div className='ruleset-header'>
                        <h3>{appLang?.rules?.select_rule_sets}</h3>
                        <p>{appLang?.rules?.select_rule_sets_desc}</p>
                    </div>

                    <div className='ruleset-categories'>
                        {/* 直连规则集 */}
                        <div className='category-section'>
                            <h4 className='category-title'>
                                <i className='material-icons'>home</i>
                                {appLang?.rules?.direct_connection}
                            </h4>
                            <div className='ruleset-grid'>
                                {ruleSets
                                    .filter((rs) => rs.category === 'direct')
                                    .map((ruleSet) => (
                                        <div
                                            key={ruleSet.id}
                                            className={classNames('ruleset-card', {
                                                enabled: ruleSet.enabled
                                            })}
                                        >
                                            <div className='ruleset-header'>
                                                <div className='ruleset-info'>
                                                    <h5>{ruleSet.name}</h5>
                                                    <p>{ruleSet.description}</p>
                                                </div>
                                                <label className='switch'>
                                                    <input
                                                        type='checkbox'
                                                        checked={ruleSet.enabled}
                                                        onChange={() =>
                                                            handleRuleSetToggle(ruleSet.id)
                                                        }
                                                    />
                                                    <span className='slider'></span>
                                                </label>
                                            </div>
                                            <div className='ruleset-preview'>
                                                <small>
                                                    Examples: {ruleSet.rules.slice(0, 2).join(', ')}
                                                </small>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* 代理规则集 */}
                        <div className='category-section'>
                            <h4 className='category-title'>
                                <i className='material-icons'>vpn_lock</i>
                                {appLang?.rules?.proxy_connection}
                            </h4>
                            <div className='ruleset-grid'>
                                {ruleSets
                                    .filter((rs) => rs.category === 'proxy')
                                    .map((ruleSet) => (
                                        <div
                                            key={ruleSet.id}
                                            className={classNames('ruleset-card', {
                                                enabled: ruleSet.enabled
                                            })}
                                        >
                                            <div className='ruleset-header'>
                                                <div className='ruleset-info'>
                                                    <h5>{ruleSet.name}</h5>
                                                    <p>{ruleSet.description}</p>
                                                </div>
                                                <label className='switch'>
                                                    <input
                                                        type='checkbox'
                                                        checked={ruleSet.enabled}
                                                        onChange={() =>
                                                            handleRuleSetToggle(ruleSet.id)
                                                        }
                                                    />
                                                    <span className='slider'></span>
                                                </label>
                                            </div>
                                            <div className='ruleset-preview'>
                                                <small>
                                                    Examples: {ruleSet.rules.slice(0, 2).join(', ')}
                                                </small>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* 阻止规则集 */}
                        <div className='category-section'>
                            <h4 className='category-title'>
                                <i className='material-icons'>block</i>
                                {appLang?.rules?.block_reject}
                            </h4>
                            <div className='ruleset-grid'>
                                {ruleSets
                                    .filter((rs) => rs.category === 'block')
                                    .map((ruleSet) => (
                                        <div
                                            key={ruleSet.id}
                                            className={classNames('ruleset-card', {
                                                enabled: ruleSet.enabled
                                            })}
                                        >
                                            <div className='ruleset-header'>
                                                <div className='ruleset-info'>
                                                    <h5>{ruleSet.name}</h5>
                                                    <p>{ruleSet.description}</p>
                                                </div>
                                                <label className='switch'>
                                                    <input
                                                        type='checkbox'
                                                        checked={ruleSet.enabled}
                                                        onChange={() =>
                                                            handleRuleSetToggle(ruleSet.id)
                                                        }
                                                    />
                                                    <span className='slider'></span>
                                                </label>
                                            </div>
                                            <div className='ruleset-preview'>
                                                <small>
                                                    Examples: {ruleSet.rules.slice(0, 2).join(', ')}
                                                </small>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 黑名单模式 */}
            {ruleMode === 'blacklist' && (
                <div className='custom-rules-mode'>
                    <div className='mode-description'>
                        <h3>{appLang?.rules?.mode_blacklist}</h3>
                        <p>{appLang?.rules?.mode_blacklist_desc}</p>
                    </div>

                    <div className='rules-editor'>
                        <textarea
                            value={customRules}
                            onChange={(e) => handleCustomRulesChange(e.target.value)}
                            onBlur={handleCustomRulesBlur}
                            placeholder='Enter rules, one per line:
domain:google.com
domain:*.youtube.com
ip:8.8.8.8
ip:192.168.1.0/24
app:chrome.exe'
                            rows={15}
                            className='rules-textarea'
                        />
                    </div>

                    <div className='rules-help'>
                        <h4>Blacklist Rules Syntax:</h4>
                        <ul>
                            <li>
                                <code>domain:example.com</code> - Proxy specific domain
                            </li>
                            <li>
                                <code>domain:*.example.com</code> - Proxy all subdomains
                            </li>
                            <li>
                                <code>ip:8.8.8.8</code> - Proxy specific IP
                            </li>
                            <li>
                                <code>ip:192.168.0.0/24</code> - Proxy IP range
                            </li>
                            <li>
                                <code>app:chrome.exe</code> - Proxy specific application
                            </li>
                        </ul>
                    </div>
                </div>
            )}

            {/* 白名单模式 */}
            {ruleMode === 'whitelist' && (
                <div className='custom-rules-mode'>
                    <div className='mode-description'>
                        <h3>{appLang?.rules?.mode_whitelist}</h3>
                        <p>{appLang?.rules?.mode_whitelist_desc}</p>
                    </div>

                    <div className='rules-editor'>
                        <textarea
                            value={customRules}
                            onChange={(e) => handleCustomRulesChange(e.target.value)}
                            onBlur={handleCustomRulesBlur}
                            placeholder='Enter rules, one per line:
domain:baidu.com
domain:*.cn
ip:114.114.114.114
ip:192.168.0.0/16
app:wechat.exe'
                            rows={15}
                            className='rules-textarea'
                        />
                    </div>

                    <div className='rules-help'>
                        <h4>Whitelist Rules Syntax:</h4>
                        <ul>
                            <li>
                                <code>domain:example.com</code> - Direct connect to domain
                            </li>
                            <li>
                                <code>domain:*.cn</code> - Direct connect to all .cn domains
                            </li>
                            <li>
                                <code>ip:114.114.114.114</code> - Direct connect to IP
                            </li>
                            <li>
                                <code>ip:10.0.0.0/8</code> - Direct connect to IP range
                            </li>
                            <li>
                                <code>app:wechat.exe</code> - Direct connect for application
                            </li>
                        </ul>
                    </div>
                </div>
            )}

            {/* 规则预览 */}
            <div className='rules-preview'>
                <h4>{appLang?.rules?.generated_rules_preview}</h4>
                {ruleMode === 'ruleset' ? (
                    <div className='editable-preview'>
                        <div className='preview-description'>
                            <p>Generated rules from rule sets + your custom rules:</p>
                        </div>

                        {/* 自定义规则编辑区 */}
                        <div className='custom-rules-section'>
                            <h5>Add Your Custom Rules:</h5>
                            <textarea
                                value={rulesetCustomRules}
                                onChange={(e) => handleRulesetCustomRulesChange(e.target.value)}
                                onBlur={handleRulesetCustomRulesBlur}
                                placeholder={`Add custom rules, one per line:
app:WeChat.exe
app:firefox.exe
domain:example.com
ip:192.168.1.0/24`}
                                rows={6}
                                className='custom-rules-textarea'
                            />
                            <div className='custom-rules-help'>
                                <small>
                                    <strong>Syntax:</strong>
                                    <code>app:AppName.exe</code>,<code>domain:example.com</code>,
                                    <code>ip:192.168.1.0/24</code>
                                </small>
                            </div>
                        </div>

                        {/* 最终规则预览 */}
                        <div className='final-rules-section'>
                            <h5>Final Combined Rules:</h5>
                            <pre className='final-rules'>
                                {generateFinalRules() || appLang?.rules?.no_rules_generated}
                            </pre>
                        </div>
                    </div>
                ) : (
                    <div className='preview-content'>
                        <pre>{generateFinalRules() || appLang?.rules?.no_rules_generated}</pre>
                    </div>
                )}
            </div>

            <Tabs active='rules' proxyMode={proxyMode} />

            <Toaster
                position='bottom-center'
                reverseOrder={false}
                containerStyle={{ bottom: '70px' }}
            />
        </div>
    );
};

export default Rules;
