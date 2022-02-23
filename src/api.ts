import SpotifyWebApi from "spotify-web-api-node";
import Config from "./config";

const spotifyApi = new SpotifyWebApi({
  clientId: Config.CLIENT_ID,
  clientSecret: Config.CLIENT_SECRET,
  accessToken: Config.ACCESS_TOKEN,
});

export default spotifyApi;
