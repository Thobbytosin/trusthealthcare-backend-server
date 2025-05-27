import swaggerConfig from "./swagger.config";
import paths from "../docs";

const swaggerDocument = {
  ...swaggerConfig,
  paths,
};

export default swaggerDocument;
