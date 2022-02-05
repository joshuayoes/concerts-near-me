import { z } from "zod";
import fs from "fs/promises";
import paths from "path";

const VenueSchema = z.object({
  playlistId: z.string(),
  url: z.string(),
});

const VenuesSchema = z.array(VenueSchema);

export const getVenues = async (jsonPath = "/venues.json") => {
  const pwd = process.cwd();
  const filePath = paths.join(pwd, jsonPath);

  const buffer = await fs.readFile(filePath);
  const json: unknown = JSON.parse(buffer.toString());

  return VenuesSchema.parse(json);
};
