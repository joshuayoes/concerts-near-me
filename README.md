# Concerts Near Me

Scape nearby concert venue websites and create spotify playlists with the top tracks of artists that are coming to play.

## Authentication and Configuration

Run `yarn initialize` to create an `.env` and `playlists.json` file.

### `.env`

#### ACCESS_TOKEN

Run `yarn serve` and then visit `localhost:8888/login`. This will prompt you to login to your Spotify account. Once you have successfully logged in, grab the token from the JSON response, and paste it in your `.env` file.

This can also be done automatically by running `yarn auth`.

#### CLIENT_ID and CLIENT_SECRET

Create an app in Spotify following [these steps](https://developer.spotify.com/documentation/general/guides/authorization/app-settings/). Add the CLIENT_ID and CLIENT_SECRET values to your `.env` file.

#### LOGIN_URL

URL to start login flow to access `ACCESS_TOKEN`. `http://localhost:8888/login` by default, to be compatible with `yarn serve` script.

#### REDIRECT_URI

URI/URL for Spotify to send back your `ACCESS_TOKEN`. `http://localhost:8888/callback` by default, to be compatible with `yarn serve` script. Value must be set in [your Spotify app settings](https://developer.spotify.com/documentation/general/guides/authorization/app-settings/).

#### REFRESH_TOKEN

Token provided by Spotify to grab a fresh `ACCESS_TOKEN`. Must only be set once, and reused effectively forever. Grab by running `yarn serve` and visiting `http://localhost:8888/login`.

#### REFRESH_TOKEN_URL

URL to start refresh token flow to access `ACCESS_TOKEN`. `http://localhost:8888/refresh_token` by default, to be compatible with `yarn serve` script.

### `playlists.json`

An array of playlists to specify what web pages to scrape, and what playlists they should be added to.

#### `playlistUrl`

A link to a playlist you want to add songs to. Example: `https://open.spotify.com/playlist/05j0D1858DymAMhXhQ6hsD?si=ecb86d98df5445af`

#### `venueUrl`

The url of the venue page you are attempting to scrape. However, only accept known urls specified in `src/scrape.ts` will be accepted.

## Running

Once you have successfully filled out the `.env` and `playlists` files, run `yarn start`. This will execute `src/commands/auth.ts` and then `src/commands/main.ts` to populate the venue playlists with artist songs using your Spotify account.

## Testing

Run `yarn test` to run the test suite. This will run unit tests for key functionality.

### Generating Mock Payloads

For quickly developing HTML files to test against locally, utilize the `yarn generate-mock` script. It accepts two arguments: `venueName` and `url`. `venueName` should be the name of the venue in PascalCase, and will generate an HTML file in `src/__tests__/__mocks__` with the same name. `url` is the url of the website you want to scrape and get an HTML payload from. Example: `yarn generate-mock Washingtons https://washingtonsfoco.com/events/`
