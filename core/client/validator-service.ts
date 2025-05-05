import Ajv, { Options } from "ajv";
import addFormats from "ajv-formats";
import addErrors from "ajv-errors";

class ValidatorService {
  private ajv: Ajv;

  constructor(options?: Options) {
    this.ajv = new Ajv({
      allErrors: true,
      useDefaults: "empty",
      ...options,
    });

    // NOTE: this plugin enables users to use formats keyword
    addFormats(this.ajv);

    // NOTE; this plugin enables users to declare custom error messages
    addErrors(this.ajv);
  }

  createValidator(schema: AnySchema) {
    if (!schema) {
      return () => true;
    }
    return this.ajv.compile(schema);
  }

  resetCache() {
    this.ajv.cache.clear();
  }
}

export { ValidatorService };
