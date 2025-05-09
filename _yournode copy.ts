import { config, node } from "./decorators";
import { RemoteServerConfigNode } from "./_server";
// import { Node } from "./node";
import { TypedInput } from "./typed-input";
import * as Credential from "./credential";
import InputsSchema from "./inputs-schema";
import MessageSchema from "./message-schema";
import { Type, Static } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

const TypedInputTypeLiterals = [
  Type.Literal("str"), // String
  Type.Literal("num"), // Number
  Type.Literal("bool"), // Boolean
  Type.Literal("json"), // JSON (often stored as a string initially)
  Type.Literal("date"), // Timestamp (number)
  Type.Literal("msg"), // Message property reference (string)
  Type.Literal("flow"), // Flow context reference (string)
  Type.Literal("global"), // Global context reference (string)
  Type.Literal("env"), // Environment variable reference (string)
  // Add any other types you support
] as const; // Use 'as const' for better type inference if needed outside Union

// 2. Define the main TypedInput schema
//    Export it so it can be imported and reused elsewhere
export const TypedInputSchema = Type.Object(
  {
    // 'value' can hold various primitive types or strings representing references
    value: Type.Union(
      [
        Type.String(),
        Type.Number(),
        Type.Boolean(),
        Type.Null(), // Allow null? Decide based on your needs
        // Add Type.Unknown() if it can truly be anything initially
      ],
      {
        description: "The actual value entered or selected.",
        // Add a default value if appropriate, e.g., default: ''
      }
    ),
    // 'type' indicates how the 'value' should be interpreted or where it comes from
    type: Type.Union(
      TypedInputTypeLiterals, // Use the literals defined above
      {
        description:
          "The type of the value (string, number, message property, etc.)",
        default: "str", // Set a sensible default type, e.g., 'string'
      }
    ),
  },
  {
    // Add schema identifier or description if desired
    $id: "TypedInput",
    description: "Represents a Node-RED TypedInput value and its type.",
  }
);

const ServerConfigSchema = Type.Object({
  id: Type.String(),
  type: Type.Literal("server-config"), // Matches class property
  name: Type.Optional(Type.String({ default: "" })),
  host: Type.String({ format: "hostname" }),
  port: Type.Integer({ minimum: 1, maximum: 65535 }),
  apiKey: Type.Optional(Type.String({ isTextCredential: true })), // Matches class property
  myMqttServer: Type.String({
    title: "MQTT Server",
    description: "Select the configured MQTT Broker connection.",
    pattern: "^[a-f0-9]+\\.[a-f0-9]+$", // Optional pattern
    // --- Custom Metadata added via options ---
    "x-node-red-config-node-type": "mqtt-broker",
    "x-node-red-input-type": "config-node-select",
    test: "abc"
  }),
});

type ServerConfigData = Static<typeof ServerConfigSchema>;

ServerConfigSchema.properties.myMqttServer

// 3. Export the corresponding static TypeScript type
//    Use a distinct name like TypedInputData to avoid conflicts with a potential TypedInput class
export type TypedInputData = Static<typeof TypedInputSchema>;

const ConfigsSchema = Type.Object({
  type: Type.Literal("my-node");
  name: Type.Optional(Type.String()),
  topic: Type.String({ default: "" }),
  inputValue: TypedInputSchema, // Reusing the schema definition
  anotherInput: Type.Optional(TypedInputSchema),
  server: Type.Composite(
    [
      // Use ServerConfigSchema for validation of the INSTANCE's properties
      ServerConfigSchema,
    ],
    {
      resolveNodeRef: "server-config", // Apply resolver keyword
      isConfigNode: true, // Marker for defaults generation
      description:
        "Reference to the server configuration node (resolved to class instance)",
      default: "", // Default value for the ID string before resolution
    }
  ),
});


type Configs = Static<typeof ConfigsSchema>;

const BaseInputMessageSchema = Type.Object({
  topic: Type.Optional(Type.String()),
  _msgid: Type.Optional(Type.String()),
  // Add other common, non-payload properties if applicable
}, { $id: 'BaseMessageStructureSchema' });



function defineInputMessageSchema<T extends TSchema>(developerSchema: T) {
  return Type.Intersect(
    [
      BaseInputMessageSchema,
      developerSchema
    ],
    { $id: 'InputMessageSchema' }
  );
}



const InputMessageSchema = defineInputMessageSchema(
  Type.Object({ 
    myVariable: Type.Optional(Type.String())
  })
);


type InputMessage = Static<typeof InputMessageSchema>;


const OutputMessageSchema = Type.Intersect([
  Type.Object({
      payload: Type.String(),
      originalType: Type.Union([Type.Literal('string'), Type.Literal('number')]),
      processedTime: Type.Number(),
      topic: Type.Optional(Type.String()),
      _msgid: Type.Optional(Type.String()),
  }),
  Type.Unknown()
], { $id: 'OutputMessageSchema' });

type OutputMessage = Static<typeof OutputMessageSchema>;

type SendFunction<T> = (data: T | T[]) => void;

type InputDoneFunction = (error?: Error) => void;

type CloseDoneFunction = () => void;

const CredentialsSchema = Type.Object({
  password: Type.Optional(Type.String()),
  username: Type.Optional(Type.String({ default: "" })),
});

type TCredentials = Static<typeof CredentialsSchema>;

export abstract class Node<TConfigs, TCredentials, TInputMessage = NodeMessage, TOutputMessage = NodeMessage | NodeMessage[] | (NodeMessage | null)[]> {
  public readonly id: string;
  public readonly type: string;
  public readonly name: string;
  public readonly wires: string[][];
  public readonly x?: number;
  public readonly y?: number;
  public readonly z?: string;
  public readonly g?: string;

  protected readonly configs: TConfigs;
  protected readonly credentials?: TCredentials;

  constructor(configs: TConfigs) {
    Node.RED.nodes.createNode(this, configs);
    this.configs = configs;
    this.credentials = (Node.RED.nodes.getCredentials(nodeInstance.id)) as TCredentials;
  }

  abstract onInput(msg: TInputMessage, send: SendFunction<TOutputMessage>, done: InputDoneFunction) : void | Promise<void>

  abstract onClose(removed: boolean, done: CloseDoneFunction): void | Promise<void>

  protected getNode(nodeId: string): Node {
    return Node.RED.nodes.getNode(nodeId);
  }
}

@node({
  schemas: {
    configs: ConfigsSchema,
    credentials: CredentialsSchema,
    inputMessage: InputMessageSchema,
    outputMessage: OutputMessageSchema,
  },
})
export class YourNode extends Node<Configs, Credentials, InputMessage, OutputMessage>{


  async onInput(msg: InputMessage, send: SendFunction<OutputMessage>, done: InputDoneFunction) : Promise<void>{
  

  }

  async onClose(removed: boolean, done: CloseDoneFunction): void | Promise<void> {
      
  }

}
