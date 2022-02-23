import "dotenv/config";

const env = (key: string): string => {
  const value: unknown = process.env[key];

  if (!value) {
    throw new Error(`Value for ${key} in .env is "${typeof value}"`);
  }

  if (typeof value !== "string") {
    throw new Error(
      `Value for ${key} in .env is not a string, but "${typeof value}"`,
    );
  }

  return value;
};

export default class Config {
  static readonly ACCESS_TOKEN: string = env("ACCESS_TOKEN");
  static readonly CLIENT_ID: string = env("CLIENT_ID");
  static readonly CLIENT_SECRET: string = env("CLIENT_SECRET");
  static readonly LOGIN_URL: string = env("LOGIN_URL");
  static readonly REDIRECT_URI: string = env("REDIRECT_URI");
  static readonly SPOTIFY_LOGIN: string = env("SPOTIFY_LOGIN");
  static readonly SPOTIFY_PASSWORD: string = env("SPOTIFY_PASSWORD");
}
