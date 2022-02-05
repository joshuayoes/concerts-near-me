import fs from "fs/promises";
import path from "path";

export const MOCK_DIR = path.join(__dirname, "__tests__", "__mocks__");

export const getLocalHtml = async (fileName: string) => {
  const html = await fs.readFile(`${MOCK_DIR}/${fileName}`, "utf8");
  return html;
};
