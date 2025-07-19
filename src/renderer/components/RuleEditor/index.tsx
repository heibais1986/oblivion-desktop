import React, { useState, useCallback, useEffect } from 'react';
import classNames from 'classnames';
import useTranslate from '../../../localization/useTranslate';
import { defaultRoutingRules } from '../../../defaultSettings';
import './RuleEditor.css';

export interface Rule {
    id: string;
    type: 'ip' | 'domain' | 'geoip' | 'app' | 'range';
    value: string;
    enabled: boolean;
    description?: string;
}

interface RuleEditorProps {
    rules: Rule[];
    onChange: (rules: Rule[]) => void;
    className?: string;
}

const RuleEditor: React.FC<RuleEditorProps> = ({ rules, onChange, className }) => {
    const appLang = useTranslate();
    const [editingRule, setEditingRule] = useState<Rule | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newRule, setNewRule] = useState<Omit<Rule, 'id'>>({
        type: 'domain',
        value: '',
        enabled: true,
        description: ''
    });

    const generateId = () => Math.random().toString(36).substr(2, 9);

    const handleAddRule = useCallback(() => {
        if (!newRule.value.trim()) return;
        
        const rule: Rule = {
            ...newRule,
            id: generateId(),
            value: newRule.value.trim()
        };
        
        onChange([...rules, rule]);
        setNewRule({
            type: 'domain',
            value: '',
            enabled: true,
            description: ''
        });
        setShowAddForm(false);
    }, [newRule, rules, onChange]);

    const handleDeleteRule = useCallback((id: string) => {
        onChange(rules.filter(rule => rule.id !== id));
    }, [rules, onChange]);

    const handleToggleRule = useCallback((id: string) => {
        onChange(rules.map(rule => 
            rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
        ));
    }, [rules, onChange]);

    const handleEditRule = useCallback((rule: Rule) => {
        setEditingRule({ ...rule });
    }, []);

    const handleSaveEdit = useCallback(() => {
        if (!editingRule || !editingRule.value.trim()) return;
        
        onChange(rules.map(rule => 
            rule.id === editingRule.id ? editingRule : rule
        ));
        setEditingRule(null);
    }, [editingRule, rules, onChange]);

    const handleCancelEdit = useCallback(() => {
        setEditingRule(null);
    }, []);

    const handleLoadDefaults = useCallback(() => {
        const defaultRules: Rule[] = defaultRoutingRules.map(rule => ({
            id: generateId(),
            type: rule.type as Rule['type'],
            value: rule.value,
            enabled: true,
            description: getDefaultDescription(rule.type, rule.value)
        }));
        onChange(defaultRules);
    }, [onChange]);

    const getDefaultDescription = (type: string, value: string): string => {
        switch (type) {
            case 'domain':
                if (value.startsWith('!')) return 'Exclude domain';
                if (value.startsWith('*.')) return 'Wildcard domain';
                return 'Direct domain';
            case 'ip':
                return 'IP address';
            case 'app':
                return 'Application process';
            case 'geoip':
                return 'Geographic IP';
            case 'range':
                return 'IP range/CIDR';
            default:
                return '';
        }
    };

    const getRuleTypeLabel = (type: Rule['type']): string => {
        const labels = {
            domain: 'Domain',
            ip: 'IP',
            geoip: 'GeoIP',
            app: 'App',
            range: 'Range'
        };
        return labels[type] || type;
    };

    const getRuleIcon = (type: Rule['type']): string => {
        const icons = {
            domain: '🌐',
            ip: '🔢',
            geoip: '🌍',
            app: '📱',
            range: '📊'
        };
        return icons[type] || '📝';
    };

    return (
        <div className={classNames('rule-editor', className)}>
            <div className="rule-editor-header">
                <h3>Routing Rules Editor</h3>
                <div className="rule-editor-actions">
                    <button 
                        className="btn btn-secondary btn-sm"
                        onClick={handleLoadDefaults}
                        title="Load default rules"
                    >
                        <i className="material-icons">restore</i>
                        Defaults
                    </button>
                    <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => setShowAddForm(true)}
                        title="Add new rule"
                    >
                        <i className="material-icons">add</i>
                        Add Rule
                    </button>
                </div>
            </div>

            {showAddForm && (
                <div className="rule-form">
                    <div className="rule-form-header">
                        <h4>Add New Rule</h4>
                        <button 
                            className="btn-close"
                            onClick={() => setShowAddForm(false)}
                        >
                            <i className="material-icons">close</i>
                        </button>
                    </div>
                    <div className="rule-form-body">
                        <div className="form-group">
                            <label>Type:</label>
                            <select 
                                value={newRule.type}
                                onChange={(e) => setNewRule({...newRule, type: e.target.value as Rule['type']})}
                            >
                                <option value="domain">Domain</option>
                                <option value="ip">IP Address</option>
                                <option value="geoip">GeoIP</option>
                                <option value="app">Application</option>
                                <option value="range">IP Range</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Value:</label>
                            <input 
                                type="text"
                                value={newRule.value}
                                onChange={(e) => setNewRule({...newRule, value: e.target.value})}
                                placeholder="e.g., google.com, 192.168.1.1, *.example.com"
                            />
                        </div>
                        <div className="form-group">
                            <label>Description (optional):</label>
                            <input 
                                type="text"
                                value={newRule.description || ''}
                                onChange={(e) => setNewRule({...newRule, description: e.target.value})}
                                placeholder="Optional description"
                            />
                        </div>
                        <div className="form-actions">
                            <button 
                                className="btn btn-primary"
                                onClick={handleAddRule}
                                disabled={!newRule.value.trim()}
                            >
                                Add Rule
                            </button>
                            <button 
                                className="btn btn-secondary"
                                onClick={() => setShowAddForm(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="rules-list">
                {rules.length === 0 ? (
                    <div className="empty-state">
                        <i className="material-icons">rule</i>
                        <p>No routing rules configured</p>
                        <button 
                            className="btn btn-primary"
                            onClick={handleLoadDefaults}
                        >
                            Load Default Rules
                        </button>
                    </div>
                ) : (
                    rules.map((rule) => (
                        <div 
                            key={rule.id} 
                            className={classNames('rule-item', {
                                'rule-disabled': !rule.enabled,
                                'rule-editing': editingRule?.id === rule.id
                            })}
                        >
                            {editingRule?.id === rule.id ? (
                                <div className="rule-edit-form">
                                    <div className="rule-edit-fields">
                                        <select 
                                            value={editingRule.type}
                                            onChange={(e) => setEditingRule({
                                                ...editingRule, 
                                                type: e.target.value as Rule['type']
                                            })}
                                        >
                                            <option value="domain">Domain</option>
                                            <option value="ip">IP Address</option>
                                            <option value="geoip">GeoIP</option>
                                            <option value="app">Application</option>
                                            <option value="range">IP Range</option>
                                        </select>
                                        <input 
                                            type="text"
                                            value={editingRule.value}
                                            onChange={(e) => setEditingRule({
                                                ...editingRule, 
                                                value: e.target.value
                                            })}
                                        />
                                        <input 
                                            type="text"
                                            value={editingRule.description || ''}
                                            onChange={(e) => setEditingRule({
                                                ...editingRule, 
                                                description: e.target.value
                                            })}
                                            placeholder="Description"
                                        />
                                    </div>
                                    <div className="rule-edit-actions">
                                        <button 
                                            className="btn btn-sm btn-primary"
                                            onClick={handleSaveEdit}
                                        >
                                            <i className="material-icons">check</i>
                                        </button>
                                        <button 
                                            className="btn btn-sm btn-secondary"
                                            onClick={handleCancelEdit}
                                        >
                                            <i className="material-icons">close</i>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="rule-content">
                                        <div className="rule-type">
                                            <span className="rule-icon">{getRuleIcon(rule.type)}</span>
                                            <span className="rule-type-label">{getRuleTypeLabel(rule.type)}</span>
                                        </div>
                                        <div className="rule-value">
                                            <code>{rule.value}</code>
                                            {rule.description && (
                                                <small className="rule-description">{rule.description}</small>
                                            )}
                                        </div>
                                    </div>
                                    <div className="rule-actions">
                                        <button 
                                            className={classNames('btn-toggle', {
                                                'active': rule.enabled
                                            })}
                                            onClick={() => handleToggleRule(rule.id)}
                                            title={rule.enabled ? 'Disable rule' : 'Enable rule'}
                                        >
                                            <i className="material-icons">
                                                {rule.enabled ? 'toggle_on' : 'toggle_off'}
                                            </i>
                                        </button>
                                        <button 
                                            className="btn btn-sm btn-secondary"
                                            onClick={() => handleEditRule(rule)}
                                            title="Edit rule"
                                        >
                                            <i className="material-icons">edit</i>
                                        </button>
                                        <button 
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDeleteRule(rule.id)}
                                            title="Delete rule"
                                        >
                                            <i className="material-icons">delete</i>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>

            <div className="rule-editor-footer">
                <div className="rule-stats">
                    <span>{rules.length} total rules</span>
                    <span>{rules.filter(r => r.enabled).length} enabled</span>
                </div>
                <div className="rule-help">
                    <a 
                        href="https://github.com/heibais1986/oblivion-desktop/wiki/How-to-use-Routing-Rules"
                        target="_blank"
                        rel="noreferrer"
                        className="help-link"
                    >
                        <i className="material-icons">help</i>
                        Help
                    </a>
                </div>
            </div>
        </div>
    );
};

export default RuleEditor;