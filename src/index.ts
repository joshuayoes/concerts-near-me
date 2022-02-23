import updateAllPlaylists from "./commands/main";
import { argvFactory } from "./utils";

(async () => {
  const argv = argvFactory({
    filter: { type: "string" },
    dry: { type: "boolean", default: false },
  });

  await updateAllPlaylists({ filter: argv?.filter, dry: argv?.dry });
})();
