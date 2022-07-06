import { SocksClientOptions } from "socks";
export default class ImapClient {
  private options;
  private socket;
  private commandQueue;
  private currentCommand;
  private cmdTag;
  private connected;
  private greeted;
  constructor(options: SocksClientOptions);
  connect(): Promise<void>;
  login(username: string, password: string): Promise<void>;
  disconnect(): void;
  private sendCommand;
  private executeCommand;
}

export interface Command {
  cmd: string;
  callback: (buffer: Buffer) => void;
}
