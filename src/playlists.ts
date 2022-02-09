import { z } from "zod";
import fs from "fs/promises";
import paths from "path";
import { ROOT_DIR } from "./utils";

const PlaylistSchema = z.object({
  playlistUrl: z.string(),
  venueUrl: z.string(),
});

const PlaylistsSchema = z.array(PlaylistSchema);

export const getPlaylists = async (jsonPath = "/playlists.json") => {
  const filePath = paths.join(ROOT_DIR, jsonPath);

  const buffer = await fs.readFile(filePath);
  const json: unknown = JSON.parse(buffer.toString());

  return PlaylistsSchema.parse(json);
};

export const extractPlaylistId = (playlistUrl: string) => {
  const regex = /https\:\/\/open\.spotify\.com\/playlist\/([\w\d]+)\?*.*/;

  const match = playlistUrl.match(regex);

  if (!match) {
    throw new Error(`Was not supplied a valid url: "${playlistUrl}"`);
  }

  const [, playlistId] = match;

  if (!playlistId) {
    throw new Error(`Could not extract playlistId from "${playlistUrl}"`);
  }

  return playlistId;
};
