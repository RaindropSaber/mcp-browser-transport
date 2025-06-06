import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { JSONRPCMessage, JSONRPCMessageSchema } from '@modelcontextprotocol/sdk/types.js';
import { generateSessionId } from './utils';

/**
 * 基于浏览器 MessageChannel API 的 Transport 实现，
 * 用于不同浏览器上下文（iframe、worker、tab、window 等）之间通信。
 */
export class BrowserTransport implements Transport {
  private port: MessagePort;
  private isStarted = false;
  private isClosed = false;

  sessionId: string;

  onclose?: () => void;
  onerror?: (error: Error) => void;
  onmessage?: (message: JSONRPCMessage) => void;

  /**
   * 使用已有的 MessagePort 创建一个新的 BrowserTransport。
   *
   * @param port 用于通信的 MessagePort。
   * @param sessionId 可选的会话 ID。如果未提供，则自动生成。
   */
  constructor(port: MessagePort, sessionId?: string) {
    if (!port) throw new Error('MessagePort is required');

    this.port = port;
    this.sessionId = sessionId || generateSessionId();

    // 设置事件监听器
    this.port.onmessage = (event) => {
      try {
        const message = JSONRPCMessageSchema.parse(event.data);
        this.onmessage?.(message);
      } catch (error) {
        const parseError = new Error(`消息解析失败: ${error}`);
        this.onerror?.(parseError);
      }
    };

    this.port.onmessageerror = (event) => {
      const messageError = new Error(`MessagePort 错误: ${JSON.stringify(event)}`);
      this.onerror?.(messageError);
    };
  }

  /**
   * 启动 transport 的消息处理。
   * 如果尚未启动，则启动底层的 MessagePort。
   *
   * @throws 如果 transport 已启动或已关闭，则抛出错误。
   */
  async start(): Promise<void> {
    if (this.isStarted) throw new Error('BrowserTransport 已经启动！');
    if (this.isClosed) throw new Error('无法启动已关闭的 BrowserTransport');
    this.isStarted = true;
    this.port.start();
  }

  /**
   * 通过 MessagePort 发送 JSON-RPC 消息。
   *
   * @param message 要发送的 JSON-RPC 消息。
   * @throws 如果 transport 已关闭或消息无法发送，则抛出错误。
   */
  async send(message: JSONRPCMessage): Promise<void> {
    if (this.isClosed) throw new Error('无法在已关闭的 BrowserTransport 上发送消息');
    return new Promise((resolve, reject) => {
      try {
        this.port.postMessage(message);
        resolve();
      } catch (error) {
        const sendError = error instanceof Error ? error : new Error(String(error));
        this.onerror?.(sendError);
        reject(sendError);
      }
    });
  }

  /**
   * 关闭 MessagePort，并将 transport 标记为已关闭。
   * 如果定义了 onclose，会自动调用。
   */
  async close(): Promise<void> {
    if (this.isClosed) return;
    this.isClosed = true;
    this.port.close();
    this.onclose?.();
  }
}
