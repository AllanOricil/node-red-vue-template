import { SchemaType, defineSchema } from "@bonsae/nrg/server";

const ConfigsSchema = defineSchema(
  {
    name: SchemaType.String({ default: "splitter" }),
    threshold: SchemaType.Number({
      description: "Numeric threshold for splitting",
      default: 50,
    }),
    errorPort: SchemaType.Boolean({ default: false }),
    completePort: SchemaType.Boolean({ default: false }),
    statusPort: SchemaType.Boolean({ default: false }),
  },
  {
    $id: "SplitterConfigsSchema",
  },
);

const InputSchema = defineSchema(
  {
    payload: SchemaType.Number({
      description: "Numeric value to compare against threshold",
    }),
  },
  {
    $id: "SplitterInputSchema",
  },
);

const Output1Schema = defineSchema(
  {
    payload: SchemaType.Number({
      description: "Original value (above threshold)",
    }),
    label: SchemaType.String({ description: "Output label" }),
  },
  {
    $id: "SplitterOutput1Schema",
  },
);

const Output2Schema = defineSchema(
  {
    payload: SchemaType.Number({
      description: "Original value (at or below threshold)",
    }),
    label: SchemaType.String({ description: "Output label" }),
  },
  {
    $id: "SplitterOutput2Schema",
  },
);

export { ConfigsSchema, InputSchema, Output1Schema, Output2Schema };
