# 调试白名单规则问题

## 问题描述

微信WeChatAppEx.exe打开138.com时，仍然显示代理地址，而不是直连。

## 可能的原因

### 1. 进程名匹配问题

- 微信内置浏览器可能使用不同的进程
- 某些网页可能在独立的进程中运行

### 2. 微信内置浏览器的特殊性

- 微信内置浏览器可能有自己的网络栈
- 可能不受系统代理设置影响
- 可能使用不同的进程名

### 3. DNS解析问题

- 即使应用走直连，DNS查询可能仍然走代理
- 导致显示的IP地址是代理服务器的

## 调试步骤

### 步骤1: 检查实际的网络连接

```powershell
# 查看微信相关进程的网络连接
netstat -ano | findstr :80
netstat -ano | findstr :443
```

### 步骤2: 检查微信的所有进程

```powershell
# 查看所有微信相关进程
Get-Process | Where-Object { $_.ProcessName -like "*WeChat*" } | Select-Object ProcessName, Id, Path
```

### 步骤3: 实时监控网络流量

使用Wireshark或Fiddler监控微信的网络请求，看是否真的走了直连。

### 步骤4: 检查生成的Sing-Box配置

查看实际生成的配置文件，确认规则是否正确。

## 可能的解决方案

### 方案1: 添加更多微信进程

可能需要添加微信的其他子进程：

```
app:WeChat.exe
app:WeChatAppEx.exe
app:WeChatOCR.exe
app:WeChatPlayer.exe
app:WeChatUtility.exe
app:WeChatWeb.exe
app:WeChatBrowser.exe
```

### 方案2: 使用域名规则替代应用规则

如果应用规则不生效，可以尝试使用域名规则：

```
domain:138.com
domain:*.138.com
```

### 方案3: 检查DNS设置

确保DNS查询也走直连：

- 在TUN模式下，DNS查询可能仍然走代理
- 需要确保DNS服务器设置正确

### 方案4: 使用IP规则

如果域名规则不生效，可以尝试直接使用IP规则：

```
ip:138.com的实际IP地址
```

## 测试方法

### 方法1: 使用命令行测试

```bash
# 测试直连
curl -I http://138.com

# 测试通过代理
curl -I http://138.com --proxy socks5://127.0.0.1:端口
```

### 方法2: 使用不同的应用测试

- 在Firefox中访问138.com（已配置为直连）
- 对比微信内置浏览器的结果

### 方法3: 检查IP地址

- 直连时应该显示138.com的真实IP
- 走代理时会显示代理服务器的IP

## 下一步行动

1. 首先确认微信的所有相关进程
2. 检查生成的Sing-Box配置文件
3. 使用网络监控工具验证实际的网络流量
4. 如果应用规则不生效，改用域名规则
