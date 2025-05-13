import { createApp, Component, App, defineComponent } from "vue";
import { cloneDeep, isEqual, merge } from "es-toolkit";
import { AnySchema, ValidateFunction } from "ajv";
import { getDefaultsFromSchema, getCredentialsFromSchema } from "../utils";
import { validatorService } from "./validator";
import NodeRedVueApp from "./App.vue";
import NodeRedInput from "./components/NodeRedInput.vue";
import NodeRedTypedInput from "./components/NodeRedTypedInput.vue";
import NodeRedConfigInput from "./components/NodeRedConfigInput.vue";
import NodeRedSelectInput from "./components/NodeRedSelectInput.vue";
import NodeRedEditorInput from "./components/NodeRedEditorInput.vue";

function createNodeRedVueApp(
  node: any,
  form: INodeForm,
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
  node: any,
  form: INodeForm,
  validator: ValidateFunction | (() => boolean)
) {
  $("#app").empty();
  node._newState = cloneDeep(node);
  node._app = createNodeRedVueApp(node._newState, form, validator);
  node._app.mount("#app");
}

function unmountApp(node: any) {
  if (node._app) {
    node._app.unmount();
    node._app = null;
  }
}

interface ICredentials {
  [key: string]: any;
}

interface INodeState {
  credentials: ICredentials;
  [key: string]: any;
}

function getNodeState(node: any): INodeState {
  const state: INodeState = {
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

/**
 * Interface representing the button configuration for a Node.
 *
 * @interface INodeButton
 * @property {string} toggle - Text to display when toggling the button.
 * @property {function(): void} onclick - Function to execute when the button is clicked.
 * @property {function(): boolean} [enabled] - Function that determines whether the button should be
 *   enabled. Returns true if the button should be enabled, false otherwise.
 * @property {function(): boolean} [visible] - Function that determines whether the button should be
 *   visible. Returns true if the button should be visible, false otherwise.
 */
interface INodeButton {
  toggle: string;
  onclick: () => void;
  enabled?: () => boolean;
  visible?: () => boolean;
}

/**
 * Interface representing the form configuration for a Node.
 *
 * @interface INodeForm
 * @property {Component} [component] - Vue 3 component.
 * @property {boolean} [disableSaveButtonOnError] - When this property is true, the Save, or Update, buttons are disabled when the form has errors. It defaults to false.
 */
interface INodeForm {
  component: Component;
  disableSaveButtonOnError?: boolean;
}

/**
 * Interface representing a Node configuration.
 *
 * @interface INode
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
 * @property {INodeButton} [button] - Configuration for a button on the node.
 * @property {function(): void} [onPaletteAdd] - Function called when the node is added to the palette.
 * @property {function(): void} [onPaletteRemove] - Function called when the node is removed from the palette.
 * @property {INodeForm} form - The form component to use for configuring the node.
 * @property {AnySchema} [schema] - Schema definition for validation.
 */
interface INode {
  type: string;
  category: string;
  color?: string;
  icon?: string;
  label?: (() => string) | string;
  inputs?: number;
  outputs?: number;
  paletteLabel?: (() => string) | string;
  labelStyle?: (() => string) | string;
  inputLabels?: (() => string) | string;
  outputLabels?: (() => string) | string;
  align?: "left" | "right";
  button?: INodeButton;
  onPaletteAdd?: () => void;
  onPaletteRemove?: () => void;
  form: INodeForm;
}

function defineNode<T extends Omit<INode, "type">>(options: T): T {
  return options;
}

/**
 * Prepares a node registration function using the provided base configuration.
 *
 * This is a higher-order function that returns a function which can be used
 * to register the node with a specific type at runtime.
 *
 * @param {Object} nodeConfig - The static configuration shared by all nodes of this kind
 * @param {string} [nodeConfig.category="undefined"] - The category this node belongs to in the palette
 * @param {string} [nodeConfig.color="#FFFFFF"] - The color associated with this node, in hex format
 * @param {string} [nodeConfig.icon] - The icon to display for this node
 * @param {(function(): string)|string} [nodeConfig.label] - The label to display on the node
 * @param {number} [nodeConfig.inputs=0] - Number of input ports the node should have
 * @param {number} [nodeConfig.outputs=0] - Number of output ports the node should have
 * @param {(function(): string)|string} [nodeConfig.paletteLabel] - The label to show in the palette
 * @param {(function(): string)|string} [nodeConfig.labelStyle] - CSS style to apply to the node label
 * @param {(function(): string)|string} [nodeConfig.inputLabels] - Labels for the input ports
 * @param {(function(): string)|string} [nodeConfig.outputLabels] - Labels for the output ports
 * @param {"left"|"right"} [nodeConfig.align="left"] - Alignment of the node content
 * @param {INodeButton} [nodeConfig.button] - Configuration for a button on the node
 * @param {function(): void} [nodeConfig.onPaletteAdd] - Function called when the node is added to the palette
 * @param {function(): void} [nodeConfig.onPaletteRemove] - Function called when the node is removed from the palette
 * @param {Component} nodeConfig.form - The form component to use for configuring the node
 * @param {AnySchema} [nodeConfig.schema] - Schema definition for validation
 *
 * @returns {function(type: string): Promise<void>} - A function that registers the node with the specified type
 */
async function registerType(
  type: string,
  options: Omit<INode, "type">
): Promise<void> {
  try {
    const response = await fetch(`/nrg/nodes/${type}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { schema } = await response.json();

    const defaults = getDefaultsFromSchema(schema);
    if (defaults.credentials) delete defaults.credentials;
    const credentials = getCredentialsFromSchema(schema.properties.credentials);

    console.log("defaults", defaults);
    console.log("credentials", credentials);

    RED.nodes.registerType(type, {
      ...options,
      defaults,
      credentials,
      type,
      label: function () {
        return this.name;
      },
      oneditprepare: function () {
        console.log("oneditprepare");
        console.log(this);
        const validator = validatorService.createValidator(schema);
        mountApp(this, options.form, validator);
      },
      oneditsave: function () {
        const node = this;
        unmountApp(node);

        const newState = getNodeState(node._newState);
        const oldState = getNodeState(node);
        const changes = getChanges(oldState, newState);
        const changed = !!Object.keys(changes)?.length;
        if (!changed) return false;

        Object.keys(node._def.defaults).forEach((prop) => {
          if (node._def.defaults?.[prop]?.type) {
            const oldConfigNodeId = node[prop];
            const newConfigNodeId = node._newState[prop];
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
            const newStateConfigNodeId = node._newState[prop];
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
      },
      oneditcancel: function () {
        unmountApp(this);
      },
      oneditdelete: function () {
        unmountApp(this);
      },
      onpaletteadd: options.onPaletteAdd,
      onpaltteremove: options.onPaletteRemove,
    });
  } catch (error) {
    console.error(`Error fetching node type ${type}:`, error);
    throw error;
  }
}

export { defineNode, registerType, INode, INodeButton };
