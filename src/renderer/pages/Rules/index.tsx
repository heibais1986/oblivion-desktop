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

    // Load settings on component mount - 使用安全的异步处理
    useEffect(() => {
        let isMounted = true;

        const loadSettings = async () => {
            try {
                console.log('开始加载规则设置...');

                // 简化加载逻辑，先设置为已加载状态，避免无限加载
                setIsLoaded(true);

                // 1. 加载代理模式
                try {
                    const proxyModeValue = await settings.get('proxyMode');
                    if (isMounted) {
                        setProxyMode(
                            typeof proxyModeValue === 'undefined'
                                ? defaultSettings.proxyMode
                                : (proxyModeValue as string)
                        );
                    }
                } catch (error) {
                    console.error('加载代理模式失败:', error);
                    if (isMounted) setProxyMode(defaultSettings.proxyMode);
                }

                // 2. 加载当前规则模式
                try {
                    const currentMode = await RulesConfigManager.getCurrentMode();
                    if (isMounted) {
                        setRuleMode(currentMode);
                    }
                } catch (error) {
                    console.error('加载规则模式失败:', error);
                    if (isMounted) setRuleMode('ruleset');
                }

                // 3. 加载规则集配置
                try {
                    const ruleSetConfig = await RulesConfigManager.getRuleSetConfig();
                    if (isMounted) {
                        setRuleSets((prev) =>
                            prev.map((rs) => ({
                                ...rs,
                                enabled:
                                    ruleSetConfig[rs.id] !== undefined ? ruleSetConfig[rs.id] : rs.enabled
                            }))
                        );
                    }
                } catch (error) {
                    console.error('加载规则集配置失败:', error);
                }

                console.log('规则设置加载完成');
            } catch (error) {
                console.error('Failed to load settings:', error);
                if (isMounted) {
                    setError(error instanceof Error ? error.message : 'Failed to load settings');
                    setIsLoaded(true);
                }
            }
        };

        // 添加延迟以确保 IPC 通道已准备好
        const timer = setTimeout(() => {
            loadSettings();
        }, 100);

        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, []);

    // 处理规则集切换
    const handleRuleSetToggle = useCallback(
        async (ruleSetId: string) => {
            try {
                const newRuleSets = ruleSets.map((rs) =>
                    rs.id === ruleSetId ? { ...rs, enabled: !rs.enabled } : rs
                );
                setRuleSets(newRuleSets);

                // 保存到配置文件
                const ruleSetConfig = newRuleSets.reduce(
                    (acc, rs) => {
                        acc[rs.id] = rs.enabled;
                        return acc;
                    },
                    {} as { [key: string]: boolean }
                );

                await RulesConfigManager.saveRuleSetConfig(ruleSetConfig);

                // 如果当前已连接，提示用户重新连接
                if (isConnected) {
                    settingsHaveChangedToast({ isConnected, isLoading, appLang });
                }
            } catch (error) {
                console.error('Failed to toggle rule set:', error);
            }
        },
        [ruleSets, isConnected, isLoading, appLang]
    );

    // 处理模式切换
    const handleModeChange = useCallback(
        async (mode: RuleMode) => {
            try {
                setRuleMode(mode);
                await RulesConfigManager.setCurrentMode(mode);

                // 如果当前已连接，提示用户重新连接
                if (isConnected) {
                    settingsHaveChangedToast({ isConnected, isLoading, appLang });
                }
            } catch (error) {
                console.error('Failed to change mode:', error);
            }
        },
        [isConnected, isLoading, appLang]
    );

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

    return (
        <div className='rules-page'>
            <div className='rules-header'>
                <div className='rules-title'>
                    <h2>{appLang?.rules?.title || 'Routing Rules'}</h2>
                    <p className='rules-subtitle'>{appLang?.rules?.subtitle || 'Configure routing rules'}</p>
                </div>
            </div>

            {proxyMode !== 'none' && (
                <div
                    className={classNames('alert', {
                        'alert-info': proxyMode === 'tun',
                        'alert-warning': proxyMode === 'system'
                    })}
                >
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
                        <span>{appLang?.rules?.mode_ruleset || 'Rule Sets'}</span>
                        <small>{appLang?.rules?.mode_ruleset_desc || 'Use predefined rule collections'}</small>
                    </button>
                    <button
                        className={classNames('mode-tab', { active: ruleMode === 'blacklist' })}
                        onClick={() => handleModeChange('blacklist')}
                    >
                        <span>{appLang?.rules?.mode_blacklist || 'Blacklist'}</span>
                        <small>{appLang?.rules?.mode_blacklist_desc || 'Specify what goes through proxy'}</small>
                    </button>
                    <button
                        className={classNames('mode-tab', { active: ruleMode === 'whitelist' })}
                        onClick={() => handleModeChange('whitelist')}
                    >
                        <span>{appLang?.rules?.mode_whitelist || 'Whitelist'}</span>
                        <small>{appLang?.rules?.mode_whitelist_desc || 'Specify what connects directly'}</small>
                    </button>
                </div>
            </div>

            {/* 规则集模式 */}
            {ruleMode === 'ruleset' && (
                <div className='ruleset-mode'>
                    <div className='ruleset-header'>
                        <h3>{appLang?.rules?.select_rule_sets || 'Select Rule Sets'}</h3>
                        <p>{appLang?.rules?.select_rule_sets_desc || 'Choose from predefined rule collections'}</p>
                    </div>

                    <div className='ruleset-categories'>
                        {/* 直连规则集 */}
                        <div className='category-section'>
                            <h4 className='category-title'>
                                {appLang?.rules?.direct_connection || 'Direct Connection'}
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
                                {appLang?.rules?.proxy_connection || 'Proxy Connection'}
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
                                {appLang?.rules?.block_reject || 'Block/Reject'}
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
                        <h3>{appLang?.rules?.mode_blacklist || 'Blacklist Mode'}</h3>
                        <p>{appLang?.rules?.mode_blacklist_desc || 'Specify what goes through proxy'}</p>
                    </div>

                    <div className='rules-editor'>
                        <textarea
                            value={customRules}
                            onChange={(e) => setCustomRules(e.target.value)}
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
                </div>
            )}

            {/* 白名单模式 */}
            {ruleMode === 'whitelist' && (
                <div className='custom-rules-mode'>
                    <div className='mode-description'>
                        <h3>{appLang?.rules?.mode_whitelist || 'Whitelist Mode'}</h3>
                        <p>{appLang?.rules?.mode_whitelist_desc || 'Specify what connects directly'}</p>
                    </div>

                    <div className='rules-editor'>
                        <textarea
                            value={customRules}
                            onChange={(e) => setCustomRules(e.target.value)}
                            placeholder='Enter rules, one per line:
domain:baidu.com
domain:*.qq.com
ip:114.114.114.114
ip:192.168.0.0/16'
                            rows={15}
                            className='rules-textarea'
                        />
                    </div>
                </div>
            )}

            <Toaster />
        </div>
    );
};

export default Rules;