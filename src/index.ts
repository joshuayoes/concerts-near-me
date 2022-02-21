import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import updateAllPlaylists from "./commands/main";

(async () => {
  const argv = yargs(hideBin(process.argv)).options({
    filter: { type: "string" },
    dry: { type: "boolean", default: false },
  }).parseSync();

  await updateAllPlaylists({ filter: argv?.filter, dry: argv?.dry });
})();
