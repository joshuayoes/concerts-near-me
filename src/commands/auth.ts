import fs from "fs/promises";
import puppeteer from "puppeteer";
import { stringify } from "envfile";

import Config from "../config";
import { argvFactory, ROOT_DIR, toAsterisks } from "../utils";
import logger from "../logger";

const getToken = async (): Promise<string | undefined> => {
  let browser: puppeteer.Browser | undefined = undefined;
  let token: string | undefined = undefined;

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
    logger.info("Launched browser");
    const page = await browser.newPage();
    await page.goto(url);
    logger.info(`Navigated to "${url}"`);
    await page.type("input#login-username", username);
    logger.info(`Inputed username: "${username}"`);
    await page.type("input#login-password", password);
    logger.info(`Inputed password: "${toAsterisks(password)}"`);
    await page.click("button#login-button");
    logger.info(`Clicked submit button`);
    await page.waitForNavigation();

    const response = await page.content();
    logger.info(`Recieved page response`);
    const extractToken = (str: string) => str.match(/"token":"([\w|-]+)"/)![1];
    token = extractToken(response);
    logger.info(`Extracted token from response`);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    }
  } finally {
    await browser?.close();
    logger.info(`Closed browser`);
  }

  return token;
};

const updateEnvfile = async (token: string) => {
  // Write new ACCESS_TOKEN to .env file
  const envJson = { ...Config };
  envJson.ACCESS_TOKEN = token;

  const envFileString = stringify(envJson);
  const envFilePath = `${ROOT_DIR}.env`;
  await fs.writeFile(envFilePath, envFileString);
  logger.info(`Successfully updated .env file at "${envFilePath}"`);
};

(async () => {
  const token = await getToken();
  if (token) {
    await updateEnvfile(token);
  } else {
    logger.error("Failed to get access token");
  }
})();
