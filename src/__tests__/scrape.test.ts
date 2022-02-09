import test from "ava";
import { getCherrio, venues } from "../scrape";
import { getLocalHtml } from "../utils";

const localFileName = (name: string) => `${name.replace(" ", "")}.html`;

for (const venue of venues) {
  test(`${venue.name} reducer reduces html to expected artist names`, async (t) => {
    const html = await getLocalHtml(localFileName(venue.name));
    const $ = getCherrio(html);
    const artistNames = venue.reducer($);
    t.snapshot(artistNames);
  });
}
