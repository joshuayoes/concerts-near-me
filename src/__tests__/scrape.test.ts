import test from "ava";
import { getCherrio, washingtonArtistNameBuilder } from "../scrape";
import { getLocalHtml } from "../utils";

test("washingtonsScrapper reduces html to expected artist names", async (t) => {
  const html = await getLocalHtml("washingtonsScrapper.html");
  const $ = getCherrio(html);
  const artistNames = washingtonArtistNameBuilder($);
  t.snapshot(artistNames);
});
