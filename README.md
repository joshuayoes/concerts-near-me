# Concerts Near Me

Scape nearby concert venue websites and create spotify playlists with the top tracks of artists that are coming to play.

## Authentication

Run `yarn initialize` to create an `.env` file.

### ACCESS_TOKEN

Run `yarn serve` and then visit `localhost:8888/login`. This will prompt you to login to your Spotify account. Once you have successfully logged in, grab the token from the JSON response, and paste it in your `.env` file.

*TODO*: Make this process automatic without the need for a private server.

### CLIENT_ID and CLIENT_SECRET

Create an app in Spotify following [these steps](https://developer.spotify.com/documentation/general/guides/authorization/app-settings/). Add the CLIENT_ID and CLIENT_SECRET values to your `.env` file.

## Running

Once you have successfully created your authentication credentials, run `yarn start`. This will execute the `src/index.ts` file and create a playlist from using your Spotify account.
