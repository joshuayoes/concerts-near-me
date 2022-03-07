import SpotifyWebApi from "spotify-web-api-node";
import Config from "./config";

const spotifyApi = new SpotifyWebApi({
  clientId: Config.get("CLIENT_ID"),
  clientSecret: Config.get("CLIENT_SECRET"),
  accessToken: Config.get("ACCESS_TOKEN"),
});

export default spotifyApi;
