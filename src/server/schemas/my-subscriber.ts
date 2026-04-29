import { defineSchema, SchemaType } from "@bonsae/nrg/server";
import MyBroker from "../nodes/my-broker";

const ConfigsSchema = defineSchema(
  {
    name: SchemaType.String({ default: "my-subscriber" }),
    broker: SchemaType.NodeRef(MyBroker, {
      "x-nrg-form": { icon: "server" },
    }),
    topic: SchemaType.String({
      default: "test/topic",
      "x-nrg-form": { icon: "hashtag" },
    }),
    qos: SchemaType.Number({ default: 0, enum: [0, 1, 2] }),
  },
  { $id: "my-subscriber:configs" },
);

const OutputSchema = defineSchema(
  {
    payload: SchemaType.String(),
    topic: SchemaType.String(),
  },
  { $id: "my-subscriber:output" },
);

export { ConfigsSchema, OutputSchema };
