import api from "./api";
import { log, logError, logWarn } from "./logger";

export const getArtistBySearch = async (query: string) => {
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

export const getTopTracksIds = async (artistId: string, maxSize = 5) => {
  const tracks = await api.getArtistTopTracks(artistId, "US");
  return tracks.body.tracks.map(({ id }) => id).filter((_, index) =>
    index < maxSize
  );
};

export const addTracksToPlaylist = async (
  playlistId: string,
  uris: string[],
) => {
  // split into chunks of 100
  const chunks = uris.reduce(
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
    try {
      await api.addTracksToPlaylist(playlistId, chunk);
    } catch (error) {
      if (error instanceof Error) {
        logError(error.message);
      }
    }
  }
};

export const getArtistTopTracksBySearch = async (name: string) => {
  const artist = await getArtistBySearch(name);
  const topTracksIds = await getTopTracksIds(artist.id);
  const topTracksUris = topTracksIds.map((id) => `spotify:track:${id}`);
  return topTracksUris;
};

export const getManyArtistsTopTracksBySearch = async (names: string[]) => {
  const allTopTrackUris: string[] = [];

  for (const name of names) {
    try {
      const topTrackUris = await getArtistTopTracksBySearch(name);
      allTopTrackUris.push(...topTrackUris);
      log(`${name} added to playlist`);
    } catch (error) {
      if (error instanceof Error) {
        logWarn(error.message);
      }
    }
  }

  return allTopTrackUris;
};
