import { defineSchema, SchemaType } from "@bonsae/nrg/server";
import MyBroker from "../nodes/my-broker";

const ConfigsSchema = defineSchema(
  {
    name: SchemaType.String({ default: "my-subscriber" }),
    broker: SchemaType.NodeRef(MyBroker, {
      description: "Broker connection to subscribe through",
      "x-nrg-form": { icon: "server" },
    }),
    topic: SchemaType.String({
      description: "MQTT topic to subscribe to",
      default: "test/topic",
      "x-nrg-form": { icon: "hashtag" },
    }),
    qos: SchemaType.Number({
      description: "Quality of Service level",
      default: 0,
      enum: [0, 1, 2],
    }),
  },
  { $id: "my-subscriber:configs" },
);

const OutputSchema = defineSchema(
  {
    payload: SchemaType.String({ description: "Received message content" }),
    topic: SchemaType.String({
      description: "Topic the message was received on",
    }),
  },
  { $id: "my-subscriber:output" },
);

export { ConfigsSchema, OutputSchema };
