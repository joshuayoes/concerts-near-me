import api from "./api";
import { log, logWarn } from "./logger";
import { washingtonsScrapper } from "./scrape";

const getArtistBySearch = async (query: string) => {
  const res = await api.search(query, ["artist"]);
  const [artist] = res.body.artists?.items ?? [];
  if (!artist) {
    throw Error(`${query} was not found on Spotify`);
  }
  return artist;
};

export const createPlaylist = async (name: string) => {
  const id = null;

  if (!id) {
    const res = await api.createPlaylist(name, {
      public: true,
    });

    log(`Playlist "${name}" created: ${res.body.uri}`);

    return res.body.id;
  }

  return id;
};

const getTopTracksIds = async (artistId: string, maxSize = 5) => {
  const tracks = await api.getArtistTopTracks(artistId, "US");
  return tracks.body.tracks.map(({ id }) => id).filter((_, index) =>
    index < maxSize
  );
};

(async () => {
  const artistsNames = await washingtonsScrapper();

  const playlistName = "Washington's Upcoming Artists";
  const playlistId = await createPlaylist(playlistName);
  const allTopTrackUris: string[] = [];

  for (const name of artistsNames) {
    try {
      const artist = await getArtistBySearch(name);
      const topTracksIds = await getTopTracksIds(artist.id);
      const topTracksUris = topTracksIds.map((id) => `spotify:track:${id}`);
      allTopTrackUris.push(...topTracksUris);
      log(`${name} added to playlist`);
    } catch (error) {
      if (error instanceof Error) {
        logWarn(error.message);
      }
    }
  }

  // split into chunks of 100
  const chunks = allTopTrackUris.reduce(
    (acc, curr, index) => {
      const chunkIndex = Math.floor(index / 100);
      if (!acc[chunkIndex]) {
        acc[chunkIndex] = [];
      }
      acc[chunkIndex].push(curr);
      return acc;
    },
    [] as string[][],
  );

  for (const chunk of chunks) {
    await api.addTracksToPlaylist(playlistId, chunk);
  }

  log(`Playlist "${playlistName}" updated`);
})();
