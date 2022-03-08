import fs from "fs/promises";
import puppeteer from "puppeteer";
import { stringify } from "envfile";

import Config, { EnvironmentVariables } from "../config";
import { argvFactory, ROOT_DIR, toAsterisks } from "../utils";
import logger from "../logger";
import axios from "axios";

type AccessTokenFactory<Config> = (
  config: Config,
) => Promise<string | undefined>;

interface BrowserLoginConfig {
  username: string;
  password: string;
  url: string;
}
/** @deprecated - works on local machines, but not in Github Actions enviroment */
export const getAccessTokenViaBrowserLogin: AccessTokenFactory<
  BrowserLoginConfig
> = async ({ username, password, url }) => {
  let browser: puppeteer.Browser | undefined = undefined;
  let token: string | undefined = undefined;

  try {
    // Get accessToken from Spotify using proxy server
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

interface RefreshTokenConfig {
  REFRESH_TOKEN: string;
  REFRESH_TOKEN_URL: string;
}
export const getAccessTokenViaRefreshToken: AccessTokenFactory<
  RefreshTokenConfig
> = async ({ REFRESH_TOKEN, REFRESH_TOKEN_URL }) => {
  try {
    const response = await axios.get<{ access_token: string }>(
      REFRESH_TOKEN_URL,
      { params: { "refresh_token": REFRESH_TOKEN } },
    );
    logger.info(`Requested new accessToken from "${REFRESH_TOKEN_URL}"`);

    const access_token: unknown = response?.data?.access_token;

    if (!access_token) {
      logger.error(
        `Failed to get access_token from "${REFRESH_TOKEN_URL}" using REFRESH_TOKEN: "${
          REFRESH_TOKEN?.substring(0, 10)
        }..."`,
      );
      return undefined;
    }

    if (typeof access_token !== "string") {
      logger.error(
        `access_token from "${REFRESH_TOKEN_URL}" is not a string, but ${typeof access_token}`,
      );
      return undefined;
    }

    logger.info(
      `Successfully retrieved new accessToken: "${
        access_token.substring(0, 10)
      }..."`,
    );

    return access_token;
  } catch (error) {
    if (error instanceof Error) logger.error(error.message);
    return undefined;
  }
};

export const updateEnvfile = async (token: string) => {
  // Write new ACCESS_TOKEN to .env file
  const envJson: EnvironmentVariables = {
    ACCESS_TOKEN: token,
    CLIENT_ID: Config.get("CLIENT_ID"),
    CLIENT_SECRET: Config.get("CLIENT_SECRET"),
    LOGIN_URL: Config.get("LOGIN_URL"),
    REDIRECT_URI: Config.get("REDIRECT_URI"),
    REFRESH_TOKEN: Config.get("REFRESH_TOKEN"),
    REFRESH_TOKEN_URL: Config.get("REFRESH_TOKEN_URL"),
    SPOTIFY_LOGIN: Config.get("SPOTIFY_LOGIN"),
    SPOTIFY_PASSWORD: Config.get("SPOTIFY_PASSWORD"),
  };

  const envFileString = stringify(envJson);
  const envFilePath = `${ROOT_DIR}.env`;
  await fs.writeFile(envFilePath, envFileString);
  logger.info(`Successfully updated .env file at "${envFilePath}"`);
};

(async () => {
  const accessToken = await getAccessTokenViaRefreshToken(
    {
      REFRESH_TOKEN: Config.get("REFRESH_TOKEN"),
      REFRESH_TOKEN_URL: Config.get("REFRESH_TOKEN_URL"),
    },
  );

  if (accessToken) {
    await updateEnvfile(accessToken);
  } else {
    logger.error("Failed to get access token");
  }
})();
