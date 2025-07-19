import React, { useState, useEffect, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import classNames from 'classnames';
import { settings } from '../../lib/settings';
import useTranslate from '../../../localization/useTranslate';
import { useStore } from '../../store';
import { settingsHaveChangedToast } from '../../lib/toasts';
import { defaultSettings } from '../../../defaultSettings';
import Tabs from '../../components/Tabs';
import './Rules.css';

// 规则模式类型
type RuleMode = 'ruleset' | 'blacklist' | 'whitelist';

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
        enabled: false
    },
    {
        id: 'loyalsoldier-icloud',
        name: 'iCloud',
        description: 'iCloud 域名列表',
        category: 'direct',
        url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/icloud.txt',
        rules: ['DOMAIN-SUFFIX,icloud.com', 'DOMAIN-SUFFIX,apple-cloudkit.com'],
        enabled: false
    },
    {
        id: 'loyalsoldier-apple',
        name: 'Apple',
        description: 'Apple 在中国大陆可直连的域名列表',
        category: 'direct',
        url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/apple.txt',
        rules: ['DOMAIN-SUFFIX,apple.com', 'DOMAIN-SUFFIX,apple.com.cn'],
        enabled: false
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
        enabled: false
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
        enabled: false
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
        enabled: false
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
    const appLang = useTranslate();
    const { isConnected, isLoading } = useStore();
    const [ruleMode, setRuleMode] = useState<RuleMode>('ruleset');
    const [proxyMode, setProxyMode] = useState<string>('');
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    
    // 规则集状态
    const [ruleSets, setRuleSets] = useState<RuleSet[]>(RULE_SETS);
    
    // 黑名单/白名单状态
    const [customRules, setCustomRules] = useState<string>('');

    // Load settings on component mount
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const [routingRulesValue, proxyModeValue, ruleModeValue, ruleSetValue] = await Promise.all([
                    settings.get('routingRules'),
                    settings.get('proxyMode'),
                    settings.get('ruleMode'),
                    settings.get('selectedRuleSets')
                ]);

                // 加载规则模式
                const savedRuleMode = typeof ruleModeValue === 'undefined' ? 'ruleset' : ruleModeValue as RuleMode;
                setRuleMode(savedRuleMode);
                
                // 加载代理模式
                setProxyMode(typeof proxyModeValue === 'undefined' 
                    ? defaultSettings.proxyMode 
                    : proxyModeValue as string);

                // 加载规则集选择状态
                if (ruleSetValue) {
                    const selectedIds = JSON.parse(ruleSetValue as string);
                    setRuleSets(prev => prev.map(rs => ({
                        ...rs,
                        enabled: selectedIds.includes(rs.id)
                    })));
                }

                // 加载自定义规则
                const routingRules = typeof routingRulesValue === 'undefined' 
                    ? defaultSettings.routingRules 
                    : routingRulesValue as string;
                setCustomRules(routingRules);
                
                setIsLoaded(true);
            } catch (error) {
                console.error('Failed to load settings:', error);
                setIsLoaded(true);
            }
        };

        loadSettings();
    }, []);

    // 处理规则集切换
    const handleRuleSetToggle = useCallback((ruleSetId: string) => {
        setRuleSets(prev => prev.map(rs => 
            rs.id === ruleSetId ? { ...rs, enabled: !rs.enabled } : rs
        ));
        setHasChanges(true);
    }, []);

    // 处理模式切换
    const handleModeChange = useCallback((mode: RuleMode) => {
        setRuleMode(mode);
        setHasChanges(true);
    }, []);

    // 处理自定义规则更改
    const handleCustomRulesChange = useCallback((rules: string) => {
        setCustomRules(rules);
        setHasChanges(true);
    }, []);

    // 生成最终的路由规则
    const generateFinalRules = useCallback((): string => {
        switch (ruleMode) {
            case 'ruleset':
                const enabledRuleSets = ruleSets.filter(rs => rs.enabled);
                const allRules: string[] = [];
                
                // 按优先级排序：block > direct > proxy
                const sortedRuleSets = enabledRuleSets.sort((a, b) => {
                    const priority = { block: 0, direct: 1, proxy: 2 };
                    return priority[a.category as keyof typeof priority] - priority[b.category as keyof typeof priority];
                });
                
                sortedRuleSets.forEach(ruleSet => {
                    ruleSet.rules.forEach(rule => {
                        if (ruleSet.category === 'block') {
                            allRules.push(`domain:!${rule.replace(/^DOMAIN-SUFFIX,/, '')}`);
                        } else if (ruleSet.category === 'direct') {
                            if (rule.startsWith('DOMAIN-SUFFIX,')) {
                                allRules.push(`domain:${rule.replace('DOMAIN-SUFFIX,', '')}`);
                            } else if (rule.startsWith('IP-CIDR,')) {
                                allRules.push(`range:${rule.replace('IP-CIDR,', '')}`);
                            }
                        }
                        // proxy 类型的规则不需要添加到直连列表中
                    });
                });
                
                return allRules.join(',\n');
                
            case 'blacklist':
            case 'whitelist':
                return customRules;
                
            default:
                return '';
        }
    }, [ruleMode, ruleSets, customRules]);

    // 保存设置
    const handleSaveRules = useCallback(async () => {
        try {
            const finalRules = generateFinalRules();
            
            await Promise.all([
                settings.set('routingRules', finalRules),
                settings.set('ruleMode', ruleMode),
                settings.set('selectedRuleSets', JSON.stringify(ruleSets.filter(rs => rs.enabled).map(rs => rs.id)))
            ]);
            
            setHasChanges(false);
            settingsHaveChangedToast({ isConnected, isLoading, appLang });
        } catch (error) {
            console.error('Failed to save rules:', error);
        }
    }, [generateFinalRules, ruleMode, ruleSets, isConnected, isLoading, appLang]);

    // 重置更改
    const handleResetRules = useCallback(async () => {
        try {
            const [savedRuleMode, savedRuleSets, savedCustomRules] = await Promise.all([
                settings.get('ruleMode'),
                settings.get('selectedRuleSets'),
                settings.get('routingRules')
            ]);
            
            setRuleMode((savedRuleMode as RuleMode) || 'ruleset');
            setCustomRules((savedCustomRules as string) || '');
            
            if (savedRuleSets) {
                const selectedIds = JSON.parse(savedRuleSets as string);
                setRuleSets(prev => prev.map(rs => ({
                    ...rs,
                    enabled: selectedIds.includes(rs.id)
                })));
            }
            
            setHasChanges(false);
        } catch (error) {
            console.error('Failed to reset rules:', error);
        }
    }, []);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 's') {
                    e.preventDefault();
                    if (hasChanges) {
                        handleSaveRules();
                    }
                } else if (e.key === 'z' && !e.shiftKey) {
                    e.preventDefault();
                    if (hasChanges) {
                        handleResetRules();
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [hasChanges, handleSaveRules, handleResetRules]);

    if (!isLoaded) {
        return (
            <div className="rules-page">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading routing rules...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rules-page">
            <div className="rules-header">
                <div className="rules-title">
                    <h2>{appLang?.rules?.title}</h2>
                    <p className="rules-subtitle">
                        {appLang?.rules?.subtitle}
                    </p>
                </div>
                
                {hasChanges && (
                    <div className="rules-actions">
                        <button 
                            className="btn btn-secondary"
                            onClick={handleResetRules}
                            title="Reset changes (Ctrl+Z)"
                        >
                            <i className="material-icons">undo</i>
                            {appLang?.rules?.reset}
                        </button>
                        <button 
                            className="btn btn-primary"
                            onClick={handleSaveRules}
                            title="Save changes (Ctrl+S)"
                        >
                            <i className="material-icons">save</i>
                            {appLang?.rules?.save_changes}
                        </button>
                    </div>
                )}
            </div>

            {proxyMode !== 'none' && (
                <div className={classNames('alert', {
                    'alert-info': proxyMode === 'tun',
                    'alert-warning': proxyMode === 'system'
                })}>
                    <i className="material-icons">info</i>
                    <div>
                        <strong>Current Mode: {proxyMode === 'tun' ? 'TUN' : 'System Proxy'}</strong>
                        <p>
                            {proxyMode === 'tun' 
                                ? 'Rules will be applied at the network interface level using Sing-Box routing.'
                                : 'Rules will be applied through system proxy settings with PAC script.'
                            }
                        </p>
                    </div>
                </div>
            )}

            {/* 模式选择 */}
            <div className="mode-selector">
                <div className="mode-tabs">
                    <button 
                        className={classNames('mode-tab', { active: ruleMode === 'ruleset' })}
                        onClick={() => handleModeChange('ruleset')}
                    >
                        <i className="material-icons">rule</i>
                        <span>{appLang?.rules?.mode_ruleset}</span>
                        <small>{appLang?.rules?.mode_ruleset_desc}</small>
                    </button>
                    <button 
                        className={classNames('mode-tab', { active: ruleMode === 'blacklist' })}
                        onClick={() => handleModeChange('blacklist')}
                    >
                        <i className="material-icons">block</i>
                        <span>{appLang?.rules?.mode_blacklist}</span>
                        <small>{appLang?.rules?.mode_blacklist_desc}</small>
                    </button>
                    <button 
                        className={classNames('mode-tab', { active: ruleMode === 'whitelist' })}
                        onClick={() => handleModeChange('whitelist')}
                    >
                        <i className="material-icons">check_circle</i>
                        <span>{appLang?.rules?.mode_whitelist}</span>
                        <small>{appLang?.rules?.mode_whitelist_desc}</small>
                    </button>
                </div>
            </div>

            {/* 规则集模式 */}
            {ruleMode === 'ruleset' && (
                <div className="ruleset-mode">
                    <div className="ruleset-header">
                        <h3>{appLang?.rules?.select_rule_sets}</h3>
                        <p>{appLang?.rules?.select_rule_sets_desc}</p>
                    </div>
                    
                    <div className="ruleset-categories">
                        {/* 直连规则集 */}
                        <div className="category-section">
                            <h4 className="category-title">
                                <i className="material-icons">home</i>
                                {appLang?.rules?.direct_connection}
                            </h4>
                            <div className="ruleset-grid">
                                {ruleSets.filter(rs => rs.category === 'direct').map(ruleSet => (
                                    <div key={ruleSet.id} className={classNames('ruleset-card', { enabled: ruleSet.enabled })}>
                                        <div className="ruleset-header">
                                            <div className="ruleset-info">
                                                <h5>{ruleSet.name}</h5>
                                                <p>{ruleSet.description}</p>
                                            </div>
                                            <label className="switch">
                                                <input 
                                                    type="checkbox" 
                                                    checked={ruleSet.enabled}
                                                    onChange={() => handleRuleSetToggle(ruleSet.id)}
                                                />
                                                <span className="slider"></span>
                                            </label>
                                        </div>
                                        <div className="ruleset-preview">
                                            <small>Examples: {ruleSet.rules.slice(0, 2).join(', ')}</small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 代理规则集 */}
                        <div className="category-section">
                            <h4 className="category-title">
                                <i className="material-icons">vpn_lock</i>
                                {appLang?.rules?.proxy_connection}
                            </h4>
                            <div className="ruleset-grid">
                                {ruleSets.filter(rs => rs.category === 'proxy').map(ruleSet => (
                                    <div key={ruleSet.id} className={classNames('ruleset-card', { enabled: ruleSet.enabled })}>
                                        <div className="ruleset-header">
                                            <div className="ruleset-info">
                                                <h5>{ruleSet.name}</h5>
                                                <p>{ruleSet.description}</p>
                                            </div>
                                            <label className="switch">
                                                <input 
                                                    type="checkbox" 
                                                    checked={ruleSet.enabled}
                                                    onChange={() => handleRuleSetToggle(ruleSet.id)}
                                                />
                                                <span className="slider"></span>
                                            </label>
                                        </div>
                                        <div className="ruleset-preview">
                                            <small>Examples: {ruleSet.rules.slice(0, 2).join(', ')}</small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 阻止规则集 */}
                        <div className="category-section">
                            <h4 className="category-title">
                                <i className="material-icons">block</i>
                                {appLang?.rules?.block_reject}
                            </h4>
                            <div className="ruleset-grid">
                                {ruleSets.filter(rs => rs.category === 'block').map(ruleSet => (
                                    <div key={ruleSet.id} className={classNames('ruleset-card', { enabled: ruleSet.enabled })}>
                                        <div className="ruleset-header">
                                            <div className="ruleset-info">
                                                <h5>{ruleSet.name}</h5>
                                                <p>{ruleSet.description}</p>
                                            </div>
                                            <label className="switch">
                                                <input 
                                                    type="checkbox" 
                                                    checked={ruleSet.enabled}
                                                    onChange={() => handleRuleSetToggle(ruleSet.id)}
                                                />
                                                <span className="slider"></span>
                                            </label>
                                        </div>
                                        <div className="ruleset-preview">
                                            <small>Examples: {ruleSet.rules.slice(0, 2).join(', ')}</small>
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
                <div className="custom-rules-mode">
                    <div className="mode-description">
                        <h3>{appLang?.rules?.mode_blacklist}</h3>
                        <p>{appLang?.rules?.mode_blacklist_desc}</p>
                    </div>
                    
                    <div className="rules-editor">
                        <textarea
                            value={customRules}
                            onChange={(e) => handleCustomRulesChange(e.target.value)}
                            placeholder="Enter rules, one per line:
domain:google.com
domain:*.youtube.com
ip:8.8.8.8
range:192.168.1.0/24
app:chrome.exe"
                            rows={15}
                            className="rules-textarea"
                        />
                    </div>
                    
                    <div className="rules-help">
                        <h4>Blacklist Rules Syntax:</h4>
                        <ul>
                            <li><code>domain:example.com</code> - Proxy specific domain</li>
                            <li><code>domain:*.example.com</code> - Proxy all subdomains</li>
                            <li><code>ip:8.8.8.8</code> - Proxy specific IP</li>
                            <li><code>range:192.168.0.0/24</code> - Proxy IP range</li>
                            <li><code>app:chrome.exe</code> - Proxy specific application</li>
                        </ul>
                    </div>
                </div>
            )}

            {/* 白名单模式 */}
            {ruleMode === 'whitelist' && (
                <div className="custom-rules-mode">
                    <div className="mode-description">
                        <h3>{appLang?.rules?.mode_whitelist}</h3>
                        <p>{appLang?.rules?.mode_whitelist_desc}</p>
                    </div>
                    
                    <div className="rules-editor">
                        <textarea
                            value={customRules}
                            onChange={(e) => handleCustomRulesChange(e.target.value)}
                            placeholder="Enter rules, one per line:
domain:baidu.com
domain:*.cn
ip:114.114.114.114
range:192.168.0.0/16
app:wechat.exe"
                            rows={15}
                            className="rules-textarea"
                        />
                    </div>
                    
                    <div className="rules-help">
                        <h4>Whitelist Rules Syntax:</h4>
                        <ul>
                            <li><code>domain:example.com</code> - Direct connect to domain</li>
                            <li><code>domain:*.cn</code> - Direct connect to all .cn domains</li>
                            <li><code>ip:114.114.114.114</code> - Direct connect to IP</li>
                            <li><code>range:10.0.0.0/8</code> - Direct connect to IP range</li>
                            <li><code>app:wechat.exe</code> - Direct connect for application</li>
                        </ul>
                    </div>
                </div>
            )}

            {/* 规则预览 */}
            <div className="rules-preview">
                <h4>{appLang?.rules?.generated_rules_preview}</h4>
                <div className="preview-content">
                    <pre>{generateFinalRules() || appLang?.rules?.no_rules_generated}</pre>
                </div>
            </div>

            <Tabs active="rules" proxyMode={proxyMode} />
            
            <Toaster
                position="bottom-center"
                reverseOrder={false}
                containerStyle={{ bottom: '70px' }}
            />
        </div>
    );
};

export default Rules;