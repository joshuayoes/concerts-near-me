import fs from "fs/promises";
import puppeteer from "puppeteer";
import { stringify } from "envfile";

import Config from "../config";
import { argvFactory, ROOT_DIR } from "../utils";
import logger from "../logger";

(async () => {
  let browser: puppeteer.Browser | undefined = undefined;

  try {
    // Get accessToken from Spotify using proxy server
    const username = Config.SPOTIFY_LOGIN;
    const password = Config.SPOTIFY_PASSWORD;
    const url = Config.LOGIN_URL;
    const argv = argvFactory({ headless: { type: "boolean", default: true } });

    browser = await puppeteer.launch({
      ignoreDefaultArgs: ["--disable-extensions", "--no-sandbox"],
      headless: argv.headless,
    });
    const page = await browser.newPage();
    await page.goto(url);
    await page.type("input#login-username", username);
    await page.type("input#login-password", password);
    await page.click("button#login-button");
    await page.waitForNavigation();

    const response = await page.content();
    const extractToken = (str: string) => str.match(/"token":"([\w|-]+)"/)![1];
    const token = extractToken(response);

    // Write new ACCESS_TOKEN to .env file
    const envJson = { ...Config };
    envJson.ACCESS_TOKEN = token;

    const envFileString = stringify(envJson);
    const envFilePath = `${ROOT_DIR}.env`;
    await fs.writeFile(envFilePath, envFileString);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    }
  } finally {
    await browser?.close();
  }
})();
