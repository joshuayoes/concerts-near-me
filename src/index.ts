import { log } from "./logger";
import { washingtonsScrapper } from "./scrape";
import {
  addTracksToPlaylist,
  createPlaylist,
  getManyArtistsTopTracksBySearch,
} from "./spotify";

(async () => {
  const playlistName = "Washington's Upcoming Artists";
  const playlistId = await createPlaylist(playlistName);
  const artistsNames = await washingtonsScrapper();
  const allTopTrackUris = await getManyArtistsTopTracksBySearch(artistsNames);

  await addTracksToPlaylist(playlistId, allTopTrackUris);

  log(`Playlist "${playlistName}" updated`);
})();
