import fs from "fs/promises";
import { getHtml } from "../scrape";
import { MOCK_DIR } from "../utils";

(async () => {
  const [, , venueName, url] = process.argv;

  const isString = (value: unknown): value is string =>
    typeof value === "string";

  if (!isString(venueName)) {
    console.error("Please provide a camel case venue name");
    process.exit(1);
  }
  if (!isString(url)) {
    console.error("Please provide a URL to scrape");
    process.exit(1);
  }

  const mockFilePath = `${MOCK_DIR}/${venueName}.html`;
  const html = await getHtml(url);

  await fs.writeFile(mockFilePath, html);
})();
