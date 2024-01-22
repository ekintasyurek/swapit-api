

import dotenv from "dotenv";

dotenv.config();

const MONGO_OPTIONS = {
  socketTimeoutMS: 30000,
  autoIndex: false,
  retryWrites: false,
};

// DECLARE ALL VARIABLES
const MONGO_DB_USER = process.env.MONGO_DB_USER || "";
const NODE_ENV = process.env.NODE_ENV || "";
const MONGO_DB_PASSWORD = process.env.MONGO_DB_PASSWORD || "";
const MONGO_URL = `mongodb+srv://${MONGO_DB_USER}:${MONGO_DB_PASSWORD}`;
// const SERVER_PORT = process.env.PORT ? Number(process.env.PORT) : 1337;
const SERVER_PORT =
  process.env.NODE_ENV === "test"
    ? 0
    : process.env.PORT
    ? Number(process.env.PORT)
    : 1337;
const MONGO_URL_LOCAL = `mongodb+srv://${MONGO_DB_USER}:${MONGO_DB_PASSWORD}`;
const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME || "localhost";

//CREATE CONFIG OBJECT
const config = {
  mongo: {
    url: MONGO_URL,
    options: MONGO_OPTIONS,
  },
  server: {
    port: SERVER_PORT,
    hostname: SERVER_HOSTNAME,
  },
};

//CHECK FOR ENVIRONMENT
if (NODE_ENV === "production") {
  config.mongo.url = MONGO_URL;
  config.server.port = SERVER_PORT;
} else if (NODE_ENV === "local") {
  config.mongo.url = MONGO_URL_LOCAL;
  config.server.port = SERVER_PORT;
}

//EXPORT
export default config;
