import { config } from "./decorators";

export interface Node {
  id: string;
  type: string;
  z: string;
  g: string;
  wires: Array<Array<string>>;
}

export abstract class Node<ConfigType, CredentialsType> {
  // Property to hold the configuration, typed with the generic
  protected readonly config: ConfigType; // Use protected or public as needed
  protected credentials?: CredentialsType;
  protected readonly type: string;

  constructor(config: ConfigType) {
    Node.RED.nodes.createNode(this, config);
    this.config = config;

    const creds = this.RED.nodes.getCredentials(nodeInstance.id);
    if (creds) {
      // You might need validation here if you have a CredentialsSchema
      this.credentials = creds as CredentialsType; // Assign fetched credentials
      console.log("Base Node: Credentials loaded.");
    } else {
      console.log("Base Node: No credentials found or defined.");
    }

    console.log("Base Node initialized with config:", this.config);
    // You might perform common setup based on config here
  }
}

export abstract class Node<ConfigType, CredentialsType> {
  static RED: any;

  @config
  name: string;

  constructor(config: any) {
    Node.RED.nodes.createNode(this, config);

    this.__config = config;

    console.log("INSIDE PARENT CONSTRUCTOR");
    console.log(this);
  }

  onInput(msg, send, done) {
    console.log("parent on input");
    done();
  }
  onClose(removed, done) {
    done();
  }
}
