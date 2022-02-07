import { z } from "zod";
import fs from "fs/promises";
import paths from "path";
import { ROOT_DIR } from "./utils";

const VenueSchema = z.object({
  playlistUrl: z.string(),
  venueUrl: z.string(),
});

const VenuesSchema = z.array(VenueSchema);

export const getVenues = async (jsonPath = "/venues.json") => {
  const filePath = paths.join(ROOT_DIR, jsonPath);

  const buffer = await fs.readFile(filePath);
  const json: unknown = JSON.parse(buffer.toString());

  return VenuesSchema.parse(json);
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
