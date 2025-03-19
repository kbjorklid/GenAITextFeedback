import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());
const port = 3000;

// Check for GEMINI_API_KEY
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set in .env file");
}

// Initialize Google Gemini API
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'models/gemini-2.0-flash-exp' }); 
app.get('/api/hello', (req: Request, res: Response) => {
  res.json({ message: 'Hello, World' });
});

// POST endpoint for text review
app.post('/api/text-review', (req: Request, res: Response) => {
  // Extract data from request body
  const inputText = req.body.inputText;
  const wantedRole = req.body.wantedRole;
  const reviewerRole = req.body.reviewerRole;
  const textType = req.body.textType;

  const reviewerRolePart = isNonEmptyString(reviewerRole) ? `<instruction>Act in the role of '${reviewerRole}'</instruction>
     <instruction>Give feedback as if you were that person, or a person in that role</instruction>` : "";
  const wantedRolePart = isNonEmptyString(wantedRole) ? `<instruction>Assume the candidate who has written the text aims for this role or title: '${wantedRole}'</instruction>` : "";
  const textTypePart = isNonEmptyString(textType) ? `<instruction>Treat this text as the following: '${textType}'</instruction>` : "";

  const prompt = `Review the given text.

  <instructions>
    <instruction>Provide feedback on the text, focusing on areas for improvement, strengths, and overall effectiveness.</instruction>
     ${textTypePart}
     ${wantedRolePart}
     ${reviewerRolePart}
     <instruction>Format the result using HTML</instruction>
     <instruction>Format the result so that it can be used in an existing HTML page, in a div tag.</instruction>
     <instruction>For headers, use h1-h3 tags. Do not use smaller header tags</instruction>
  </instructions>
  <outputFormat>
    <description>
    Respond with a JSON object with the following keys:
    - "starRating": A star rating between 0.0 and 5.0, with half-star accuracy
    - "feedback": The HTML formatted feedback text
    </description>
    <example>
    {
      "starRating": 4.5,
      "feedback": "(feedback as html goes here)"
    }
    </example>
  </outputFormat>
  <textToReview>
  ${inputText}
  </textToReview>`;

  async function main() {
    const result = await model.generateContent(prompt);
    const response = result.response;
    var feedbackFromGemini = response.text();

    feedbackFromGemini = cleanupGeminiOutput(feedbackFromGemini);

    console.log("From Gemini:", feedbackFromGemini);
    
    var feedbackJson;
    try {
      feedbackJson = JSON.parse(feedbackFromGemini);
    } catch (e) {
      console.error("Failed to parse feedback as JSON", e);
      // Handle non-JSON response gracefully, or throw error
      feedbackJson = {
        starRating: 3, // Default rating in case of parsing error
        feedback: feedbackFromGemini // Fallback to raw text feedback
      };
    }


    res.json(feedbackJson);
  }

  main().catch(error => {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: "Failed to get feedback from Gemini API" });
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

function isNonEmptyString(str: string): boolean {
  return str.trim().length > 0;
}
function cleanupGeminiOutput(feedbackFromGemini: string): string {
  if (feedbackFromGemini.startsWith("```json")) {
    feedbackFromGemini = feedbackFromGemini.slice("```json".length).trim();
  }
  if (feedbackFromGemini.endsWith("```")) {
    feedbackFromGemini = feedbackFromGemini.slice(0, -3).trim();
  }
  return feedbackFromGemini;
}

