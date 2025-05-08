import Ajv, { Options, ErrorObject, ErrorsTextOptions } from "ajv";
import addFormats from "ajv-formats";
import addErrors from "ajv-errors";
import TypedInputSchema from "./schemas/typed-input";
import MessageSchema from "./schemas/message";

class ValidatorService {
  ajv: Ajv;

  constructor(options?: Options) {
    // console.log("INSIDE CONSTRUCTOR OF VALIDATOR SERVICE");
    this.ajv = new Ajv({
      allErrors: true,
      useDefaults: "empty",
      verbose: true,
      validateFormats: true,
      strict: true,
      coerceTypes: true,
      ...options,
    });

    console.log(this.ajv.schemas);

    // NOTE: this plugin enables users to use formats keyword
    addFormats(this.ajv);

    // NOTE; this plugin enables users to declare custom error messages
    addErrors(this.ajv);

    this.ajv.addKeyword("nodeType");
  }

  createValidator(schema: AnySchema) {
    // console.log("INSIDE CREATEVALIDATOR");
    // console.log(this.ajv.schemas);
    return this.ajv.compile(schema);
  }

  resetCache() {
    this.ajv.cache.clear();
  }

  errors(
    errors?: ErrorObject[] | null | undefined,
    options?: ErrorsTextOptions
  ) {
    return this.ajv.errorsText(errors, options);
  }
}

export { ValidatorService };
