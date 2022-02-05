import logger from "./logger";
import { scrapperMapFactory } from "./scrape";
import {
  addTracksToPlaylist,
  emptyPlaylist,
  getManyArtistsTopTracksBySearch,
} from "./spotify";
import { getVenues } from "./venues";

(async () => {
  const venues = await getVenues();
  const scrapperMap = scrapperMapFactory();

  for (const venue of venues) {
    const { url, playlistId } = venue;
    const scrapper = scrapperMap.get(url);

    if (!scrapper) {
      logger.warn(`No scrapper found for "${url}"`);
      continue;
    }

    logger.info(`Scrapping "${url}"...`);
    const artistsNames = await scrapper();
    const allTopTrackUris = await getManyArtistsTopTracksBySearch(artistsNames);
    await emptyPlaylist(playlistId);
    await addTracksToPlaylist(playlistId, allTopTrackUris);
  }
})();
