function stripCodeFence(raw = "") {
  if (typeof raw !== "string") {
    return "";
  }
  const text = raw.trim();
  if (!text.startsWith("```")) {
    return text;
  }
  return text.replace(/^```[a-zA-Z]*\s*/, "").replace(/\s*```$/, "").trim();
}

function parseStructuredJson(content) {
  const cleanText = stripCodeFence(content);
  try {
    return JSON.parse(cleanText);
  } catch (error) {
    const match = cleanText.match(/\{[\s\S]*\}/);
    if (!match) {
      return null;
    }
    try {
      return JSON.parse(match[0]);
    } catch (nestedError) {
      return null;
    }
  }
}

module.exports = {
  parseStructuredJson,
  stripCodeFence,
};
