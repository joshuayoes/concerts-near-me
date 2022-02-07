import logger from "./logger";
import { scrapperMapFactory } from "./scrape";
import {
  addTracksToPlaylist,
  emptyPlaylist,
  getManyArtistsTopTracksBySearch,
} from "./spotify";
import { extractPlaylistId, getVenues } from "./venues";

(async () => {
  const venues = await getVenues();
  const scrapperMap = scrapperMapFactory();

  for (const venue of venues) {
    const { venueUrl, playlistUrl } = venue;
    const playlistId = extractPlaylistId(playlistUrl);
    const scrapper = scrapperMap.get(venueUrl);

    if (!scrapper) {
      logger.warn(`No scrapper found for "${venueUrl}"`);
      continue;
    }

    logger.info(`Scrapping "${venueUrl}"...`);
    const artistsNames = await scrapper();
    const allTopTrackUris = await getManyArtistsTopTracksBySearch(artistsNames);
    await emptyPlaylist(playlistId);
    await addTracksToPlaylist(playlistId, allTopTrackUris);
  }
})();
