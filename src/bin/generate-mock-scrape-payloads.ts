import path from "path";
import fs from "fs/promises";
import { getHtml } from "../scrape";

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

  const mocksDirPath = path.join(__dirname, "..", "__tests__", "__mocks__");
  const mockFilePath = `${mocksDirPath}/${scrapperName}.html`;

  await fs.writeFile(mockFilePath, html);
})();
