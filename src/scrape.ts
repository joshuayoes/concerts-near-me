import cheerio from "cheerio";
import axios from "axios";

abstract class Scraper {
  abstract get(query: string): Promise<string[]>;
}

type Scrapper = (url: string, querySelector: string) => string[];

(async () => {
  const res = await axios.get("https://washingtonsfoco.com/events/");

  const $ = cheerio.load(res.data);

  const extractHeading = (node: Record<string, any>): string =>
    "data" in node.children[0] ? (node.children[0] as any).data : "";

  const remove = (regex: string | RegExp) =>
    (title: string) => title.replace(regex, "").trim();
  const removeWhitespace = remove(/\n\t/g);
  const removeBoldNotation = remove(/\*{1,2}.+\*{1,2}\s+/g);
  const removeAnEveningWith = remove(/An Evening with /g);
  const removeSuffix = remove(/ –.+/g);

  const elements = $("h2.font1by25.font1By5remMD").toArray().map(extractHeading)
    .map(removeWhitespace)
    .map(removeBoldNotation)
    .map(removeAnEveningWith)
    .map(removeSuffix);

  console.log(elements, typeof elements);
})();
