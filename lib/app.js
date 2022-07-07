import { SocksClient } from "socks";
import { EventEmitter } from "events";
import tls from "tls";
const CMD_TAG_PREFIX = "A";
export default class ImapClient extends EventEmitter {
    options;
    socket;
    commandQueue = [];
    currentCommand = null;
    connected = false;
    greeted = false;
    tls;
    constructor(options, tls) {
        super();
        this.options = options;
        this.tls = tls;
    }
    async connect() {
        const info = await SocksClient.createConnection(this.options);
        if (this.tls) {
            this.socket = tls.connect({ servername: this.options.destination.host, socket: info.socket, rejectUnauthorized: false });
        }
        else {
            this.socket = info.socket;
        }
        this.socket.setKeepAlive(true);
        this.connected = true;
        this.socket.on("error", (error) => {
            this.emit("error", error);
        });
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
    async login(username, password, authType) {
        if (authType === "PLAIN") {
            return this.plainLogin(username, password);
        }
    }
    async plainLogin(username, password) {
        return new Promise((resolve, reject) => {
            const callback = (buffer) => {
                const response = buffer.toString();
                if (response.includes(CMD_TAG_PREFIX + " OK"))
                    return resolve("logged in");
                return reject(response);
            };
            this.sendCommand({ cmd: `login ${username} ${password}`, callback });
        });
    }
    /*private async cramMD5Login(username: string, password: string) {
      return new Promise((resolve, reject) => {
        this.sendCommand({
          cmd: `authenticate cram-md5`,
          callback: (data: Buffer) => {
            const challenge = data.toString().replace("+", "");
            const hmacMd5 = crypto.createHmac("md5", password);
            hmacMd5.update(challenge);
  
            const cmd = Buffer.from(username + " " + hmacMd5.digest("hex").toLowerCase()).toString("base64");
            this.sendCommand({
              cmd,
              callback: (data) => {
                console.log(data);
              },
            });
          },
        });
  
        const callback = (buffer: Buffer) => {
          const response = buffer.toString();
          if (response.includes("A1 OK")) return resolve("logged in");
          return reject(response);
        };
      });
    }*/
    disconnect() {
        this.socket.destroy();
    }
    sendCommand(command) {
        if (!this.connected) {
            throw "Not connected to imap server";
        }
        this.commandQueue.push(command);
        if (!this.currentCommand) {
            this.executeCommand();
        }
    }
    executeCommand() {
        if (this.commandQueue.length == 0 || this.currentCommand) {
            return;
        }
        this.currentCommand = this.commandQueue.shift();
        const socketCommand = CMD_TAG_PREFIX + " " + this.currentCommand.cmd + "\r\n";
        this.socket.write(socketCommand);
    }
}
