import React, { useState, useEffect, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import classNames from 'classnames';
import { settings } from '../../lib/settings';
import useTranslate from '../../../localization/useTranslate';
import { useStore } from '../../store';
import { settingsHaveChangedToast } from '../../lib/toasts';
import { defaultSettings } from '../../../defaultSettings';
import RuleEditor, { Rule } from '../../components/RuleEditor';
import Tabs from '../../components/Tabs';
import './Rules.css';

const Rules: React.FC = () => {
    const appLang = useTranslate();
    const { isConnected, isLoading } = useStore();
    const [rules, setRules] = useState<Rule[]>([]);
    const [proxyMode, setProxyMode] = useState<string>('');
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Load settings on component mount
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const [routingRulesValue, proxyModeValue] = await Promise.all([
                    settings.get('routingRules'),
                    settings.get('proxyMode')
                ]);

                const routingRules = typeof routingRulesValue === 'undefined' 
                    ? defaultSettings.routingRules 
                    : routingRulesValue as string;

                const parsedRules = parseRoutingRules(routingRules);
                setRules(parsedRules);
                
                setProxyMode(typeof proxyModeValue === 'undefined' 
                    ? defaultSettings.proxyMode 
                    : proxyModeValue as string);
                
                setIsLoaded(true);
            } catch (error) {
                console.error('Failed to load settings:', error);
                setIsLoaded(true);
            }
        };

        loadSettings();
    }, []);

    // Parse routing rules string to Rule objects
    const parseRoutingRules = useCallback((rulesString: string): Rule[] => {
        if (!rulesString || rulesString.trim() === '') {
            return [];
        }

        const lines = rulesString.split(/[,\n]/).map(line => line.trim()).filter(Boolean);
        const parsedRules: Rule[] = [];

        lines.forEach((line, index) => {
            const match = line.match(/^(geoip|domain|ip|range|app):(.+)$/);
            if (match) {
                const [, type, value] = match;
                parsedRules.push({
                    id: `rule-${index}-${Date.now()}`,
                    type: type as Rule['type'],
                    value: value.trim(),
                    enabled: true,
                    description: getAutoDescription(type, value.trim())
                });
            } else {
                // Handle plain IP addresses
                const ipMatch = line.match(/^([0-9]{1,3}\.){3}[0-9]{1,3}$/);
                const ipRangeMatch = line.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2}$/);
                
                if (ipMatch) {
                    parsedRules.push({
                        id: `rule-${index}-${Date.now()}`,
                        type: 'ip',
                        value: line,
                        enabled: true,
                        description: 'IP address'
                    });
                } else if (ipRangeMatch) {
                    parsedRules.push({
                        id: `rule-${index}-${Date.now()}`,
                        type: 'range',
                        value: line,
                        enabled: true,
                        description: 'IP range (CIDR)'
                    });
                }
            }
        });

        return parsedRules;
    }, []);

    // Convert Rule objects back to routing rules string
    const serializeRules = useCallback((rules: Rule[]): string => {
        const enabledRules = rules.filter(rule => rule.enabled);
        const serializedRules = enabledRules.map(rule => `${rule.type}:${rule.value}`);
        
        // Sort rules with domain exclusions (!) first
        const priorityRules = serializedRules.filter(rule => rule.includes('domain:!'));
        const otherRules = serializedRules.filter(rule => !rule.includes('domain:!'));
        
        return [...priorityRules, ...otherRules].join(',\n');
    }, []);

    // Auto-generate description based on rule type and value
    const getAutoDescription = useCallback((type: string, value: string): string => {
        switch (type) {
            case 'domain':
                if (value.startsWith('!')) return `Exclude ${value.substring(1)}`;
                if (value.startsWith('*.')) return `All subdomains of ${value.substring(2)}`;
                return `Direct access to ${value}`;
            case 'ip':
                return `Direct IP: ${value}`;
            case 'app':
                return `Application: ${value}`;
            case 'geoip':
                return `Geographic region: ${value.toUpperCase()}`;
            case 'range':
                return `IP range: ${value}`;
            default:
                return '';
        }
    }, []);

    // Handle rules change
    const handleRulesChange = useCallback((newRules: Rule[]) => {
        setRules(newRules);
        setHasChanges(true);
    }, []);

    // Save rules to settings
    const handleSaveRules = useCallback(async () => {
        try {
            const serializedRules = serializeRules(rules);
            await settings.set('routingRules', serializedRules);
            setHasChanges(false);
            settingsHaveChangedToast({ isConnected, isLoading, appLang });
        } catch (error) {
            console.error('Failed to save rules:', error);
        }
    }, [rules, serializeRules, isConnected, isLoading, appLang]);

    // Reset rules to last saved state
    const handleResetRules = useCallback(async () => {
        try {
            const savedRules = await settings.get('routingRules') as string;
            const parsedRules = parseRoutingRules(savedRules || defaultSettings.routingRules);
            setRules(parsedRules);
            setHasChanges(false);
        } catch (error) {
            console.error('Failed to reset rules:', error);
        }
    }, [parseRoutingRules]);

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
                    <h2>Routing Rules</h2>
                    <p className="rules-subtitle">
                        Configure which traffic should bypass the VPN connection
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
                            Reset
                        </button>
                        <button 
                            className="btn btn-primary"
                            onClick={handleSaveRules}
                            title="Save changes (Ctrl+S)"
                        >
                            <i className="material-icons">save</i>
                            Save Changes
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

            <div className="rules-content">
                <RuleEditor 
                    rules={rules}
                    onChange={handleRulesChange}
                    className="main-rule-editor"
                />
            </div>

            <div className="rules-info">
                <div className="info-section">
                    <h4>Rule Types</h4>
                    <ul>
                        <li><strong>Domain:</strong> Match domain names (e.g., google.com, *.example.com)</li>
                        <li><strong>IP:</strong> Match specific IP addresses (e.g., 192.168.1.1)</li>
                        <li><strong>Range:</strong> Match IP ranges using CIDR notation (e.g., 192.168.0.0/24)</li>
                        <li><strong>App:</strong> Match specific applications by process name</li>
                        <li><strong>GeoIP:</strong> Match traffic by geographic location (e.g., ir, cn, us)</li>
                    </ul>
                </div>
                
                <div className="info-section">
                    <h4>Special Syntax</h4>
                    <ul>
                        <li><strong>!domain.com:</strong> Exclude domain (force through VPN)</li>
                        <li><strong>*.domain.com:</strong> Match all subdomains</li>
                        <li><strong>Wildcards:</strong> Use * for pattern matching</li>
                    </ul>
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