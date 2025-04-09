export class TypedInput {
  constructor(
    parent: NodeRedNode,
    typedInput: { value: string; type: string }
  ) {
    this.parent = parent;
    this.value = typedInput.value;
    this.type = typedInput.type;
  }

  evaluate(msg: any) {
    const RED = NodeRedNode.RED;
    return new Promise((resolve, reject) => {
      RED.util.evaluateNodeProperty(
        this.value,
        this.type,
        RED,
        msg,
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });
  }
}

export interface NodeRedNode {
  id: string;
  type: string;
  z: string;
  g: string;
  wires: Array<Array<string>>;
}

export class NodeRedNode {
  static RED: any;

  constructor(config: any) {
    NodeRedNode.RED.nodes.createNode(this, config);

    this.__config = config;

    console.log("INSIDE PARENT CONSTRUCTOR");
    console.log(this);

    // if (this.constructor.configProperties) {
    //   this.constructor.configProperties.forEach(
    //     ({ key, default: defaultValue }) => {
    //       this[key] = config[key] !== undefined ? config[key] : defaultValue;
    //     }
    //   );
    // }

    // this.validateConfig();
  }

  onInput(msg, send, done) {
    console.log("parent on input");
    done();
  }
  onClose(removed, done) {
    done();
  }
}

export class NodeRedConfigNode extends NodeRedNode {
  constructor(config: any) {
    super(config);
  }
}
