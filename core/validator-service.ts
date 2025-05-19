import Ajv, {
  Options,
  ErrorObject,
  ErrorsTextOptions,
  AnySchemaObject,
} from "ajv";
import addFormats from "ajv-formats";
import addErrors from "ajv-errors";

class ValidatorService {
  private readonly ajv: Ajv;

  constructor(options?: Options) {
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

  createValidator(schema: AnySchemaObject) {
    return this.ajv.compile(schema);
  }

  errors(
    errors?: ErrorObject[] | null | undefined,
    options?: ErrorsTextOptions,
  ) {
    return this.ajv.errorsText(errors, options);
  }
}

export { ValidatorService };
