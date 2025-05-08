import { ValidatorService } from "../validator-service";
// NOTE: singleton to use ajv caching features
const validatorService = new ValidatorService();

export { validatorService };
