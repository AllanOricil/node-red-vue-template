import { createApp, Component, App, defineComponent } from "vue";
import { cloneDeep, isEqual, merge } from "es-toolkit";
import $ from "jquery";
import Ajv from "ajv";

import NodeRedVueApp from "./App.vue";
import NodeRedInput from "./components/NodeRedInput.vue";
import NodeRedTypedInput from "./components/NodeRedTypedInput.vue";
import NodeRedConfigInput from "./components/NodeRedConfigInput.vue";
import NodeRedSelectInput from "./components/NodeRedSelectInput.vue";
import NodeRedEditorInput from "./components/NodeRedEditorInput.vue";

function createNodeRedVueApp(
  node: any,
  form: Component,
  validator: Function
): App<Element> {
  const app = createApp(NodeRedVueApp, {
    node,
    validator,
  });

  app.component("NodeRedInput", NodeRedInput);
  app.component("NodeRedTypedInput", NodeRedTypedInput);
  app.component("NodeRedConfigInput", NodeRedConfigInput);
  app.component("NodeRedSelectInput", NodeRedSelectInput);
  app.component("NodeRedEditorInput", NodeRedEditorInput);
  app.component("NodeRedNodeForm", form);
  app.config.devtools = true;
  return app;
}

function mountApp(node: any, form: Component, schema: any) {
  $("#app").empty();
  const validator = createValidator(schema);
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

function getNodeState(node: any) {
  const state = {
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

function getChanges(o: Record<any, any>, n: Record<any, any>) {
  const changes = {};

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

function createValidator(schema: any) {
  const ajv = new Ajv({
    allErrors: true,
    useDefaults: "empty",
  });

  return ajv.compile(schema);
}

function registerType({
  type,
  category,
  color,
  icon,
  label,
  inputs,
  outputs,
  paletteLabel,
  labelStyle,
  inputLabels,
  outputLabels,
  align,
  button,
  onPaletteAdd,
  onPaletteRemove,
  form,
  schema,
}) {
  $.getJSON(`/nrg/nodes/${type}`, function ({ defaults, credentials }) {
    RED.nodes.registerType(type, {
      defaults,
      credentials,
      type,
      category,
      color,
      icon,
      inputs,
      outputs,
      paletteLabel,
      labelStyle,
      inputLabels,
      outputLabels,
      align,
      button,
      label: function () {
        // TODO: add better defaults with i18n
        return this.name;
      },
      oneditprepare: function () {
        const node = this;
        mountApp(node, form, schema);
      },
      oneditsave: function () {
        const node = this;

        console.log("node");
        console.log(node);
        unmountApp(node);

        const newState = getNodeState(node._newState);
        const oldState = getNodeState(node);
        const changes = getChanges(oldState, newState);
        const changed = !!Object.keys(changes)?.length;
        if (!changed) {
          return false;
        }

        // NOTE: if 2 different node props have the same config node value, there will be only one entry in the config node users for our node. DEFAULT NODE-RED BEHAVIOUR!
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
      onpaletteadd: onPaletteAdd,
      onpaltteremove: onPaletteRemove,
    });
  });
}

export { registerType };
