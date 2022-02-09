import logger from "./logger";
import { venues } from "./scrape";
import {
  addTracksToPlaylist,
  emptyPlaylist,
  getManyArtistsTopTracksBySearch,
} from "./spotify";
import { extractPlaylistId, getPlaylists } from "./playlists";

(async () => {
  const playlists = await getPlaylists();

  for (const playlist of playlists) {
    const { venueUrl, playlistUrl } = playlist;
    const playlistId = extractPlaylistId(playlistUrl);

    const venue = venues.find((v) => v.url === venueUrl);

    if (!venue) {
      logger.warn(`No scrapper found for "${venueUrl}"`);
      continue;
    }

    logger.info(`Scrapping ${venue.name} at "${venueUrl}"...`);
    const artistsNames = await venue.scrape();
    const allTopTrackUris = await getManyArtistsTopTracksBySearch(artistsNames);
    await emptyPlaylist(playlistId);
    await addTracksToPlaylist(playlistId, allTopTrackUris);
  }
})();
