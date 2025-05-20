# node-red-vue-template

Build Node-RED nodes using:

- Vue 3
- JSON Schemas (V7 draft)
- Typescript
- ESM module system

![Image](https://github.com/user-attachments/assets/683d4377-371a-4f2a-8750-f93e0eb6649f)

### Dev Environment

| Dependency | Version  |
| ---------- | -------- |
| node       | v18.18.0 |
| node-red   | v4.0.9   |
| pnpm       | v10.11.0 |

### How to build

```bash
pnpm install
pnpm build
```

### How to test

After building these nodes, install the `./dist` folder to your Node-RED instance:

```bash
cd ~/.node-red
npm install $PACKAGE_PATH/dist
```

### Class Diagram

```mermaid
classDiagram
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
  +error(logMessage: string, msg: any): void
  +debug(msg: any): void
  +trace(msg: any): void
  +log(msg: any): void
  +warn(msg: any): void
}

class IONode {
  <<abstract>>
  +wires: string[][]
  +x: number
  +y: number
  +constructor(configs: TConfigs)
  +onInput(msg, send, done): void | Promise<void>
  +onClose(removed, done): void | Promise<void>
  +close(removed: boolean): Promise<void>
  +context(): Context
  +emit(event: string, ...args: any[]): void
  +on(event: string, callback: (...args: any[]) => void): void
  +receive(msg: TInputMessage): void
  +removeAllListeners(name: string): void
  +removeListener(name: string): void
  +send(msg: TOutputMessage): void
  +updateWires(wires: string[][]): void
  +metric(eventName: string, msg: Message, metricValue: number): boolean | void
  +status(status: object | string): void
  -setupEventHandlers()
}

class ConfigNode {
  <<abstract>>
  +users: string[]
  +constructor(configs: TConfigs)
}

IONode --|> Node
ConfigNode --|> Node
```
