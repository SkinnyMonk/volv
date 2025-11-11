// Type declaration for octopusInstance
declare module '@/lib/octopus/octopusInstance' {
  interface WsHandlerResult {
    subscribe: (callback: (message: unknown) => void) => Promise<string>;
    unsubscribe: () => Promise<string>;
  }

  interface OctopusManager {
    connect(): Promise<boolean>;
    closeConnection(): void;
    wsHandler(params: {
      messageType: string;
      subscriptionLocation: string;
      payload: Record<string, unknown>;
    }): WsHandlerResult | null;
    isConnected(): boolean;
    refreshSubscriptions(): boolean;
    cleanUp(): void;
  }

  const octopusInstance: OctopusManager;
  export default octopusInstance;
}
