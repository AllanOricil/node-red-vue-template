import { SchemaType, defineSchema } from "@bonsae/nrg/server";

const ConfigsSchema = defineSchema(
  {
    name: SchemaType.String({ default: "splitter" }),
    threshold: SchemaType.Number({ default: 50 }),
  },
  {
    $id: "SplitterConfigsSchema",
  },
);

const InputSchema = defineSchema(
  {
    payload: SchemaType.Number(),
  },
  {
    $id: "SplitterInputSchema",
  },
);

const Output1Schema = defineSchema(
  {
    payload: SchemaType.Number(),
    label: SchemaType.String(),
  },
  {
    $id: "SplitterOutput1Schema",
  },
);

const Output2Schema = defineSchema(
  {
    payload: SchemaType.Number(),
    label: SchemaType.String(),
  },
  {
    $id: "SplitterOutput2Schema",
  },
);

export { ConfigsSchema, InputSchema, Output1Schema, Output2Schema };
