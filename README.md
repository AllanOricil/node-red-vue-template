# node-red-vue-inputs-experiments

Build Node-RED nodes using:

- Vue 3
- JSON Schemas (V7 draft)
- Typescript
- ESM module system

![Image](https://github.com/user-attachments/assets/683d4377-371a-4f2a-8750-f93e0eb6649f)

### How to test

These nodes are already built to simplify testing. Just clone the repo and install it to your Node-RED instance.

```bash
cd ~/.node-red
npm install $PATH_WHERE_YOU_CLONED_THIS_REPO/dist
```

### Class Diagram

```mermaid
classDiagram

%% Base class
class Node {
  <<abstract>>
  +id: string
  +type: string
  +name: string
  +z: string
  +g: string
  +configs: TConfigs
  +credentials: TCredentials
  +constructor(configs: TConfigs)
  +static init(): void | Promise<void>
  +static getNode<T>(id: string): T | undefined
}

%% Inheriting class: IONode
class IONode {
  <<abstract>>
  +wires: string[][]
  +x: number
  +y: number
  +constructor(configs: TConfigs)
  +onInput(msg, send, done): void | Promise<void>
  +onClose(removed, done): void | Promise<void>
  -setupEventHandlers()
}

%% Inheriting class: ConfigNode
class ConfigNode {
  <<abstract>>
  +users: string[]
  +constructor(configs: TConfigs)
}

%% Relationships
IONode --|> Node
ConfigNode --|> Node
```
