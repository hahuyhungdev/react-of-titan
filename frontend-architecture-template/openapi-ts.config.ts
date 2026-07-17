import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "openapi.json",
  output: "src/shared/api/generated",
  plugins: [
    "@hey-api/typescript",
    "@hey-api/client-fetch",
    "msw",
  ],
});
