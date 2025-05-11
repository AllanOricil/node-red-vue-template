import camelCase from "camelcase";
import { merge } from "es-toolkit";
import { BaseNode, BaseNodeMetadata } from "./base-node";
import { Node } from "./node";
import { ConfigNode } from "./config-node";
import { getDefaultsFromSchema, getCredentialsFromSchema } from "../utils";
import { Type } from "@sinclair/typebox";
import { validatorService } from "./validator";
import { AnySchemaObject } from "ajv";
import { Request, Response } from "express";

interface BaseNodeConstructor {
  new (...args: any[]): BaseNode<any, any>;
  RED?: any;
  type?: string;
  init?(): void | Promise<void>;
  onInput?(): void | Promise<void>;
  onClose?(): void | Promise<void>;
  __nodeProperties__?: BaseNodeMetadata;
}

// TODO: define RED type
/**
 * Registers a custom node built with the nrg framework
 * @static
 * @async
 * @param {object} RED - The Node-RED runtime API object
 * @param {(Node)} NodeClass - A node class extending Node or ConfigNode
 * @returns {Promise<void>} A promise that resolves when the node type registration and setup are complete. It might wait for the `NodeClass.init()` promise if one is returned.
 * @throws {Error} If NodeClass does not extend `Node`
 * @throws {Error} If type is note defined
 */
export async function registerType(
  RED: any,
  type: string,
  NodeClass: BaseNodeConstructor
) {
  if (!(NodeClass.prototype instanceof BaseNode)) {
    throw new Error(`${NodeClass.name} must extend Node | ConfigNode class`);
  }

  if (!type) {
    throw new Error(`type must be provided when registering the node`);
  }

  // TODO: move this somewhere else
  if (BaseNode.RED === undefined) {
    Object.defineProperty(BaseNode, "RED", {
      value: RED,
      writable: false,
      configurable: false,
      enumerable: false,
    });
  }

  // TODO: move this somewhere else
  if (Node.RED === undefined) {
    Object.defineProperty(Node, "RED", {
      value: RED,
      writable: false,
      configurable: false,
      enumerable: false,
    });
  }

  // TODO: move this somewhere else
  if (ConfigNode.RED === undefined) {
    Object.defineProperty(ConfigNode, "RED", {
      value: RED,
      writable: false,
      configurable: false,
      enumerable: false,
    });
  }

  if (NodeClass.RED === undefined) {
    Object.defineProperty(NodeClass, "RED", {
      value: RED,
      writable: false,
      configurable: false,
      enumerable: false,
    });
  }

  if (NodeClass.type === undefined) {
    Object.defineProperty(NodeClass, "type", {
      value: type,
      writable: false,
      configurable: false,
      enumerable: false,
    });
  }

  console.log("NodeClass");
  console.log(NodeClass);
  if (typeof NodeClass.init === "function") {
    const result = NodeClass.init();

    if (result instanceof Promise) {
      await result;
    }
  }

  function defaults() {
    const schema = NodeClass.__nodeProperties__?.validation?.configs;
    console.log("DEFAULTS", schema);
    return schema ? getDefaultsFromSchema(schema) : {};
  }

  function credentials() {
    const schema = NodeClass.__nodeProperties__?.validation?.credentials;
    return schema ? getCredentialsFromSchema(schema) : {};
  }

  RED.nodes.registerType(type, NodeClass, {
    credentials: credentials(),
  });

  function hasProperties(schema: any): schema is { properties: object } {
    return schema && typeof schema === "object" && "properties" in schema;
  }

  RED.httpAdmin.get(`/nrg/nodes/${type}`, (req: Request, res: Response) => {
    if (NodeClass.__nodeProperties__?.validation) {
      const validationConfig = NodeClass.__nodeProperties__.validation;

      const configsProperties = hasProperties(validationConfig.configs)
        ? validationConfig.configs.properties
        : {};

      const credentialsProperties = hasProperties(validationConfig.credentials)
        ? validationConfig.credentials.properties
        : {};

      const nodeProperties = {
        ...NodeClass.__nodeProperties__,
        schema: Type.Object({
          ...configsProperties,
          credentials: Type.Object({
            ...credentialsProperties,
          }),
        }),
      };

      res.json(nodeProperties);
    } else {
      res.json({
        message:
          "Node was not configured with schemas to validate configs and credentials",
      });
    }
  });
}
