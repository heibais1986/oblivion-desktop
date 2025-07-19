# 规则编辑功能调试指南

## 🔍 问题诊断

### 1. 检查标签页是否显示

规则标签页应该在底部导航栏显示。如果没有显示，可能的原因：

#### A. 条件显示限制
在 `src/renderer/pages/Landing/index.tsx` 中，标签页有显示条件：
```typescript
{(!isConnected || proxyMode === 'none' || (isConnected && !ipData)) && shortcut && (
    <Tabs active='landing' proxyMode={proxyMode} />
)}
```

**解决方案**: 确保满足以下条件之一：
- 应用未连接 (`!isConnected`)
- 代理模式为 'none' (`proxyMode === 'none'`)
- 已连接但没有IP数据 (`isConnected && !ipData`)
- 快捷方式开启 (`shortcut`)

#### B. 语言翻译缺失
检查当前语言的翻译文件是否包含 `rules` 翻译。

### 2. 手动访问规则页面

即使标签页不显示，你也可以通过以下方式访问：

1. **直接URL访问**: 在应用中手动导航到 `/rules` 路径
2. **开发者工具**: 使用浏览器开发者工具修改URL

### 3. 验证组件是否正确加载

检查以下文件是否存在且无语法错误：
- `src/renderer/pages/Rules/index.tsx`
- `src/renderer/components/RuleEditor/index.tsx`
- `src/renderer/routes/index.tsx`

## 🛠️ 临时解决方案

### 方案1: 移除标签页显示条件

修改 `src/renderer/pages/Landing/index.tsx`，移除条件限制：

```typescript
// 原代码
{(!isConnected || proxyMode === 'none' || (isConnected && !ipData)) && shortcut && (
    <Tabs active='landing' proxyMode={proxyMode} />
)}

// 修改为
{shortcut && (
    <Tabs active='landing' proxyMode={proxyMode} />
)}
```

### 方案2: 在其他页面添加规则链接

在 Network 页面或 Settings 页面添加一个链接到规则页面：

```typescript
<Link to="/rules" className="btn btn-primary">
    <i className="material-icons">rule</i>
    Routing Rules
</Link>
```

### 方案3: 使用现有的路由规则模态框

如果新的规则编辑器有问题，可以继续使用现有的路由规则模态框，它在 Network 页面中：
- 点击 Network 标签页
- 找到 "Routing Rules" 选项
- 点击打开现有的规则编辑器

## 🔧 快速修复

### 1. 确保标签页始终显示

```typescript
// 在 src/renderer/pages/Landing/index.tsx 中
// 将条件改为更宽松的条件
{shortcut && (
    <Tabs active='landing' proxyMode={proxyMode || 'none'} />
)}
```

### 2. 添加调试信息

在 Rules 页面添加调试信息：

```typescript
// 在 Rules 组件开头添加
console.log('Rules page loaded');
console.log('Current proxyMode:', proxyMode);
console.log('Rules data:', rules);
```

## 🎯 测试步骤

1. **启动应用**
2. **检查底部导航栏** - 是否有 "Rules" 标签页
3. **如果没有标签页**:
   - 检查应用状态（连接/断开）
   - 检查代理模式设置
   - 尝试手动导航到 `/rules`
4. **如果有标签页但点击无响应**:
   - 检查浏览器控制台错误
   - 检查组件是否正确加载
5. **如果页面加载但功能异常**:
   - 检查规则数据是否正确加载
   - 检查保存功能是否正常

## 📝 备用方案

如果新的规则编辑器暂时无法使用，可以：

1. **使用现有的文本编辑器** (在 Network 页面)
2. **手动编辑配置文件**
3. **等待依赖安装完成后重新构建**

## 🚀 最终解决方案

一旦依赖安装成功，运行以下命令重新构建：

```bash
npm run build
npm run start
```

然后检查规则编辑功能是否正常显示和工作。