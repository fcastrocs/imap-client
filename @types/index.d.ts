import { SocksClientOptions } from "socks";
import { EventEmitter } from "events";
export default class ImapClient extends EventEmitter {
  private readonly options;
  private readonly commandQueue;
  private readonly tls;
  private socket;
  private currentCommand;
  private connected;
  private greeted;
  on(event: "error", listener: (error: Error) => void): this;
  constructor(options: SocksClientOptions, tls: boolean);
  connect(): Promise<void>;
  login(username: string, password: string, authType: AuthType): Promise<unknown>;
  private plainLogin;
  disconnect(): void;
  private sendCommand;
  private executeCommand;
}

export type AuthType = "PLAIN" | "CRAM-MD5";
export interface Command {
  cmd: string;
  callback: (buffer: Buffer) => void;
}
