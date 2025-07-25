import { Language } from './type';

const chinese: Language = {
    global: {},
    status: {
        connecting: '连接中...',
        connected: '已连接',
        connected_confirm: '已连接',
        disconnecting: '断开连接中...',
        disconnected: '已断开连接',
        ip_check: '检查 IP 中...',
        keep_trying: '请稍等片刻，再次尝试...',
        preparing_rulesets: '正在准备规则集...',
        downloading_rulesets_failed: '下载规则集失败。'
    },
    home: {
        title_warp_based: '基于 Warp',
        drawer_settings_warp: 'Warp 设置',
        drawer_settings_routing_rules: '路由规则',
        drawer_settings_app: '应用设置',
        drawer_settings_scanner: '扫描仪设置',
        drawer_settings_network: '网络设置',
        drawer_log: '应用日志',
        drawer_update: '更新',
        drawer_update_label: '新版本',
        drawer_speed_test: '速度测试',
        drawer_about: '关于应用',
        drawer_lang: '更改语言',
        drawer_singbox: '隧道设置'
    },
    toast: {
        ip_check_please_wait: '请等待几秒钟后重试检查！',
        ir_location:
            'Cloudflare 已连接到一个具有伊朗位置的 IP，与您的实际 IP 不同。您可以使用它来绕过过滤，但不会绕过制裁。不用担心！您可以在设置中使用 Gool 或 psiphon 选项更改位置。',
        btn_submit: '了解',
        copied: '已复制！',
        cleared: '日志已被清除！',
        please_wait: '请等待...',
        offline: '您处于离线状态！',
        settings_changed: '应用设置已更改，需要重新连接。',
        hardware_usage: '启用此选项会增加硬件资源的使用。',
        config_added: '配置已成功添加，要使用它，您必须点击连接。',
        profile_added: '端点已成功添加到个人资料中。',
        endpoint_added: '终端已成功替换。',
        new_update: '有新版本的应用可用。您想下载并准备安装吗？',
        exit_pending: '应用程序正在完成退出过程；请稍等片刻后再重新启动。',
        help_btn: '帮助'
    },
    settings: {
        title: 'Warp 设置',
        more: '更多设置',
        method_warp: 'Warp',
        method_warp_desc: '启用 Warp',
        method_gool: 'Gool',
        method_gool_desc: '启用 WarpInWarp',
        method_psiphon: 'Psiphon',
        method_psiphon_desc: '启用 Psiphon',
        method_psiphon_location: '选择国家',
        method_psiphon_location_auto: '随机',
        method_psiphon_location_desc: '选择所需的国家 IP 地址',
        endpoint: '端点',
        endpoint_desc: 'IP 或域名与端口的组合',
        license: '许可证',
        license_desc: '许可证消耗翻倍',
        option: '应用设置',
        network: '网络设置',
        proxy_mode: '代理模式',
        proxy_mode_desc: '选择代理模式',
        port: '代理端口',
        port_desc: '定义应用的代理端口',
        share_vpn: '绑定地址',
        share_vpn_desc: '在局域网上共享代理',
        dns: 'DNS',
        dns_desc: '屏蔽广告和成人内容',
        dns_error: '适用于 Warp 和 Gool 方法',
        ip_data: '解析目标地址',
        ip_data_desc: '连接后显示 IP 和位置',
        data_usage: '数据使用量',
        data_usage_desc: '显示数据使用量和实时速度',
        dark_mode: '深色模式',
        dark_mode_desc: '定义应用主题模式',
        lang: '语言',
        lang_desc: '更改应用界面语言',
        open_login: '开机自启',
        open_login_desc: '系统启动时打开',
        auto_connect: '自动连接',
        auto_connect_desc: '应用程序打开时连接',
        start_minimized: '启动时最小化',
        start_minimized_desc: '应用程序打开时最小化',
        system_tray: '隐藏系统托盘',
        system_tray_desc: '不在任务栏显示应用图标',
        force_close: '强制关闭',
        force_close_desc: '退出时不要停留在系统托盘中',
        shortcut: '导航器',
        shortcut_desc: '主页上的快捷方式',
        sound_effect: '声音效果',
        sound_effect_desc: '成功连接时播放声音',
        restore: '恢复默认设置',
        restore_desc: '将应用设置还原为默认值',
        scanner: '扫描仪设置',
        scanner_alert: '如果您使用默认端点地址，扫描仪将被激活。',
        scanner_ip_type: '端点类型',
        scanner_ip_type_auto: '自动',
        scanner_ip_type_desc: '用于查找终点 IP',
        scanner_rtt: 'RTT 延迟',
        scanner_rtt_default: '默认',
        scanner_rtt_desc: '设置扫描仪 RTT 延迟值',
        scanner_reserved: '保留',
        scanner_reserved_desc: '覆盖 wireguard 保留值',
        routing_rules: '黑名单',
        routing_rules_desc: '阻止 Warp 的流量通过',
        routing_rules_disabled: '已禁用',
        routing_rules_items: '项目',
        profile: '个人资料',
        profile_desc: '您保存的端点',
        singbox: '隧道设置',
        close_singbox: '停止操作',
        close_singbox_desc: '断开连接时自动关闭 sing-box',
        close_helper: '停止助手',
        close_helper_desc: '退出时自动关闭助手',
        mtu: 'MTU 值',
        mtu_desc: '设置最大传输单元',
        geo_block: '阻止',
        geo_block_desc: '广告、恶意软件、网络钓鱼和加密货币矿工',
        geo_rules_ip: 'IP 路由',
        geo_rules_ip_desc: '应用 GeoIP 规则',
        geo_rules_site: '网页路由',
        geo_rules_site_desc: '应用 GeoSite 规则',
        geo_nsfw_block: '内容过滤',
        geo_nsfw_block_desc: '屏蔽 NSFW 网站',
        more_helper: '助理设置',
        singbox_log: '日志记录',
        singbox_log_desc: '设置日志级别',
        singbox_stack: '堆栈',
        singbox_stack_desc: '设置堆栈类型',
        singbox_sniff: '嗅探',
        singbox_sniff_desc: '启用嗅探并覆盖目标',
        singbox_addressing: '寻址',
        singbox_addressing_desc: '设置接口地址类型',
        singbox_udp_block: '阻止 UDP',
        singbox_udp_block_desc: '完全阻止所有 UDP 流量',
        singbox_discord_bypass: 'Discord',
        singbox_discord_bypass_desc: '绕过 Discord 过滤',
        more_duties: '更多职责',
        beta_release: 'Beta 更新',
        beta_release_desc: '了解预发布版本'
    },
    tabs: {
        home: '连接',
        warp: 'Warp',
        network: '网络',
        rules: '规则',
        scanner: '扫描仪',
        app: '应用',
        singbox: '隧道'
    },
    modal: {
        endpoint_title: '端点',
        license_title: '许可证',
        license_desc:
            '应用不一定需要 Warp 许可证才能运行，但如果您愿意，可以在此处输入您的许可证。',
        form_clear: '清除',
        test_url_title: '测试 URL',
        test_url_desc: '连接测试地址',
        test_url_update: '接收建议',
        port_title: '代理端口',
        restore_title: '恢复更改',
        restore_desc: '确认恢复默认设置后，所有应用设置将恢复为默认值，并且您的连接将断开。',
        routing_rules_sample: '示例',
        routing_rules_alert_tun: '只有域名、ip和应用的路由规则会影响Tun配置。',
        routing_rules_alert_system: '除了应用路由规则，其他规则将影响系统代理配置。',
        form_default: '默认',
        endpoint_suggested: '建议',
        endpoint_latest: '最新的',
        endpoint_update: '接收建议的端点',
        endpoint_paste: '粘贴活动端点',
        profile_title: '个人资料',
        profile_name: '标题',
        profile_endpoint: '端点',
        profile_limitation: (value) => `您最多可以添加 ${value} 个端点。`,
        mtu_title: 'MTU 值',
        mtu_desc: '最大传输单元 (MTU) 是指数据包的最大大小，应设置在 1000 到 9999 之间。',
        custom_dns_title: '自定义 DNS',
        confirm: '确认',
        update: '更新',
        cancel: '取消'
    },
    log: {
        title: '应用日志',
        desc: '如果应用生成日志，将在此处显示。',
        error_invalid_license: '输入的许可证无效；去掉它。',
        error_too_many_connected: '许可证使用限制已满；去掉它。',
        error_access_denied: '以管理员身份运行程序。',
        error_failed_set_endpoint: '检查或替换端点值，或重试。',
        error_warp_identity: 'cloudflare 中的身份验证错误!',
        error_script_failed: '程序遇到错误；再试一次。',
        error_object_null: '程序遇到错误；再试一次。',
        error_port_already_in_use: (value) => `端口 ${value} 正在被另一个程序使用；更改。`,
        error_port_socket: '使用另一个端口。',
        error_port_restart: '端口正在使用中；正在重新启动...',
        error_unknown_flag: '后台执行了无效命令。',
        error_deadline_exceeded: '连接超时；再试一次。',
        error_configuration_encountered: '代理配置遇到错误！',
        error_desktop_not_supported: '不支持桌面环境！',
        error_configuration_not_supported:
            '您的操作系统不支持代理配置，但您可以手动使用 Warp 代理。',
        error_configuring_proxy: (value) => `为 ${value} 配置代理时出错！`,
        error_wp_not_found: 'warp-plus 文件不在应用程序包旁边。',
        error_wp_exclusions:
            '很可能由于误报和杀毒软件错误检测，warp-plus 文件被隔离，导致程序无法正常访问互联网。\n如果授权访问，程序可以将该文件添加到某些杀毒软件的排除列表中。是否执行此操作？',
        error_wp_stopped: 'warp-plus 文件在运行时遇到了问题！',
        error_connection_failed: '无法连接到1.1.1.1。',
        error_country_failed: '无法连接到所选国家.',
        error_singbox_failed_stop: '停止 Sing-Box 失败!',
        error_singbox_failed_start: '启动 Sing-Box 失败!',
        error_wp_reset_peer: '与 Cloudflare 的连接意外中断！',
        error_failed_connection: '无法建立连接！',
        error_canceled_by_user: '操作已被用户取消。',
        error_helper_not_found: '未在应用程序包旁找到助手文件！',
        error_singbox_ipv6_address:
            '您的操作系统不支持 IPv6。请前往隧道设置并将地址类型更改为 IPv4。',
        error_local_date: '请确保您的系统日期和时间设置正确！'
    },
    about: {
        title: '关于应用',
        desc: '该应用程序是 Warp 客户端的 Windows、Linux 和 MacOS 的非官方但可靠版本，基于 Oblivion 或 Forget 项目。\nOblivion Desktop应用旨在实现对互联网的自由访问。界面设计基于 Yousef Ghobadi 开发的原始版本。不允许任何改名或商业用途。',
        slogan: '互联网，联万物；不通达，何存乎！'
    },
    systemTray: {
        connect: '连接',
        connecting: '正在连接 ...',
        connected: '已连接',
        disconnecting: '断开连接 ...',
        settings: '设置',
        settings_warp: 'Warp',
        settings_network: '网络',
        settings_scanner: '扫描仪',
        settings_app: '应用程序',
        about: '关于',
        log: '日志',
        speed_test: '速度测试',
        exit: '退出'
    },
    update: {
        available: '有更新',
        available_message: (value) => `新的 ${value} 版本可用。您想现在更新吗？`,
        ready: '更新已准备好',
        ready_message: (value) =>
            `新的 ${value} 版本已准备好。它将在重新启动后安装。您想现在重新启动吗？`
    },
    speedTest: {
        title: '速度测试',
        initializing: '速度测试初始化中 ...',
        click_start: '点击按钮开始速度测试',
        error_msg: '速度测试期间发生错误。请再试一次。',
        server_unavailable: '速度测试服务器不可用',
        download_speed: '下载速度',
        upload_speed: '上传速度',
        latency: '延迟',
        jitter: '抖动'
    },
    rules: {
        title: '路由规则',
        subtitle: '配置哪些流量应该绕过VPN连接',
        save_changes: '保存更改',
        reset: '重置',
        mode_ruleset: '规则集',
        mode_blacklist: '黑名单',
        mode_whitelist: '白名单',
        mode_ruleset_desc: '使用预定义的规则集合',
        mode_blacklist_desc: '指定哪些流量走代理',
        mode_whitelist_desc: '指定哪些流量直连',
        select_rule_sets: '选择规则集',
        select_rule_sets_desc: '从基于 Loyalsoldier/clash-rules 的预定义规则集合中选择',
        direct_connection: '直连',
        proxy_connection: '代理连接',
        block_reject: '阻止/拒绝',
        generated_rules_preview: '生成的规则预览',
        blacklist_rules_syntax: '黑名单规则语法：',
        whitelist_rules_syntax: '白名单规则语法：',
        examples: '示例',
        no_rules_generated: '未生成规则'
    }
};
export default chinese;
