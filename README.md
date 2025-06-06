# mcp-browser-transport

基于浏览器 MessageChannel API 的 Transport 实现，适配 [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk)，用于不同浏览器上下文（iframe、worker、tab、window 等）之间通信。

---

## 安装

```bash
npm install mcp-browser-transport @modelcontextprotocol/sdk
```

---

## 快速开始

### 1. 在同一上下文中模拟 Client/Server 通信

```ts
import { createSameContextTransports } from 'mcp-browser-transport';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

// 初始化 SDK
const client = new Client({ name: 'browser-client', version: '1.0.0' });
const server = new McpServer({ name: 'browser-server', version: '1.0.0' });

// 创建一对 transport
const { clientTransport, serverTransport } = createSameContextTransports();

await client.connect(clientTransport);
await server.connect(serverTransport);

// 注册工具
server.tool('add', { a: z.number(), b: z.number() }, async ({ a, b }) => ({
  content: [{ type: 'text', text: String(a + b) }],
}));

// 发起请求
const result = await client.listTools();
console.log(result);
```

---

### 2. 跨上下文通信（如 iframe、worker）

#### 父页面

```ts
import { BrowserTransport } from 'mcp-browser-transport';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

const iframe = document.createElement('iframe');
document.body.appendChild(iframe);
const channel = new MessageChannel();
iframe.contentWindow.postMessage('init', '*', [channel.port2]);

const client = new Client({ name: 'browser-client', version: '1.0.0' });
const transport = new BrowserTransport(channel.port1);
await client.connect(clientTransport);
```

#### 子页面（iframe 内）

```ts
import { BrowserTransport } from 'mcp-browser-transport';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

window.addEventListener('message', async (event) => {
  if (event.data === 'init' && event.ports[0]) {
    const server = new McpServer({ name: 'browser-server', version: '1.0.0' });
    const transport = new BrowserTransport(event.ports[0]);
    // 这里可以初始化 Server
    await server.connect(transport);
  }
});
```

---

## API 说明

- **BrowserTransport**：基于 MessagePort 的 Transport 实现
- **createSameContextTransports()**：快速创建一对可互通的 Transport 实例（适用于同一上下文）

---

## 依赖

- [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk)

---

## License

MIT

---

如需更详细的用法或遇到问题，欢迎提 Issue 或 PR！
