import { Socket } from "net";
import { SocksClient, SocksClientOptions } from "socks";
import tls from "tls";

export default class ImapClient {
  private options: SocksClientOptions;
  private socket: Socket;
  constructor(options: SocksClientOptions) {
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
