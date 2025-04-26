import { Node } from "./node";

export interface TypedInput {
  value: any;
  type: string;
  evaluate: (msg: Record<string, any>) => Promise<any>;
}

export class TypedInput {
  constructor(parent: Node, typedInput: { value: string; type: string }) {
    this.parent = parent;
    this.value = typedInput.value;
    this.type = typedInput.type;
  }

  evaluate(msg: any) {
    const RED = Node.RED;
    return new Promise((resolve, reject) => {
      RED.util.evaluateNodeProperty(
        this.value,
        this.type,
        RED,
        msg,
        (err, result) => {
          if (err) return reject(err);

          this.type === "node"
            ? resolve(RED.nodes.getNode(result))
            : resolve(result);
        }
      );
    });
  }
}
