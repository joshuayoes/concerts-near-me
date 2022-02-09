import logger from "./logger";
import { venues } from "./scrape";
import {
  addTracksToPlaylist,
  emptyPlaylist,
  getManyArtistsTopTracksBySearch,
} from "./spotify";
import { extractPlaylistId, getVenues } from "./venues";

(async () => {
  const inputVenues = await getVenues();

  for (const venue of inputVenues) {
    const { venueUrl, playlistUrl } = venue;
    const playlistId = extractPlaylistId(playlistUrl);

    const currentVenue = venues.find((v) => v.url === venueUrl);

    if (!currentVenue) {
      logger.warn(`No scrapper found for "${venueUrl}"`);
      continue;
    }

    logger.info(`Scrapping "${venueUrl}"...`);
    const artistsNames = await currentVenue.scrape();
    const allTopTrackUris = await getManyArtistsTopTracksBySearch(artistsNames);
    await emptyPlaylist(playlistId);
    await addTracksToPlaylist(playlistId, allTopTrackUris);
  }
})();
