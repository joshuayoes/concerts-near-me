import api from "./api";
import logger from "./logger";
import { artistNameOverridesMap } from "./utils";

export const getArtistBySearch = async (query: string) => {
  const artistName = artistNameOverridesMap.get(query) ?? query;
  const res = await api.search(artistName, ["artist"], { market: "US" });

  const artists = res.body.artists?.items ?? [];
  const exactName = (a: SpotifyApi.ArtistObjectFull): boolean =>
    a.name.toLowerCase() === artistName.toLowerCase();
  const artist = artists.find(exactName) ?? artists[0];
  if (!artist) throw Error(`"${artistName}" was not found on Spotify`);

  const message = artistName === artist.name
    ? `Found "${artist.name}" on Spotify`
    : `Found "${artistName}" as "${artist.name}" on Spotify`;
  logger.info(message);
  return artist;
};

export const createPlaylist = async (name: string, description = "") => {
  const res = await api.createPlaylist(name, {
    public: true,
    description,
  });

  logger.info(`Playlist "${name}" created: "${res.body.uri}"`);

  return res.body.id;
};

export const getTopTracksIds = async (
  artistId: string,
  maxSize = 5,
  /** Non-essential value, only for logging*/
  artistName?: string,
) => {
  const tracks = await api.getArtistTopTracks(artistId, "US");
  if (tracks.body.tracks.length < maxSize) {
    logger.warn(
      `Only ${tracks.body.tracks.length} tracks found for "${artistName}", not ${maxSize}`,
    );
  }
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
        throw error;
      }
    }
  }

  logger.info(
    `Added ${uris.length} tracks to playlist "https://open.spotify.com/playlist/${playlistId}"`,
  );
};

export const getArtistTopTracksBySearch = async (name: string) => {
  const artist = await getArtistBySearch(name);
  const topTracksIds = await getTopTracksIds(artist.id, 5, artist.name);
  const topTracksUris = topTracksIds.map((id) => `spotify:track:${id}`);
  return topTracksUris;
};

export const getManyArtistsTopTracksBySearch = async (names: string[]) => {
  const allTopTrackUris: string[] = [];
  logger.info(`Searching for ${names.length} artists...`);

  for (const name of names) {
    try {
      const topTrackUris = await getArtistTopTracksBySearch(name);
      allTopTrackUris.push(...topTrackUris);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          logger.warn(error.message);
        } else {
          throw error;
        }
      }
    }
  }

  return allTopTrackUris;
};

export const emptyPlaylist = async (playlistId: string) => {
  try {
    const initalRes = await api.getPlaylistTracks(playlistId);
    const pages = Math.ceil(initalRes.body.total / initalRes.body.limit);

    for (let i = 0; i < pages; i++) {
      const res = await api.getPlaylistTracks(playlistId);
      const tracks = res.body.items;
      const trackIds = tracks.map(({ track }) => ({ uri: track.uri }));
      await api.removeTracksFromPlaylist(playlistId, trackIds);
    }

    logger.info(
      `Removed ${initalRes.body.total} tracks from playlist "https://open.spotify.com/playlist/${playlistId}"`,
    );
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
  }
};
