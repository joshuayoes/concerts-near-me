import logger from "../logger";
import { findVenueByUrl } from "../scrape";
import {
  addTracksToPlaylist,
  emptyPlaylist,
  getManyArtistsTopTracksBySearch,
} from "../spotify";
import { extractPlaylistId, getPlaylists, Playlist } from "../playlists";
import { argvFactory } from "../utils";

interface Options {
  filter?: string;
  dry?: boolean;
}

const updateAllPlaylists = async ({ filter, dry }: Options = {}) => {
  const playlists = await getPlaylists();

  const updatePlaylist = async (playlist: Playlist) => {
    const { venueUrl, playlistUrl } = playlist;
    const playlistId = extractPlaylistId(playlistUrl);

    const venue = findVenueByUrl(venueUrl);

    if (!venue) {
      logger.warn(`No scrapper found for "${venueUrl}"`);
      return;
    }

    logger.info(`Scrapping ${venue.name} at "${venueUrl}"...`);
    const artistsNames = await venue.scrape();
    const allTopTrackUris = await getManyArtistsTopTracksBySearch(artistsNames);

    if (dry) {
      logger.info(`Dry run: not adding tracks to playlist`);
      return;
    }

    await emptyPlaylist(playlistId);
    await addTracksToPlaylist(playlistId, allTopTrackUris);
  };

  for (const playlist of playlists) {
    const filterRegex = filter ? new RegExp(filter) : undefined;

    if (filterRegex && !filterRegex.test(playlist.venueUrl)) {
      continue;
    }

    await updatePlaylist(playlist);
  }
};

(async () => {
  const argv = argvFactory({
    filter: { type: "string" },
    dry: { type: "boolean", default: false },
  });

  await updateAllPlaylists({ filter: argv?.filter, dry: argv?.dry });
})();
