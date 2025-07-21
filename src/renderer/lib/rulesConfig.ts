import { ipcRenderer } from './utils';

// 规则模式类型
export type RuleMode = 'ruleset' | 'blacklist' | 'whitelist';

// 规则集配置接口
export interface RuleSetConfig {
    [key: string]: boolean;
}

// 规则配置接口
export interface RulesConfig {
    ruleset: {
        enabledRuleSets: RuleSetConfig;
        customRules: string;
    };
    blacklist: {
        rules: string;
    };
    whitelist: {
        rules: string;
    };
    currentMode: RuleMode;
}

// 默认配置
const defaultRulesConfig: RulesConfig = {
    ruleset: {
        enabledRuleSets: {
            'loyalsoldier-reject': true,
            'loyalsoldier-icloud': true,
            'loyalsoldier-apple': true,
            'loyalsoldier-google': false,
            'loyalsoldier-proxy': false,
            'loyalsoldier-direct': true,
            'loyalsoldier-private': true,
            'loyalsoldier-gfw': true,
            'loyalsoldier-tld-not-cn': false,
            'loyalsoldier-telegramcidr': false,
            'loyalsoldier-cncidr': true,
            'loyalsoldier-lancidr': true
        },
        customRules: ''
    },
    blacklist: {
        rules: ''
    },
    whitelist: {
        rules: ''
    },
    currentMode: 'ruleset'
};

export class RulesConfigManager {
    private static CONFIG_KEY = 'rulesConfig';

    // 获取完整配置
    public static async getConfig(): Promise<RulesConfig> {
        return new Promise((resolve) => {
            ipcRenderer.sendMessage('settings', {
                mode: 'get',
                key: this.CONFIG_KEY
            });

            ipcRenderer.on('settings', (res: any) => {
                if (res.key === this.CONFIG_KEY) {
                    try {
                        const config = res.value ? JSON.parse(res.value) : defaultRulesConfig;
                        resolve({ ...defaultRulesConfig, ...config });
                    } catch (error) {
                        console.error('Failed to parse rules config:', error);
                        resolve(defaultRulesConfig);
                    }
                }
            });
        });
    }

    // 保存完整配置
    public static async saveConfig(config: RulesConfig): Promise<void> {
        return new Promise((resolve) => {
            ipcRenderer.sendMessage('settings', {
                mode: 'set',
                key: this.CONFIG_KEY,
                value: JSON.stringify(config)
            });

            ipcRenderer.on('settings', (res: any) => {
                if (res.key === this.CONFIG_KEY) {
                    resolve();
                }
            });
        });
    }

    // 获取当前模式
    public static async getCurrentMode(): Promise<RuleMode> {
        const config = await this.getConfig();
        return config.currentMode;
    }

    // 设置当前模式
    public static async setCurrentMode(mode: RuleMode): Promise<void> {
        const config = await this.getConfig();
        config.currentMode = mode;
        await this.saveConfig(config);
    }

    // 获取规则集配置
    public static async getRuleSetConfig(): Promise<RuleSetConfig> {
        const config = await this.getConfig();
        return config.ruleset.enabledRuleSets;
    }

    // 保存规则集配置
    public static async saveRuleSetConfig(ruleSetConfig: RuleSetConfig): Promise<void> {
        const config = await this.getConfig();
        config.ruleset.enabledRuleSets = ruleSetConfig;
        await this.saveConfig(config);
    }

    // 获取黑名单规则
    public static async getBlacklistRules(): Promise<string> {
        const config = await this.getConfig();
        return config.blacklist.rules;
    }

    // 保存黑名单规则
    public static async saveBlacklistRules(rules: string): Promise<void> {
        const config = await this.getConfig();
        config.blacklist.rules = rules;
        await this.saveConfig(config);
    }

    // 获取白名单规则
    public static async getWhitelistRules(): Promise<string> {
        const config = await this.getConfig();
        return config.whitelist.rules;
    }

    // 保存白名单规则
    public static async saveWhitelistRules(rules: string): Promise<void> {
        const config = await this.getConfig();
        config.whitelist.rules = rules;
        await this.saveConfig(config);
    }

    // 获取规则集模式的自定义规则
    public static async getRulesetCustomRules(): Promise<string> {
        const config = await this.getConfig();
        return config.ruleset.customRules || '';
    }

    // 保存规则集模式的自定义规则
    public static async saveRulesetCustomRules(rules: string): Promise<void> {
        const config = await this.getConfig();
        if (!config.ruleset.customRules) {
            config.ruleset.customRules = '';
        }
        config.ruleset.customRules = rules;
        await this.saveConfig(config);
    }

    // 切换规则集状态
    public static async toggleRuleSet(ruleSetId: string): Promise<void> {
        const config = await this.getConfig();
        config.ruleset.enabledRuleSets[ruleSetId] = !config.ruleset.enabledRuleSets[ruleSetId];
        await this.saveConfig(config);
    }
}
