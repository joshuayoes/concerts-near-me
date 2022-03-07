import express from "express";
import request from "request";
import Config from "./config";
import logger from "./logger";

var client_id = Config.get("CLIENT_ID");
var client_secret = Config.get("CLIENT_SECRET");
var redirect_uri = Config.get("REDIRECT_URI");

var app = express();
const PORT = 8888;
const HOST = "localhost";
const URL = `http://${HOST}:${PORT}`;

app.get("/login", function (req, res) {
  var state = "a".repeat(16);
  var scope = "user-read-private user-read-email playlist-modify-public";

  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      new URLSearchParams({
        response_type: "code",
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
      }).toString(),
  );
});

app.get("/callback", function (req, res) {
  var code = req.query.code || null;
  var state = req.query.state || null;

  if (state === null) {
    res.redirect(
      "/#" +
        new URLSearchParams({
          error: "state_mismatch",
        }).toString(),
    );
  } else {
    var authOptions = {
      url: "https://accounts.spotify.com/api/token",
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: "authorization_code",
      },
      headers: {
        "Authorization": "Basic " +
          (Buffer.from(client_id + ":" + client_secret).toString("base64")),
      },
      json: true,
    };

    request.post(authOptions, function (error, response, body) {
      if (!error) {
        const token = body.access_token;
        res.json({ token });
        logger.info(
          `Successfully recieved accessToken: "${token.substring(0, 10)}..."`,
        );
      } else {
        console.error(error);
      }
    });
  }
});

app.get("/", (req, res) => {
  res.sendStatus(200);
});

app.listen(PORT, () => {
  logger.info(`Listening on "http://${HOST}:${PORT}"...`);
  logger.info(`Registered: "${URL}/"`);
  logger.info(`Registered: "${URL}/login"`);
  logger.info(`Registered: "${URL}/callback"`);
});
