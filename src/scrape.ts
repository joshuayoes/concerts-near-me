import cheerio, { CheerioAPI } from "cheerio";
import axios from "axios";

// #region Core Library
export type ArtistNameReducer = ($: CheerioAPI) => string[];

type ScrapperFactory = (
  concertCalendarUrl: string,
  artistNameReducer: ArtistNameReducer,
) => Promise<string[]>;

export const getHtml = async (url: string): Promise<string> =>
  axios.get(url).then(({ data }) => data);

export const getCherrio = (html: string): CheerioAPI => cheerio.load(html);

const scrapperFactory: ScrapperFactory = async (url, reducer) => {
  const html = await getHtml(url);
  const $ = getCherrio(html);
  return reducer($);
};

export type Scrapper = () => Promise<string[]>;

class Venue {
  constructor(readonly url: string, readonly reducer: ArtistNameReducer) {}

  async scrape() {
    const html = await getHtml(this.url);
    const $ = getCherrio(html);
    return this.reducer($);
  }
}

export const venues: Venue[] = [];

// #endregion

// #region Utilities
const extractHeading = (node: Record<string, any>): string => {
  return "data" in node.children[0] ? (node.children[0] as any).data : "";
};

const unique = (value: string, index: number, self: string[]) =>
  self.indexOf(value) === index;

const matches = (regex: RegExp) => (string: string) => !regex.test(string);

const remove = (regex: string | RegExp) =>
  (title: string) => title.replace(regex, "").trim();

const removeAfterAmpersand = remove(/ &.+/g);
const removeWhitespace = remove(/\n\t/g);
const removeSuffix = remove(/ –.+/g);
const removeBoldNotation = remove(/\*{1,2}.+\*{1,2}\s?/g);
const removeAnEveningWith = remove(/An Evening with /g);
const removeAfterPlus = remove(/ \+.+/g);
const removeAfterWith = remove(/ with .+/gi);
const removeAfterColon = remove(/:.+/gi);
const removeAfterAnd = remove(/ and .+/g);

// #endregion

// #region Washingtons
const washingtonsUrl = "https://washingtonsfoco.com/events/";

export const washingtonsArtistNameReducer: ArtistNameReducer = ($) => {
  const removeAfterBand = remove(/ Band$/g);

  const elementsToArtistNames = $("h2.font1by25.font1By5remMD").toArray()
    .map(extractHeading)
    .map(removeWhitespace)
    .map(removeBoldNotation)
    .map(removeAnEveningWith)
    .map(removeSuffix)
    .map(removeAfterAmpersand)
    .map(removeAfterAnd)
    .map(removeAfterBand);

  const uniqueArtistNames = elementsToArtistNames.filter(unique);

  return uniqueArtistNames;
};

export const washingtonsScrapper: Scrapper = () =>
  scrapperFactory(
    washingtonsUrl,
    washingtonsArtistNameReducer,
  );

const Washingtons = new Venue(washingtonsUrl, washingtonsArtistNameReducer);
venues.push(Washingtons);
// #endregion

// #region Aggie Theater
export const aggieTheaterUrl = "https://www.z2ent.com/aggie-theatre";

export const aggieTheaterArtistNameReducer: ArtistNameReducer = ($) => {
  const headings = $("h3.title > a");

  const removeParenthesis = remove(/ \(.+\)+/g);

  const elementsToArtistNames = headings.toArray()
    .map(extractHeading)
    .map(removeAfterWith)
    .map(removeParenthesis)
    .map(removeAfterAmpersand)
    .map(removeAfterPlus);

  return elementsToArtistNames;
};

export const aggieTheaterScrapper: Scrapper = () =>
  scrapperFactory(
    aggieTheaterUrl,
    aggieTheaterArtistNameReducer,
  );

const AggieTheater = new Venue(aggieTheaterUrl, aggieTheaterArtistNameReducer);
venues.push(AggieTheater);
// #endregion

// #region Roseland Theater
export const roselandTheaterUrl = "https://roselandpdx.com/events/";

export const roselandTheaterArtistNameReducer: ArtistNameReducer = ($) => {
  const headings = $("a#eventTitle > h2");

  const removeAfterFeaturing = remove(/ (featuring|feat|ft\.).+/g);
  const removeInConcert = remove(/In Concert/gi);
  const removeNorthAmericanTour = remove(/North American Tour/gi);

  const elementsToArtistNames = headings.toArray()
    .map(extractHeading)
    .map(removeWhitespace)
    .map(removeSuffix)
    .map(removeBoldNotation)
    .map(removeAnEveningWith)
    .map(removeAfterFeaturing)
    .map(removeInConcert)
    .map(removeAfterAmpersand)
    .map(removeAfterColon)
    .map(removeAfterPlus)
    .map(removeNorthAmericanTour)
    .map(removeAfterWith)
    .filter(matches(/Wrestling/))
    .filter(matches(/Roseland/))
    .filter(matches(/Heartbreak Jam/))
    .filter(matches(/ Tour/))
    .filter(unique);

  return elementsToArtistNames;
};

export const roselandTheaterScrapper: Scrapper = () =>
  scrapperFactory(
    roselandTheaterUrl,
    roselandTheaterArtistNameReducer,
  );

const RoselandTheater = new Venue(
  roselandTheaterUrl,
  roselandTheaterArtistNameReducer,
);

venues.push(RoselandTheater);
// #endregion

// #region Red Rocks
export const redRocksUrl = "https://www.redrocksonline.com/events/";

export const redRocksArtistNameReducer: ArtistNameReducer = ($) => {
  const headings = $("div#event-grid div.card-content > h3.card-title");

  const removeDates = remove(/\d{1,2}\/\d{1,2}/g);
  const remove3D = remove(/ 3-D/g);
  const removeWithTheColoradoSymphony = remove(/ with The Colorado Symphony/g);

  const elementsToArtistNames = headings.toArray()
    .map(extractHeading)
    .map(removeWhitespace)
    .map(removeAfterColon)
    .map(removeAfterAmpersand)
    .map(removeAfterAnd)
    .map(removeDates)
    .map(remove3D)
    .map(removeWithTheColoradoSymphony)
    .filter(matches(/Global Dub/))
    .filter(unique);

  return elementsToArtistNames;
};

export const redRocksScrapper: Scrapper = () =>
  scrapperFactory(
    redRocksUrl,
    redRocksArtistNameReducer,
  );

const RedRocks = new Venue(redRocksUrl, redRocksArtistNameReducer);
venues.push(RedRocks);
// #endregion
