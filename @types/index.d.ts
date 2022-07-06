import { SocksClientOptions } from "socks";
export default class ImapClient {
  private options;
  private socket;
  constructor(options: SocksClientOptions);
  connect(): Promise<void>;
}
