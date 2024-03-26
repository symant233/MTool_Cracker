const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiTranslator {
  constructor() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = genAI.getGenerativeModel({ model: "gemini-pro" });
    this.chat = this.model.startChat({
      history: [
        {
          role: "user",
          parts: [
            {
              text: '你将作为一个翻译官，将给出的日文语句翻译成中文，且翻译要尽量生动，不要使用正式的书面语言，任何的英文数字以及标点均不翻译。请注意，输入的格式为字符串数组形式，输出需要给出一个JSON对象，键为原文的字符串，值为翻译的字符串。输入示例："["セーブ","寝る"]，输出示例："{"セーブ":"保存","寝る":"睡觉"}"。',
            },
          ],
        },
        {
          role: "model",
          parts: [{ text: "明白，请提供需要翻译的内容。" }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 2048,
      },
    });
  }

  async translate(text) {
    // console.log(text);
    const result = await this.chat.sendMessage(text);
    const response = await result.response;
    let str = response.text();
    str = str.replaceAll(/```json|```/g, "");
    // console.log(str);
    return JSON.parse(str);
  }
}

module.exports = GeminiTranslator;
