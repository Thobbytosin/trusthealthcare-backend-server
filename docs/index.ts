import authSwagger from "./auth.swagger";
import userSwagger from "./user.swagger";

const paths = { ...userSwagger, ...authSwagger };

export default paths;
