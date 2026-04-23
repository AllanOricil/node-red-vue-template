import { SchemaType, defineSchema } from "@bonsae/nrg/server";

const ConfigsSchema = defineSchema(
  {
    name: SchemaType.String({ default: "dynamic-outputs" }),
    outputs: SchemaType.Number({ default: 1, minimum: 1, maximum: 10 }),
    routingMode: SchemaType.String({
      default: "round-robin",
      enum: ["round-robin", "broadcast", "conditional"],
    }),
  },
  {
    $id: "DynamicOutputsConfigsSchema",
  },
);

export { ConfigsSchema };
