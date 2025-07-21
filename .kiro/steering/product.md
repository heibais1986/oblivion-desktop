# Product Overview

Oblivion Desktop is an unofficial desktop VPN client that provides secure, optimized internet access using Cloudflare WARP technology. It's a cross-platform Electron application supporting Windows, macOS, and Linux.

## Key Features

- **VPN Security**: Custom WireGuard implementation with enterprise-level encryption
- **Multiple Connection Methods**: WARP, WARP+, Gool, and Cfon (Psiphon)
- **Network Configurations**: Proxy, System Proxy with PAC, and TUN with Sing-Box
- **Routing Rules**: System Proxy and GeoDB-based routing
- **Multi-language Support**: 13+ languages including Persian, English, Chinese, Russian, Turkish
- **Theme Support**: Light/Dark themes with RTL/LTR and auto-detection
- **System Integration**: System tray, boot-up, shortcuts, scanner, ping, speed test

## Target Users

- Users in regions with internet censorship and restrictions
- Privacy-conscious individuals seeking secure internet access
- Users needing reliable VPN solutions across multiple platforms

## Architecture

- **Frontend**: React + TypeScript with Electron renderer process
- **Backend**: Electron main process with Node.js
- **VPN Core**: Golang-based WireGuard implementation
- **Build System**: Webpack + electron-builder for cross-platform packaging

## 交流偏好

- 默认使用中文进行所有交流和代码注释
- 代码变量和函数名使用英文，但注释必须使用中文
- 错误信息和调试信息优先使用中文解释
