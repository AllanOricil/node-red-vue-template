import { createApp, Component, App } from "vue";
import NodeRedVueApp from "./App.vue";

import NodeRedInput from "./components/NodeRedInput.vue";
import NodeRedTypedInput from "./components/NodeRedTypedInput.vue";
import NodeRedConfigInput from "./components/NodeRedConfigInput.vue";
import NodeRedSelectInput from "./components/NodeRedSelectInput.vue";
import NodeRedEditorInput from "./components/NodeRedEditorInput.vue";
import NodeRedNodeForm from "./components/NodeRedNodeForm.vue";

export function createNodeRedVueApp(
  node: any,
  NodeRedNodeForm: Component,
  validator: Function
): App<Element> {
  const app = createApp(NodeRedVueApp, {
    node,
    NodeRedNodeForm,
    validator,
  });

  app.component("NodeRedInput", NodeRedInput);
  app.component("NodeRedTypedInput", NodeRedTypedInput);
  app.component("NodeRedConfigInput", NodeRedConfigInput);
  app.component("NodeRedSelectInput", NodeRedSelectInput);
  app.component("NodeRedEditorInput", NodeRedEditorInput);
  app.component("NodeRedNodeForm", NodeRedNodeForm);

  return app;
}
