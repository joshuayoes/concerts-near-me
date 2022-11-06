import fs from "fs/promises";
import { stringify } from "envfile";

import Config, { EnvironmentVariables } from "../config";
import { ROOT_DIR } from "../utils";
import logger from "../logger";
import axios from "axios";

type AccessTokenFactory<Config> = (
  config: Config,
) => Promise<string | undefined>;

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
