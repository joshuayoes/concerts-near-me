import "dotenv/config";

export default class Config {
  static readonly clientId: string = this.env("CLIENT_ID");
  static readonly clientSecret: string = this.env("CLIENT_SECRET");
  static readonly redirectUri: string = this.env("REDIRECT_URI");
  static readonly accessToken: string = this.env("ACCESS_TOKEN");

  static env(key: string): string {
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
  }
}
