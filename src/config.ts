import "dotenv/config";

export default class Config {
  static readonly clientId: string = this.isString(process.env.CLIENT_ID);
  static readonly clientSecret: string = this.isString(
    process.env.CLIENT_SECRET,
  );
  static readonly redirectUri: string = this.isString(process.env.REDIRECT_URI);
  static readonly accessToken: string = this.isString(process.env.ACCESS_TOKEN);

  static isString(value: unknown): string {
    if (!value) {
      throw new Error("Value is undefined");
    }
    if (typeof value !== "string") {
      throw new Error("Value is not a string");
    }
    return value;
  }
}
