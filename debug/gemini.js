const GeminiTranslator = require("../src/gemini");
require("dotenv").config({ path: "working.env" });

const trsGemini = new GeminiTranslator();

async function debug() {
  const data = await trsGemini.translate(
    JSON.stringify(["\\村長の家に入ります。", "bsyukokorozannnen"])
  );
  console.log(data);
}

debug();
