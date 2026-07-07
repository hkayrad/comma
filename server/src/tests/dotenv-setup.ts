import dotenv from "dotenv";
import path from "path";

const result = dotenv.config({ path: path.resolve(__dirname, "../../.env.test") });
if (result.error) {
  dotenv.config({ path: path.resolve(__dirname, "../../.env") });
}
