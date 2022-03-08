import cheerio, { CheerioAPI } from "cheerio";
import axios from "axios";

// #region Core Library
/** Perform a GET request to URL and reutrn HTML payload */
export const getHtml = async (url: string): Promise<string> =>
  axios.get(url).then(({ data }) => data);

/** Get an instance of cherrio library */
export const getCherrio = (html: string): CheerioAPI => cheerio.load(html);

/** Contract for callback to reduce HTML page down to artist names */
type ArtistNameReducer = ($: CheerioAPI) => string[];

/** Entity to represent concert venues that are able to be scrapped */
export class Venue {
  constructor(
    /** Formated name of the venue for logging */
    readonly name: string,
    /** URL of the venue website page to be scraped */
    readonly url: string,
    /** Function that takes a cheerio instance and returns an array of artist names */
    readonly reducer: ArtistNameReducer,
  ) {}

  /** Make a GET request to venue url and return a list of artist names that are performing */
  async scrape() {
    const html = await getHtml(this.url);
    const $ = getCherrio(html);
    return this.reducer($);
  }
}

/** Array of venues that can be scrapped */
export const venues: Venue[] = [];
export const findVenueByUrl = (url: string) =>
  venues.find((v) => v.url === url);
// #endregion

// #region Utilities
const extractHeading = (node: Record<string, any>): string => {
  return "data" in node.children[0] ? (node.children[0] as any).data : "";
};

const unique = (value: string, index: number, self: string[]) =>
  self.indexOf(value) === index;

const matches = (regex: RegExp) => (string: string) => !regex.test(string);

const replace = (search: string, replacement: string) =>
  (string: string) => string.replace(search, replacement);

const remove = (regex: string | RegExp) =>
  (title: string) => title.replace(regex, "").trim();

const toPascalCase = (value: string) =>
  value.toLowerCase().split(" ").map((word) =>
    word.charAt(0).toUpperCase() + word.toLowerCase().slice(1)
  ).join(" ");

const removeAfterAmpersand = remove(/ &.+/g);
const removeWhitespace = remove(/\n\t/g);
const removeSuffix = remove(/ –.+/g);
const removeBoldNotation = remove(/\*{1,2}.+\*{1,2}\s?/g);
const removeAnEveningWith = remove(/An Evening with /gi);
const removeAfterPlus = remove(/ \+.+/g);
const removeAfterWith = remove(/ with .+/gi);
const removeAfterColon = remove(/:.+/gi);
const removeAfterAnd = remove(/ and .+/g);
const removeAfterDash = remove(/ (-|–) .+/g);
const removeParenthesis = remove(/\(.+\)+/g);
const removeAfterSlash = remove(/\/.+/gi);
// #endregion

// #region Washingtons
const washingtonsUrl = "https://washingtonsfoco.com/events/";

const washingtonsArtistNameReducer: ArtistNameReducer = ($) => {
  const removeAfterBand = remove(/ Band$/g);
  const removeAfterTrio = remove(/Trio .+/g);
  const removeQuintet = remove(/Quintet/g);

  const elementsToArtistNames = $("h2.font1by25.font1By5remMD").toArray()
    .map(extractHeading)
    .map(removeWhitespace)
    .map(removeBoldNotation)
    .map(removeAnEveningWith)
    .map(removeSuffix)
    .map(removeAfterAnd)
    .map(removeAfterBand)
    .map(removeAfterTrio)
    .map(removeQuintet);

  const uniqueArtistNames = elementsToArtistNames.filter(unique);

  return uniqueArtistNames;
};

const Washingtons = new Venue(
  "Washingtons",
  washingtonsUrl,
  washingtonsArtistNameReducer,
);
venues.push(Washingtons);
// #endregion

// #region Aggie Theater
const aggieTheaterUrl = "https://www.z2ent.com/aggie-theatre";

const aggieTheaterArtistNameReducer: ArtistNameReducer = ($) => {
  const headings = $("h3.title > a");

  const elementsToArtistNames = headings.toArray()
    .map(extractHeading)
    .map(removeAfterWith)
    .map(removeParenthesis)
    .map(removeAfterAmpersand)
    .map(removeAfterPlus);

  return elementsToArtistNames;
};

const AggieTheater = new Venue(
  "Aggie Theater",
  aggieTheaterUrl,
  aggieTheaterArtistNameReducer,
);
venues.push(AggieTheater);
// #endregion

// #region Roseland Theater
const roselandTheaterUrl = "https://roselandpdx.com/events/";

const roselandTheaterArtistNameReducer: ArtistNameReducer = ($) => {
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
    .map(removeAfterSlash)
    .map(toPascalCase)
    .filter(matches(/Wrestling/))
    .filter(matches(/Roseland/))
    .filter(matches(/Heartbreak Jam/))
    .filter(matches(/ Tour/))
    .filter(unique);

  return elementsToArtistNames;
};

const RoselandTheater = new Venue(
  "Roseland Theater",
  roselandTheaterUrl,
  roselandTheaterArtistNameReducer,
);

venues.push(RoselandTheater);
// #endregion

// #region Red Rocks
const redRocksUrl = "https://www.redrocksonline.com/events/";

const redRocksArtistNameReducer: ArtistNameReducer = ($) => {
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
    .map(removeAfterDash)
    .filter(matches(/Global Dub/))
    .filter(unique);

  return elementsToArtistNames;
};

const RedRocks = new Venue("Red Rocks", redRocksUrl, redRocksArtistNameReducer);
venues.push(RedRocks);
// #endregion

// #region Marquis Theater
const marquisTheaterUrl =
  "https://www.livenation.com/venue/KovZpZAJeFkA/marquis-theater-events";

const marquisTheaterArtistNameReducer: ArtistNameReducer = ($) => {
  const headings = $("div.listing__item__details  > header > h3");

  const removeAfterDoubleQuotes = remove(/\".+/g);

  const elementsToArtistNames = headings.toArray()
    .map(extractHeading)
    .map(replace("¥", "y"))
    .map(replace("$", "s"))
    .map(removeAfterDoubleQuotes)
    .map(remove("Indie 102.3 Presents "))
    .map(remove(" Tour Kickoff"))
    .map(remove(" North America 2022"))
    .map(remove(" Spring Tour 2022"))
    .map(removeAfterSlash)
    .map(removeAfterDash);

  return elementsToArtistNames;
};

const MarquisTheater = new Venue(
  "Marquis Theater",
  marquisTheaterUrl,
  marquisTheaterArtistNameReducer,
);
venues.push(MarquisTheater);
// #endregion

// #region Wonder Ballroom
const wonderBallroomUrl = "https://wonderballroom.com/events/";

const wonderBallroomArtistNameReducer: ArtistNameReducer = ($) => {
  const headings = $("a#eventTitle > h2");

  const removeAnyPresents = remove(/.+ Presents:? /);
  const removeAfterWithSpecialGuest = remove(/ with Special Guest .+/gi);

  const elementsToArtistNames = headings.toArray()
    .map(extractHeading)
    .map(removeWhitespace)
    .map(removeAnyPresents)
    .map(removeParenthesis)
    .map(removeBoldNotation)
    .map(removeAfterWithSpecialGuest)
    .map(removeAfterAmpersand)
    .map(removeAfterDash)
    .map(remove("The Marías Present: "))
    .map(toPascalCase)
    .filter(matches(/Cancelled\: /))
    .filter(unique);

  return elementsToArtistNames;
};

const WonderBallroom = new Venue(
  "Wonder Ballroom",
  wonderBallroomUrl,
  wonderBallroomArtistNameReducer,
);
venues.push(WonderBallroom);
// #endregion

// #region Crystal Ballroom
const crystalBallroomUrl =
  "https://www.crystalballroompdx.com/events/search/Any?joint_name=Crystal+Ballroom&location_id=2";

const crystalBallroomArtistNameReducer: ArtistNameReducer = ($) => {
  const headings = $(".upcoming-events-wrapper h1.billing > a");

  const removeNthAnniversary = remove(/\d+th Anniversary/gi);
  const removeRescheduled = remove("Rescheduled: ");

  const elementsToArtistNames = headings.toArray()
    .map(extractHeading)
    .map(removeWhitespace)
    .map(removeParenthesis)
    .map(removeNthAnniversary)
    .map(removeAnEveningWith)
    .map(removeRescheduled)
    .map(replace("& The Juice", "& Special Sauce"))
    .map(remove("Returns:  Thank Fucking God"))
    .map(remove("and The Violators"))
    .filter(unique)
    .filter(Boolean);

  return elementsToArtistNames;
};

const CrystalBallroom = new Venue(
  "Crystal Ballroom",
  crystalBallroomUrl,
  crystalBallroomArtistNameReducer,
);
venues.push(CrystalBallroom);
// #endregion
