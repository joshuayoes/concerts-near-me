import test from "ava";
import {
  aggieTheaterArtistNameReducer,
  getCherrio,
  washingtonsArtistNameReducer,
} from "../scrape";
import { getLocalHtml } from "../utils";

test("washingtonsScrapper reduces html to expected artist names", async (t) => {
  const html = await getLocalHtml("washingtonsScrapper.html");
  const $ = getCherrio(html);
  const artistNames = washingtonsArtistNameReducer($);
  t.snapshot(artistNames);
});

test("aggieTheaterScrapper reduces html to expected artist names", async (t) => {
  const html = await getLocalHtml("aggieTheaterScrapper.html");
  const $ = getCherrio(html);
  const artistNames = aggieTheaterArtistNameReducer($);
  t.snapshot(artistNames);
});
