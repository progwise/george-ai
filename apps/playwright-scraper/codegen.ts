import { CodegenConfig } from "@graphql-codegen/cli";
import dotenv from "dotenv";

dotenv.config();
const config: CodegenConfig = {
  schema: {
    "http://localhost:1337/graphql": {
      headers: {
        Authorization: `Bearer ${process.env.STRAPI_API_KEY}`,
      },
    },
  },
  // documents: "./src/gql/mutations/*.graphql",
  documents: ["./src/gql/mutations/*.graphql", "src/**/*.ts"],
  generates: {
    "./src/gql2/": {
      preset: "client",
    },
    "./src/gql/graphql.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-graphql-request",
      ],
    },
  },
};

export default config;
