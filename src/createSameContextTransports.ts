import { BrowserTransport } from './BrowserTransport';
import { generateSessionId } from './utils';

export const createSameContextTransports = (): {
  clientTransport: BrowserTransport;
  serverTransport: BrowserTransport;
} => {
  const channel = new MessageChannel();
  // Generate a single session ID for both transport instances
  const sessionId = generateSessionId();
  return {
    clientTransport: new BrowserTransport(channel.port1, sessionId),
    serverTransport: new BrowserTransport(channel.port2, sessionId),
  };
};
