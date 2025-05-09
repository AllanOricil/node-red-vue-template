import { config, node } from "./decorators";
import { RemoteServerConfigNode } from "./_server";
import { Node } from "./node";
import { TypedInput } from "./typed-input";
import * as Credential from "./credential";
import InputsSchema from "./stack-config-schema";
import { Toolkit } from "@aws-cdk/toolkit-lib";
import * as core from "aws-cdk-lib/core";
import { Stack, StackProps } from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

class MyStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new s3.Bucket(this, "Testing this super bucket", {
      versioned: true,
    });
  }
}

@node({
  type: "stack-node",
  validation: {
    inputs: InputsSchema,
  },
})
export class StackNode extends Node {
  @config
  name: string;

  static init() {
    const RED = Node.RED;
    RED.httpAdmin.post("/stack-node/:id/synth", async function (req, res) {
      console.log("inside post handler");
      const nodeId = req.params.id;
      console.log(`Node Id: ${nodeId}`);
      const stackNode = RED.nodes.getNode(nodeId);
      if (stackNode) {
        console.log("ABOUT TO SYNTH");
        console.log(stackNode);
        await stackNode.synth();
      }
    });
  }

  async synth(): void {
    console.log("Synthesing stack");
    console.log(this);

    const cdk: Toolkit = new Toolkit();
    const cx = await cdk.fromAssemblyBuilder(async () => {
      const app = new core.App();
      console.log(`NAME: ${this.name}`);
      new MyStack(app, this.name);
      return app.synth();
    });

    console.log(cx);

    const cxSnap = await cdk.synth(cx, {
      validateStacks: true,
    });

    console.log(cxSnap);
  }
}
