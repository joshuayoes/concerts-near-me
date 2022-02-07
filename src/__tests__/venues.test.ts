import test from "ava";
import { extractPlaylistId } from "../venues";

test("extractPlaylistId produces correct value", (t) => {
  const cases: { input: string; expected: string }[] = [
    {
      input:
        "https://open.spotify.com/playlist/05j0D1858DymAMhXhQ6hsD?si=8c39a48bb513450b",
      expected: "05j0D1858DymAMhXhQ6hsD",
    },
    {
      input: "https://open.spotify.com/playlist/05j0D1858DymAMhXhQ6hsD",
      expected: "05j0D1858DymAMhXhQ6hsD",
    },
  ];

  cases.forEach(({ input, expected }) => {
    const result = extractPlaylistId(input);
    t.is(result, expected);
  });
});
