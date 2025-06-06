# mcp-browser-transport

基于浏览器 MessageChannel API 的 Transport 实现，适配 [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk)，用于不同浏览器上下文（iframe、worker、tab、window 等）之间通信。

## 安装

```bash
npm install mcp-browser-transport @modelcontextprotocol/sdk
```

## 典型用法

### 在同一上下文中模拟 client/server 通信

```ts
import { createSameContextTransports } from 'mcp-browser-transport';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

// 创建一对 transport
const { clientTransport, serverTransport } = createSameContextTransports();

// 用 transport 实例初始化 SDK
const client = new Client({ transport: clientTransport });
const server = new McpServer({ transport: serverTransport });

// 启动
await clientTransport.start();
await serverTransport.start();

// 发起请求
const result = await client.request('ping', {});
console.log(result); // { result: 'pong' }
```

### 在不同浏览器上下文（如 iframe、worker）中通信

你可以用 `new BrowserTransport(port)` 包装任意 `MessagePort`，然后传给 SDK：

```ts
import { BrowserTransport } from 'mcp-browser-transport';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

// 以 iframe 场景为例：
// 父页面
const iframe = document.createElement('iframe');
document.body.appendChild(iframe);
const channel = new MessageChannel();
iframe.contentWindow.postMessage('init', '*', [channel.port2]);
const transport = new BrowserTransport(channel.port1);
const client = new Client({ transport });
await transport.start();

// 子页面（iframe 内）
window.addEventListener('message', (event) => {
  if (event.data === 'init' && event.ports[0]) {
    const transport = new BrowserTransport(event.ports[0]);
    // 这里可以初始化 Server
    const server = new McpServer({ transport });
  }
});
```

## API

- `BrowserTransport`：基于 MessagePort 的 Transport 实现
- `createSameContextTransports()`：快速创建一对可互通的 Transport 实例，在相同上下文中使用

## 依赖

- [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk)

## License

MIT
