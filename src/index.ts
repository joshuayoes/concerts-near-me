import { washingtonsScrapper } from "./scrape";
import {
  addTracksToPlaylist,
  createPlaylist,
  getManyArtistsTopTracksBySearch,
} from "./spotify";

(async () => {
  const artistsNames = await washingtonsScrapper();
  const allTopTrackUris = await getManyArtistsTopTracksBySearch(artistsNames);

  const playlistName = "Washington's Upcoming Artists";
  const playlistDescription =
    "The most popular tracks from artists performing at Washington's soon: https://washingtonsfoco.com/events/";

  const playlistId = await createPlaylist(playlistName, playlistDescription);
  await addTracksToPlaylist(playlistId, allTopTrackUris);
})();
