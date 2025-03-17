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

// POST endpoint for cover letter review
app.post('/api/cover-letter-review', (req: Request, res: Response) => {
  // Extract data from request body
  const coverLetterText = req.body.coverLetterText;
  const wantedRole = req.body.wantedRole;
  const reviewerRole = req.body.reviewerRole;

  const prompt = `You are to act in a role defined by the user. This role is: '${reviewerRole}'. Please review the following cover letter
   for a candidate applying for the role of '${wantedRole}'. Provide feedback on the cover letter, 
   focusing on areas for improvement, strengths, and overall effectiveness.

   Format the result using HTML, but notice that the content is going to be shown inline, so assume the
   content will be placed inside a 'div' on an existing (wrapping) html page.

  Cover Letter:
  ${coverLetterText}`;

  async function main() {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const feedbackFromGemini = response.text();

    // Basic star rating (can be improved based on feedback analysis)
    const starRating = feedbackFromGemini.includes("strengths") ? 4 : 3; 

    res.json({
      starRating: starRating,
      feedback: feedbackFromGemini,
    });
  }

  main().catch(error => {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: "Failed to get feedback from Gemini API" });
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
