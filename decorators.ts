function Secret(options: { type?: string; required?: boolean }) {
  return function (target: any, key: string) {
    if (!target.constructor.secrets) {
      target.constructor.secrets = [];
    }

    target.constructor.secrets.push({
      key,
      type: options.type,
      required: options.required || false,
      default: undefined,
    });
  };
}

function isTypedInput(type?: string) {
  return type
    ? [
        "msg",
        "flow",
        "global",
        "str",
        "num",
        "bool",
        "env",
        "json",
        "jsonata",
      ].includes(type)
    : false;
}

function Config(options: {
  value: any;
  type?: string;
  required?: boolean;
  validate?: (value: any) => boolean;
}) {
  return function (target: any, key: string) {
    if (!target.constructor.configProperties) {
      target.constructor.configProperties = [];
    }

    const config = {
      key,
      value: options.value,
      type: options.type,
      required: options.required || false,
      validate: options.validate,
      default: undefined,
    };

    if (isTypedInput(options.type)) {
      config.value = {
        value: options.value,
        type: options.type,
      };
    }

    target.constructor.configProperties.push(config);

    // Define the property on the instance, not the prototype
    Object.defineProperty(target, key, {
      get() {
        return this[`__${key}`];
      },
      set(value) {
        this[`__${key}`] = value;
        const config = this.constructor.configProperties.find(
          (prop: any) => prop.key === key
        );
        if (config && config.default === undefined) {
          config.default = value; // Capture the default from instance
        }
      },
      enumerable: true,
      configurable: true,
    });
  };
}

type EditorOptions = {
  category: string;
  color: string;
  inputs: number;
  outputs: number;
  icon: string;
};

function Editor(options: EditorOptions) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
      static editorConfig = options;
    };
  };
}

export { Config, Secret, Editor, isTypedInput };
