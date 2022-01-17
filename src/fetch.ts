import Config from "./config";
import request from "request";

const authOptions = {
  url: "https://accounts.spotify.com/api/token",
  headers: {
    "Authorization": "Basic " +
      Buffer.from(Config.clientId + ":" + Config.clientSecret).toString(
        "base64",
      ),
  },
  form: {
    grant_type: "client_credentials",
  },
  json: true,
};

request.post(authOptions, function (error, response, body) {
  if (!error) {
    const token = body.access_token;
    console.log(token);
  } else {
    console.error(error);
  }
});
