import "dotenv/config";

export default class Config {
  static readonly clientId: string = process.env.CLIENT_ID!;
  static readonly clientSecret: string = process.env.CLIENT_SECRET!;
  static readonly redirectUri: string = process.env.REDIRECT_URI!;
  static readonly accessToken: string = process.env.ACCESS_TOKEN!;
}
