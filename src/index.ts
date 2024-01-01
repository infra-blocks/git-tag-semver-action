import * as core from "@actions/core";
import { context } from "@actions/github";
import { createHandler } from "./handler.js";
import VError from "verror";
import { booleanInput, getInputs, stringInput } from "@infra-blocks/github";
import { GitTagVersion } from "./version.js";

async function main() {
  core.debug(`received env: ${JSON.stringify(process.env, null, 2)}`);
  core.debug(`received context: ${JSON.stringify(context, null, 2)}`);
  const inputs = getInputs({
    version: stringInput<GitTagVersion>({
      choices: ["patch", "minor", "major"],
    }),
    "dry-run": booleanInput({ default: false }),
  });
  const handler = createHandler({
    config: {
      version: inputs.version,
      dryRun: inputs["dry-run"],
    },
  });
  const outputs = await handler.handle();
  for (const [key, value] of Object.entries(outputs)) {
    core.debug(`setting output ${key}=${value}`);
    core.setOutput(key, value);
  }
}

main().catch((err: Error) => core.setFailed(VError.fullStack(err)));
