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

  const prompt = `You are to act in a role defined by the user. This role is: '${reviewerRole}'. Please review the following LinkedIn about page
   for a candidate applying for the role of '${wantedRole}'. Provide feedback on the text, 
   focusing on areas for improvement, strengths, and overall effectiveness.

   <instructions>
     <instruction>Assume the role given to you. This role may be a person or a more generic role.</instruction>
     <instruction>The role is '${reviewerRole}'</instruction>
     <instruction>Give feedback as if you were that person, or a person in that role</instruction>
     <instruction>Assume the candidate who has written the text aims for this role or title: '${wantedRole}'</instruction>
     <instruction>Format the result using HTML</instruction>
     <instruction>Format the result so that it can be used in an existing HTML page, in a div tag.</instruction>
     <instruction>For headers, use h1-h3 tags. Do not use smaller header tags</instruction>
     <instruction>Do not include any markdown syntax. Specifically, do not include \`\`\`html or other back-tick markdown</instriction>
   </instructions>
  <textToReview>
  ${coverLetterText}
  </textToReview>`;

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
