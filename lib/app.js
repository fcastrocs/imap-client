import { SocksClient } from "socks";
import tls from "tls";
export default class ImapClient {
    options;
    socket;
    constructor(options) {
        this.options = options;
    }
    async connect() {
        const info = await SocksClient.createConnection(this.options);
        this.socket = tls.connect({ servername: this.options.destination.host, socket: info.socket });
        this.socket.setKeepAlive(true);
        this.socket.on("data", (data) => {
            console.log(data);
        });
    }
}
