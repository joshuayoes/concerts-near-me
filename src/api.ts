import SpotifyWebApi from "spotify-web-api-node";
import Config from "./config";

const spotifyApi = new SpotifyWebApi({
  clientId: Config.clientId,
  clientSecret: Config.clientSecret,
  accessToken: Config.accessToken,
});

export default spotifyApi;
