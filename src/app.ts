import { Socket } from "net";
import { SocksClient, SocksClientOptions } from "socks";
import { EventEmitter } from "events";
import tls from "tls";
import { Command } from "../@types";

const CMD_TAG_PREFIX = "A";

export default class ImapClient extends EventEmitter {
  private options: SocksClientOptions;
  private socket: Socket;
  private commandQueue: Command[] = [];
  private currentCommand: Command = null;
  private cmdTag = 1;
  private connected: boolean = false;
  private greeted: boolean = false;
  private tls: boolean;

  constructor(options: SocksClientOptions, tls: boolean) {
    super();
    this.options = options;
    this.tls = tls;
  }

  async connect() {
    const info = await SocksClient.createConnection(this.options);
    info.socket.on("error", (error) => {
      this.emit("error", error);
    });

    if (this.tls) {
      this.socket = tls.connect({ servername: this.options.destination.host, socket: info.socket, rejectUnauthorized: false });
    } else {
      this.socket = info.socket;
    }

    this.socket.setKeepAlive(true);
    this.connected = true;
    this.socket.on("data", (data) => {
      if (!this.greeted) {
        this.greeted = true;
        return;
      }

      if (this.currentCommand) {
        this.currentCommand.callback(data);
        this.currentCommand = null;
      }

      this.executeCommand();
    });
  }

  async login(username: string, password: string) {
    return new Promise((resolve, reject) => {
      const callback = (buffer: Buffer) => {
        const response = buffer.toString();
        if (response.includes("A1 OK")) return resolve("logged in");
        return reject(response);
      };
      this.sendCommand({ cmd: `LOGIN ${username} ${password}`, callback });
    });
  }

  public disconnect() {
    this.socket.destroy();
  }

  private sendCommand(command: Command) {
    if (!this.connected) {
      throw "Not connected to imap server";
    }

    this.commandQueue.push(command);

    if (!this.currentCommand) {
      this.executeCommand();
    }
  }

  private executeCommand() {
    if (this.commandQueue.length == 0 || this.currentCommand) {
      return;
    }
    this.currentCommand = this.commandQueue.shift();
    const socketCommand = CMD_TAG_PREFIX + this.cmdTag + " " + this.currentCommand.cmd + "\r\n";
    this.cmdTag++;
    this.socket.write(socketCommand);
  }
}
