import { SocksClientOptions } from "socks";
import { EventEmitter } from "events";
export default class ImapClient extends EventEmitter {
  private options;
  private socket;
  private commandQueue;
  private currentCommand;
  private cmdTag;
  private connected;
  private greeted;
  private tls;
  constructor(options: SocksClientOptions, tls: boolean);
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
