import "dotenv/config";

export interface EnvironmentVariables {
  ACCESS_TOKEN: string;
  CLIENT_ID: string;
  CLIENT_SECRET: string;
  LOGIN_URL: string;
  REDIRECT_URI: string;
  REFRESH_TOKEN: string;
  REFRESH_TOKEN_URL: string;
  SPOTIFY_LOGIN: string;
  SPOTIFY_PASSWORD: string;
}

type EnvKey = keyof EnvironmentVariables;

export default class Config {
  static CI: boolean = Boolean(process.env.CI ?? "false");

  static get(key: EnvKey): string;
  static get(key: EnvKey, options: { required: false }): string | undefined;
  static get(key: EnvKey, options: { required: true }): string;
  static get(key: EnvKey, options: { required: boolean }): string | undefined;
  static get(key: EnvKey, options?: { required: boolean }): string | undefined {
    const value: unknown = process.env[key];
    const { required = true } = options ?? {};

    if (!value && required) {
      throw new Error(`Value for ${key} in .env is "${typeof value}"`);
    }
    if (!value && required === false) return undefined;

    if (typeof value !== "string") {
      throw new Error(
        `Value for ${key} in .env is not a string, but "${typeof value}"`,
      );
    }

    return value;
  }
}
