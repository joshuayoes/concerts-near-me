import fs from "fs/promises";
import { getHtml } from "../scrape";
import { MOCK_DIR } from "../utils";

(async () => {
  const [, , scrapperName, url] = process.argv;

  const isString = (value: unknown): value is string =>
    typeof value === "string";

  if (!isString(scrapperName)) {
    console.error("Please provide a scrapper name");
    process.exit(1);
  }
  if (!isString(url)) {
    console.error("Please provide a URL to scrape");
    process.exit(1);
  }

  const html = await getHtml(url);

  const mockFilePath = `${MOCK_DIR}/${scrapperName}.html`;

  await fs.writeFile(mockFilePath, html);
})();
