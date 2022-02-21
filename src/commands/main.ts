import logger from "../logger";
import { findVenueByUrl } from "../scrape";
import {
  addTracksToPlaylist,
  emptyPlaylist,
  getManyArtistsTopTracksBySearch,
} from "../spotify";
import { extractPlaylistId, getPlaylists, Playlist } from "../playlists";

interface Options {
  filter?: string;
}

const updateAllPlaylists = async ({ filter }: Options = {}) => {
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

export default updateAllPlaylists;
