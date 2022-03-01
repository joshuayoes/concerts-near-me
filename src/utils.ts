import fs from "fs/promises";
import path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

export const MOCK_DIR = path.join(__dirname, "__tests__", "__mocks__");

export const ROOT_DIR = path.join(__dirname, "../");

export const getLocalHtml = async (fileName: string) => {
  const html = await fs.readFile(`${MOCK_DIR}/${fileName}`, "utf8");
  return html;
};

export const argvFactory = <Options extends Record<string, yargs.Options>>(
  options: Options,
) => yargs(hideBin(process.argv)).options(options).parseSync();

export const toAsterisks = (secret: string) => "*".repeat(secret.length);
