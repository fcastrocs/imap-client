import { SocksClient } from "socks";
import tls from "tls";
const CMD_TAG_PREFIX = "A";
export default class ImapClient {
    options;
    socket;
    commandQueue = [];
    currentCommand = null;
    cmdTag = 1;
    connected = false;
    greeted = false;
    constructor(options) {
        this.options = options;
    }
    async connect() {
        const info = await SocksClient.createConnection(this.options);
        this.socket = tls.connect({ servername: this.options.destination.host, socket: info.socket });
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
    async login(username, password) {
        return new Promise((resolve, reject) => {
            const callback = (buffer) => {
                const response = buffer.toString();
                if (response.includes("A1 OK"))
                    return resolve("logged in");
                return reject(response);
            };
            this.sendCommand({ cmd: `LOGIN ${username} ${password}`, callback });
        });
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
        const socketCommand = CMD_TAG_PREFIX + this.cmdTag + " " + this.currentCommand.cmd + "\r\n";
        this.cmdTag++;
        this.socket.write(socketCommand);
    }
}
