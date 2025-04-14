export interface Node {
  id: string;
  type: string;
  z: string;
  g: string;
  wires: Array<Array<string>>;
}

export class Node {
  static RED: any;

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
