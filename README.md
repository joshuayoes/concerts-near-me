# Concerts Near Me

Scape nearby concert venue websites and create spotify playlists with the top tracks of artists that are coming to play.

## Authentication and Configuration

Run `yarn initialize` to create an `.env` and `venue.json` file.

### `.env`

#### ACCESS_TOKEN

Run `yarn serve` and then visit `localhost:8888/login`. This will prompt you to login to your Spotify account. Once you have successfully logged in, grab the token from the JSON response, and paste it in your `.env` file.

*TODO*: Make this process automatic without the need for a private server.

#### CLIENT_ID and CLIENT_SECRET

Create an app in Spotify following [these steps](https://developer.spotify.com/documentation/general/guides/authorization/app-settings/). Add the CLIENT_ID and CLIENT_SECRET values to your `.env` file.

#### REDIRECT_URI

URI/URL for Spotify to send back your `ACCESS_TOKEN`. `http://localhost:8888/callback` by default, to be compatible with `yarn serve` script. Value must be set in [your Spotify app settings](https://developer.spotify.com/documentation/general/guides/authorization/app-settings/).

### `venue.json`

An array of venues to specify what web pages to scrape, and what playlists they should be added to.

#### `playlistId`

When you copy a link to a playlist, the `playlistId` is the last part of the URL. Example: `https://open.spotify.com/playlist/<playlistId>`

#### `url`

The url of the venue page you are attempting to scrape. However, only accept known urls specified in `src/scrape.ts` will be accepted.

## Running

Once you have successfully created your authentication credentials, run `yarn start`. This will execute the `src/index.ts` file and create a playlist from using your Spotify account.

## Testing

Run `yarn test` to run the test suite. This will run unit tests for the scraper reducers against local HTML files.

### Generating Mock Payloads

For quickly developing HTML files to test against locally, utilize the `yarn generate-mock` script. It accepts two arguments: `scrapperName` and `url`. `scrapperName` should be the name of the scrapper that is being developed against, and will generate an HTML file in `src/__tests__/__mocks__` with the same name. `url` is the url of the website you want to scrape and get an HTML payload from. Example: `yarn generate-mock washingtonsScrapper https://washingtonsfoco.com/events/`
