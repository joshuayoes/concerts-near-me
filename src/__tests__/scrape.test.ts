import test, { ExecutionContext } from "ava";
import {
  aggieTheaterArtistNameReducer,
  ArtistNameReducer,
  getCherrio,
  washingtonsArtistNameReducer,
} from "../scrape";
import { getLocalHtml } from "../utils";

const scrapperTestFactory = (mockPath: string, reducer: ArtistNameReducer) =>
  async (t: ExecutionContext<unknown>) => {
    const html = await getLocalHtml(mockPath);
    const $ = getCherrio(html);
    const artistNames = reducer($);
    t.snapshot(artistNames);
  };

test(
  "washingtonsScrapper reduces html to expected artist names",
  scrapperTestFactory("washingtonsScrapper.html", washingtonsArtistNameReducer),
);

test(
  "aggieTheaterScrapper reduces html to expected artist names",
  scrapperTestFactory(
    "aggieTheaterScrapper.html",
    aggieTheaterArtistNameReducer,
  ),
);
