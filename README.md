<p>
<a href="https://www.npmjs.com/package/node-red-vue-template" style="margin-right: 10px;"><img alt="NPM Version" src="https://img.shields.io/npm/v/node-red-vue-template"></a>
<a href="https://github.com/AllanOricil/node-red-vue-template/actions/workflows/ci.yaml"><img src="https://github.com/AllanOricil/node-red-vue-template/actions/workflows/ci.yaml/badge.svg?branch=main" alt="build status"/></a>
</p>

# node-red-vue-template

> [!IMPORTANT]
> The [nrg-cli](https://github.com/AllanOricil/nrg-cli) v3 is going to replace the build script in this repo once this template is fully functional.

Build Node-RED nodes using:

- Vue 3
- JSON Schemas (V7 draft)
- Typescript
- ESM module system

![Image](https://github.com/user-attachments/assets/683d4377-371a-4f2a-8750-f93e0eb6649f)

## 💻 Dev Environment

| Dependency | Version  |
| ---------- | -------- |
| node       | v18.18.0 |
| node-red   | v4.0.9   |
| pnpm       | v10.11.0 |

## 📖 Guides

### 📚 How to build

```bash
pnpm install
pnpm build
```

### 📚 How to test

After building these nodes, install the `./dist` folder to your Node-RED instance:

```bash
cd ~/.node-red
npm install $PACKAGE_PATH/dist
```

## 🏛️ Architecture

### Why ajv + typebox instead of zod?

Ajv is much faster than zod for types and data validations.

https://codetain.com/blog/benchmark-of-node-js-validators/#:~:text=Ajv%20turned%20to%20be%20the,2%20times%20faster%20than%20zod.

### Folder Structure

```bash
.
├── client/
│   ├── assets/
│   │   └── image.png
│   ├── components/
│   │   └── node-type-form.ue
│   ├── nodes/
│   │   └── node-type.ts
│   ├── index.ts
│   └── tsconfig.json
├── examples/
│   └── flow.json
├── icons/
│   └── icon.png
├── locales/
│   ├── docs/
│   │   └── node-type/
│   │       ├── en-US.html
│   │       └── pt-BR.md
│   └── labels/
│       └── node-type/
│           ├── en-US.json
│           └── pt-BR.json
├── public/
│   └── image.png
├── schemas/
│   └── node-type.ts
├── server/
│   ├── nodes/
│   │   └── node-type.ts
│   ├── index.ts
│   └── tsconfig.json
├── package.json
└── tsconfig.json
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
  +configs: TConfigs
  +credentials: TCredentials
  +constructor(configs: TConfigs)
  +close(removed: boolean): Promise<void>
  +on(event: string, callback: (...args: any[]) => void): void
  +onClose(removed, done): void | Promise<void>
  +static init(): void | Promise<void>
  +static getNode<T>(id: string): T | undefined
  +error(logMessage: string, msg: any): void
  +debug(msg: any): void
  +trace(msg: any): void
  +log(msg: any): void
  +warn(msg: any): void
  - registerOnCloseEventHandler(): void
}

class IONode {
  <<abstract>>
  +wires: string[][]
  +x: number
  +y: number
  +g: string
  +constructor(configs: TConfigs)
  *onInput(msg, send, done): void | Promise<void>*
  +context(): Context
  +emit(event: string, ...args: any[]): void
  +receive(msg: TInputMessage): void
  +removeAllListeners(name: string): void
  +removeListener(name: string): void
  +send(msg: TOutputMessage): void
  +updateWires(wires: string[][]): void
  +metric(eventName: string, msg: Message, metricValue: number): boolean | void
  +status(status: object | string): void
  -registerOnInputEventHandler() : void
}

class ConfigNode {
  <<abstract>>
  +constructor(configs: TConfigs)
}

IONode --|> Node
ConfigNode --|> Node
```

## 🤝 Contributing

I welcome contributions! If you'd like to help improve this template, feel free to open issues or submit pull requests. Your feedback is appreciated.

## 📜 License

This project is licensed under the [MIT License](https://github.com/AllanOricil/node-red-vue-template/blob/main/LICENSE).

## 💖 Become a Sponsor

If this template has made your life easier, consider supporting its development by clicking the button below.

<a href="https://www.buymeacoffee.com/allanoricil" target="_blank">
  <img
      src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
      alt="Buy Me A Coffee"
      style="width: 217px;" />
</a>
