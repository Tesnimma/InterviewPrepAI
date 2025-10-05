const { GoogleGenAI } = require("@google/genai");
const {
  conceptExplainPrompt,
  questionAnswerPrompt,
} = require("../utils/prompts");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

//@desc generate interview questions and answers using gemini
//@route POST /api/ai/generate-questions
//@access Private
const generateInterviewQuestions = async (req, res) => {
  try {
    const { role, experience, topicsToFocus, numberOfQuestions } = req.body;

    if (!role || !experience || !topicsToFocus || !numberOfQuestions) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }
    const prompt = questionAnswerPrompt(
      role,
      experience,
      topicsToFocus,
      numberOfQuestions
    );
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
    });

    let rawText = response.text;

    //clean the response to get valid JSON
    const cleanedText = rawText
      .replace(/^```json\s*/, "") // Remove starting ```json
      .replace(/```$/, "") // Remove ending ```
      .trim(); //remove extra spaces

    //now safe to parse

    const data = JSON.parse(cleanedText);
    res.status(200).json(data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "failed to generate questions", error: error.message });
  }
};

//@desc generate concept explanation using gemini
//@route POST /api/ai/generate-explanation
//@access Private
const generateConceptExplanation = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Please provide the question" });
    }

    const prompt = conceptExplainPrompt(question);

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
    });

    let rawText = response.text;

    //clean the response to get valid JSON
    const cleanedText = rawText
        .replace(/^```json\s*/, "") // Remove starting ```json
        .replace(/```$/, "") // Remove ending ```
        .trim(); //remove extra spaces

    //now safe to parse
    const data = JSON.parse(cleanedText);

    res.status(200).json(data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "failed to generate questions", error: error.message });
  }
};

module.exports = { generateInterviewQuestions, generateConceptExplanation };
