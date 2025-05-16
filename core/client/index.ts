import { createApp, Component, App, defineComponent } from "vue";
import { cloneDeep, isEqual, merge } from "es-toolkit";
import { ValidateFunction, JSONSchemaType } from "ajv";
import { getDefaultsFromSchema, getCredentialsFromSchema } from "../utils";
import { validatorService } from "./validator";
import NodeRedVueApp from "./App.vue";
import NodeRedInput from "./components/NodeRedInput.vue";
import NodeRedTypedInput from "./components/NodeRedTypedInput.vue";
import NodeRedConfigInput from "./components/NodeRedConfigInput.vue";
import NodeRedSelectInput from "./components/NodeRedSelectInput.vue";
import NodeRedEditorInput from "./components/NodeRedEditorInput.vue";

interface NodeStateCredentials {
  [key: string]: any;
}

interface NodeState {
  credentials: NodeStateCredentials;
  [key: string]: any;
}

interface Node {
  id: string;
  type: string;
  name: string;
  category: string;
  x: string;
  y: string;
  g: string;
  z: string;
  credentials: Record<string, any>;
  _def: {
    defaults: Record<
      string,
      { value: string; type?: string; label?: string; required?: boolean }
    >;
    credentials: Record<
      string,
      {
        value: string;
        type?: "password" | "text";
        label?: string;
        required?: boolean;
      }
    >;
    category: string;
    color?: string;
    icon?: string;
    label?: ((this: Node) => string) | string;
    inputs?: number;
    outputs?: number;
    paletteLabel?: ((this: Node) => string) | string;
    labelStyle?: ((this: Node) => string) | string;
    inputLabels?: ((this: Node) => string) | string;
    outputLabels?: ((this: Node) => string) | string;
    align?: "left" | "right";
    button?: NodeButtonDefinition;
    onPaletteAdd?: (this: Node) => void;
    onPaletteRemove?: (this: Node) => void;
    form: NodeFormDefinition;
  };
  _newState?: Node;
  _app?: App | null;
  _?: (str: string) => string;
  [key: string]: any;
}

/**
 * Interface representing the button configuration for a Node.
 *
 * @interface NodeButtonDefinition
 * @property {string} toggle - Text to display when toggling the button.
 * @property {function(): void} onclick - Function to execute when the button is clicked.
 * @property {function(): boolean} [enabled] - Function that determines whether the button should be
 *   enabled. Returns true if the button should be enabled, false otherwise.
 * @property {function(): boolean} [visible] - Function that determines whether the button should be
 *   visible. Returns true if the button should be visible, false otherwise.
 */
interface NodeButtonDefinition {
  toggle: string;
  onclick: () => void;
  enabled?: () => boolean;
  visible?: () => boolean;
}

/**
 * Interface representing the form configuration for a Node.
 *
 * @interface NodeFormDefinition
 * @property {Component} [component] - Vue 3 component.
 * @property {boolean} [disableSaveButtonOnError] - When this property is true, the Save, or Update, buttons are disabled when the form has errors. It defaults to false.
 */
interface NodeFormDefinition {
  component: Component;
  disableSaveButtonOnError?: boolean;
}

/**
 * Interface representing the Node options used during registration
 *
 * @type NodeDefinition
 * @property {string} type - The unique identifier for this node type.
 * @property {string} category - The category this node belongs to in the palette.
 * @property {string} [color] - The color associated with this node, in hex format.
 * @property {string} [icon] - The icon to display for this node.
 * @property {(function(): string)|string} [label] - The label to display on the node. Can be a static string or a function returning a string.
 * @property {number} [inputs] - Number of input ports the node should have.
 * @property {number} [outputs] - Number of output ports the node should have.
 * @property {(function(): string)|string} [paletteLabel] - The label to show in the palette. Can be a static string or a function returning a string.
 * @property {(function(): string)|string} [labelStyle] - CSS style to apply to the node label. Can be a static string or a function returning a string.
 * @property {(function(): string)|string} [inputLabels] - Labels for the input ports. Can be a static string or a function returning a string.
 * @property {(function(): string)|string} [outputLabels] - Labels for the output ports. Can be a static string or a function returning a string.
 * @property {"left"|"right"} [align] - Alignment of the node content.
 * @property {NodeButtonDefinition} [button] - Configuration for a button on the node.
 * @property {function(): void} [onPaletteAdd] - Function called when the node is added to the palette.
 * @property {function(): void} [onPaletteRemove] - Function called when the node is removed from the palette.
 * @property {NodeFormDefinition} form - The form component to use for configuring the node.
 * @property {JSONSchemaType} [schema] - Schema definition for validation.
 */
interface NodeDefinition {
  category: string;
  color?: string;
  icon?: string;
  label?: ((this: Node) => string) | string;
  inputs?: number;
  outputs?: number;
  paletteLabel?: ((this: Node) => string) | string;
  labelStyle?: ((this: Node) => string) | string;
  inputLabels?: ((this: Node) => string) | string;
  outputLabels?: ((this: Node) => string) | string;
  align?: "left" | "right";
  button?: NodeButtonDefinition;
  onPaletteAdd?: (this: Node) => void;
  onPaletteRemove?: (this: Node) => void;
  form: NodeFormDefinition;
}

function createNodeRedVueApp(
  node: Node,
  form: NodeFormDefinition,
  validator: ValidateFunction | (() => boolean)
): App<Element> {
  const app = createApp(NodeRedVueApp, {
    node,
    validator,
    disableSaveButtonOnError: form.disableSaveButtonOnError,
  });

  app.component("NodeRedInput", NodeRedInput);
  app.component("NodeRedTypedInput", NodeRedTypedInput);
  app.component("NodeRedConfigInput", NodeRedConfigInput);
  app.component("NodeRedSelectInput", NodeRedSelectInput);
  app.component("NodeRedEditorInput", NodeRedEditorInput);
  app.component("NodeRedNodeForm", form.component);
  return app;
}

function mountApp(
  node: Node,
  form: NodeFormDefinition,
  validator: ValidateFunction | (() => boolean)
) {
  $("#app").empty();
  node._newState = cloneDeep(node);
  node._app = createNodeRedVueApp(node._newState, form, validator);
  node._app.mount("#app");
}

function unmountApp(node: Node) {
  if (node._app) {
    node._app.unmount();
    node._app = null;
  }
}

function getNodeState(node: Node): NodeState {
  const state: NodeState = {
    credentials: {},
  };
  Object.keys(node._def.defaults).forEach((prop) => {
    state[prop] = node[prop];
  });
  Object.keys(node._def.credentials).forEach((prop) => {
    state.credentials[prop] = node.credentials[prop];

    if (node._def.credentials[prop].type === "password") {
      state.credentials[`has_${prop}`] =
        node.credentials[`has_${prop}`] || false;
    }
  });

  return state;
}

function getChanges(
  o: Record<any, any>,
  n: Record<any, any>
): Record<string, any> {
  const changes: Record<string, any> = {};

  Object.keys(o).forEach((prop) => {
    const _o = o[prop];
    const _n = n[prop];

    if (typeof _o === "object") {
      const _changes = getChanges(_o, _n);
      if (Object.keys(_changes).length) {
        changes[prop] = _changes;
      }
    } else if (!isEqual(_o, _n)) {
      changes[prop] = _o;
    }
  });

  return changes;
}

function defineNode<T extends NodeDefinition>(options: T): T {
  return options;
}

/**
 * Prepares a node registration function using the provided base configuration.
 *
 * This is a higher-order function that returns a function which can be used
 * to register the node with a specific type at runtime.
 *
 * @param {Object} nodeOptions - The static configuration shared by all nodes of this kind
 * @param {string} [nodeOptions.category="undefined"] - The category this node belongs to in the palette
 * @param {string} [nodeOptions.color="#FFFFFF"] - The color associated with this node, in hex format
 * @param {string} [nodeOptions.icon] - The icon to display for this node
 * @param {(function(): string)|string} [nodeOptions.label] - The label to display on the node
 * @param {number} [nodeOptions.inputs=0] - Number of input ports the node should have
 * @param {number} [nodeOptions.outputs=0] - Number of output ports the node should have
 * @param {(function(): string)|string} [nodeOptions.paletteLabel] - The label to show in the palette
 * @param {(function(): string)|string} [nodeOptions.labelStyle] - CSS style to apply to the node label
 * @param {(function(): string)|string} [nodeOptions.inputLabels] - Labels for the input ports
 * @param {(function(): string)|string} [nodeOptions.outputLabels] - Labels for the output ports
 * @param {"left"|"right"} [nodeOptions.align="left"] - Alignment of the node content
 * @param {NodeButtonDefinition} [nodeOptions.button] - Configuration for a button on the node
 * @param {function(): void} [nodeOptions.onPaletteAdd] - Function called when the node is added to the palette
 * @param {function(): void} [nodeOptions.onPaletteRemove] - Function called when the node is removed from the palette
 * @param {Component} nodeOptions.form - The form component to use for configuring the node
 * @param {JSONSchemaType} [nodeOptions.schema] - Schema definition for validation
 *
 * @returns {function(type: string): Promise<void>} - A function that registers the node with the specified type
 */
async function registerType(
  type: string,
  options: NodeDefinition
): Promise<void> {
  try {
    const response = await fetch(`/nrg/nodes/${type}`);
    if (!response.ok) {
      throw new Error(
        `Error while fetching node config schema ${response.status}`
      );
    }

    const { schema }: { schema: JSONSchemaType<object> } =
      await response.json();

    const defaults = getDefaultsFromSchema(schema);
    if (defaults.credentials) delete defaults.credentials;
    const credentials = getCredentialsFromSchema(schema.properties.credentials);

    console.log("defaults", defaults);
    console.log("credentials", credentials);

    function oneditprepare(this: Node) {
      console.log("oneditprepare");
      console.log(this);
      const validator = validatorService.createValidator(schema);
      mountApp(this, options.form, validator);
    }
    function oneditsave(this: Node) {
      const node = this;
      unmountApp(node);

      const newState = getNodeState(node._newState!);
      const oldState = getNodeState(node);
      const changes = getChanges(oldState, newState);
      const changed = !!Object.keys(changes)?.length;
      if (!changed) return false;

      Object.keys(node._def.defaults).forEach((prop) => {
        if (node._def.defaults?.[prop]?.type) {
          const oldConfigNodeId: string = node[prop] as string;
          const newConfigNodeId: string = node._newState![prop] as string;
          if (oldConfigNodeId !== newConfigNodeId) {
            const oldConfigNode = RED.nodes.node(oldConfigNodeId);
            if (oldConfigNode && oldConfigNode._def.category === "config") {
              const parentNodeIndex = oldConfigNode.users.findIndex(
                (_node) => _node.id === node.id
              );
              if (parentNodeIndex !== -1) {
                oldConfigNode.users.splice(parentNodeIndex, 1);
              }
            }
          }
        }
      });

      Object.keys(node._def.defaults).forEach((prop) => {
        if (node._def.defaults?.[prop]?.type) {
          const newStateConfigNodeId = node._newState![prop];
          const newStateConfigNode = RED.nodes.node(newStateConfigNodeId);
          if (
            newStateConfigNode &&
            newStateConfigNode._def.category === "config"
          ) {
            const parentNodeIndex = newStateConfigNode.users.findIndex(
              (_node) => _node.id === node.id
            );
            if (parentNodeIndex === -1) {
              newStateConfigNode.users.push(node);
            }
          }
        }
      });

      merge(node, newState);

      return {
        changed,
        history: [
          {
            t: "edit",
            node,
            changes,
            links: [],
            dirty: RED.nodes.dirty(),
            changed,
          },
        ],
      };
    }
    function oneditcancel(this: Node) {
      unmountApp(this);
    }
    function oneditdelete(this: Node) {
      unmountApp(this);
    }

    if (options.category === "config") {
      RED.nodes.registerType(type, {
        type,
        defaults,
        credentials,
        category: options.category,
        label:
          options.label ||
          function () {
            return this.name;
          },
        oneditprepare,
        oneditsave,
        oneditcancel,
        oneditdelete,
      });
    } else {
      RED.nodes.registerType(type, {
        type,
        defaults,
        credentials,
        label:
          options.label ||
          function () {
            return this.name;
          },
        category: options.category,
        color: options.color || "#FFFFFF",
        icon: options.icon,
        inputs: options.inputs || 0,
        outputs: options.outputs || 0,
        paletteLabel: options.paletteLabel,
        labelStyle: options.labelStyle,
        inputLabels: options.inputLabels,
        outputLabels: options.outputLabels,
        align: options.align || "left",
        button: options.button,
        oneditprepare,
        oneditsave,
        oneditcancel,
        oneditdelete,
        onPaletteAdd: options.onPaletteAdd,
        onPaletteRemove: options.onPaletteRemove,
      });
    }
  } catch (error) {
    console.error(`Error fetching node type ${type}:`, error);
    throw error;
  }
}

export {
  defineNode,
  registerType,
  NodeDefinition,
  NodeButtonDefinition,
  NodeFormDefinition,
  Node,
};
