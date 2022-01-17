import api from "./api";

(async () => {
  const getArtistBySearch = async (query: string) => {
    const res = await api.search(query, ["artist"]);
    const [artist] = res.body.artists?.items ?? [];
    if (!artist) throw Error("No artist");
    return artist;
  };

  const createPlaylist = async (name: string) => {
    const id = null;

    if (!id) {
      const res = await api.createPlaylist(name, {
        public: true,
      });

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

  const artist = await getArtistBySearch("Goth Babe");
  const topTracksIds = await getTopTracksIds(artist.id);
  const topTracksUri = topTracksIds.map((id) => `spotify:track:${id}`);
  const playlistId = await createPlaylist("Concert Venue");

  const res = await api.addTracksToPlaylist(playlistId, topTracksUri);

  console.log(res);
})();
