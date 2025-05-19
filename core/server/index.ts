import { Type } from "@sinclair/typebox";
import { Request, Response } from "express";
import { getCredentialsFromSchema } from "../utils";
import { Node, IONode, ConfigNode } from "./nodes";

// TODO: define RED type
/**
 * Registers a custom node built with the nrg framework
 * @static
 * @async
 * @param {object} RED - The Node-RED runtime API object
 * @param {(Node | IONode | ConfigNode )} NodeClass - A node class extending Node or ConfigNode
 * @returns {Promise<void>} A promise that resolves when the node type registration and setup are complete. It might wait for the `NodeClass.init()` promise if one is returned.
 * @throws {Error} If NodeClass does not extend `Node`
 * @throws {Error} If type is note defined
 */
export async function registerType(
  RED: any,
  type: string,
  NodeClass:
    | typeof Node<any, any>
    | typeof ConfigNode<any, any>
    | typeof IONode<any, any, any, any>,
) {
  if (!(NodeClass.prototype instanceof Node)) {
    throw new Error(
      `${NodeClass.name} must extend IONode or ConfigNode classes`,
    );
  }

  if (!type) {
    throw new Error(`type must be provided when registering the node`);
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
  if (IONode.RED === undefined) {
    Object.defineProperty(IONode, "RED", {
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

  RED.nodes.registerType(type, NodeClass, {
    credentials: NodeClass.validations.credentials
      ? getCredentialsFromSchema(NodeClass.validations.credentials)
      : {},
  });

  RED.httpAdmin.get(`/nrg/nodes/${type}`, (_: Request, res: Response) => {
    if (NodeClass.validations) {
      const validationConfig = NodeClass.validations;

      const configsProperties = validationConfig.configs.properties
        ? validationConfig.configs.properties
        : {};

      const credentialsProperties = validationConfig.credentials?.properties
        ? validationConfig.credentials.properties
        : {};

      const nodeProperties = {
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
