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
// #endregion

// #region Utilities
const extractHeading = (node: Record<string, any>): string =>
  "data" in node.children[0] ? (node.children[0] as any).data : "";

const remove = (regex: string | RegExp) =>
  (title: string) => title.replace(regex, "").trim();

const removeAfterAmpersand = remove(/ &.+/g);
// #endregion

// #region Washingtons
const washingtonsUrl = "https://washingtonsfoco.com/events/";

export const washingtonsArtistNameReducer: ArtistNameReducer = ($) => {
  const removeWhitespace = remove(/\n\t/g);
  const removeBoldNotation = remove(/\*{1,2}.+\*{1,2}\s+/g);
  const removeAnEveningWith = remove(/An Evening with /g);
  const removeSuffix = remove(/ –.+/g);
  const removeAfterAnd = remove(/ and .+/g);
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

  const unique = (value: string, index: number, self: string[]) =>
    self.indexOf(value) === index;
  const uniqueArtistNames = elementsToArtistNames.filter(unique);

  return uniqueArtistNames;
};

export const washingtonsScrapper: Scrapper = () =>
  scrapperFactory(
    washingtonsUrl,
    washingtonsArtistNameReducer,
  );
// #endregion

// #region Aggie Theater
export const aggieTheaterUrl = "https://www.z2ent.com/aggie-theatre";

export const aggieTheaterArtistNameReducer: ArtistNameReducer = ($) => {
  const headings = $("h3.title > a");

  const removeWith = remove(/ with .+/g);
  const removeParenthesis = remove(/ \(.+\)+/g);
  const removeAfterPlus = remove(/ \+.+/g);

  const elementsToArtistNames = headings.toArray()
    .map(extractHeading)
    .map(removeWith)
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
// #endregion

export const scrapperMapFactory = () => {
  // create a map of scrappers, with the urls as the keys, and scrapper as the value
  const scrapperMap = new Map<string, Scrapper>();
  scrapperMap.set(
    washingtonsUrl,
    washingtonsScrapper,
  );
  scrapperMap.set(
    aggieTheaterUrl,
    aggieTheaterScrapper,
  );
  return scrapperMap;
};
