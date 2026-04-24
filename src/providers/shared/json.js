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

function parseJsonWithAutoRepair(text) {
  if (typeof text !== "string" || !text.trim()) {
    return null;
  }

  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch (error) {
    // ignore and continue with repairs
  }

  // 修复常见错误：多余逗号
  let repaired = trimmed.replace(/,\s*([}\]])/g, "$1");

  // 修复常见错误：模型偶发截断导致缺失右括号
  const openSquare = (repaired.match(/\[/g) || []).length;
  const closeSquare = (repaired.match(/\]/g) || []).length;
  if (closeSquare < openSquare) {
    repaired += "]".repeat(openSquare - closeSquare);
  }

  const openCurly = (repaired.match(/\{/g) || []).length;
  const closeCurly = (repaired.match(/\}/g) || []).length;
  if (closeCurly < openCurly) {
    repaired += "}".repeat(openCurly - closeCurly);
  }

  try {
    return JSON.parse(repaired);
  } catch (error) {
    return null;
  }
}

function parseStructuredJson(content) {
  const cleanText = stripCodeFence(content);
  const direct = parseJsonWithAutoRepair(cleanText);
  if (direct) {
    return direct;
  }

  const objectLike = cleanText.match(/\{[\s\S]*/);
  if (objectLike) {
    return parseJsonWithAutoRepair(objectLike[0]);
  }
  return null;
}

module.exports = {
  parseJsonWithAutoRepair,
  parseStructuredJson,
  stripCodeFence,
};
