import * as core from "@actions/core";
import { context } from "@actions/github";
import { createHandler } from "./handler.js";
import VError from "verror";
import { getInputs, stringInput } from "@infra-blocks/github";
import { parseVersion } from "./version.js";

async function main() {
  core.debug(`received env: ${JSON.stringify(process.env, null, 2)}`);
  core.debug(`received context: ${JSON.stringify(context, null, 2)}`);
  const inputs = getInputs({
    version: stringInput(),
  });
  const handler = createHandler({
    context,
    config: {
      // TODO: https://github.com/infrastructure-blocks/ts-github/issues/7 parse the version against choices in the inputs.
      version: parseVersion(inputs.version),
    },
  });
  const outputs = await handler.handle();
  for (const [key, value] of Object.entries(outputs)) {
    core.debug(`setting output ${key}=${value}`);
    core.setOutput(key, value);
  }
}

main().catch((err: Error) => core.setFailed(VError.fullStack(err)));
