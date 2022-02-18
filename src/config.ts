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
  static readonly clientId: string = env("CLIENT_ID");
  static readonly clientSecret: string = env("CLIENT_SECRET");
  static readonly redirectUri: string = env("REDIRECT_URI");
  static readonly accessToken: string = env("ACCESS_TOKEN");
}
