import express, { Request, Response } from 'express';
import cors from 'cors';


const app = express();
app.use(cors());
app.use(express.json());
const port = 3000;

app.get('/api/hello', (req: Request, res: Response) => {
  res.json({ message: 'Hello, World' });
});

// POST endpoint for cover letter review
app.post('/api/cover-letter-review', (req: Request, res: Response) => {
  // Extract data from request body
  const coverLetterText = req.body.coverLetterText;
  const wantedRole = req.body.wantedRole;
  const reviewerRole = req.body.reviewerRole;

  // TODO: Implement LLM integration and feedback logic here
  // Placeholder response for now
  const starRating = 3.5;
  const feedback = "This is placeholder feedback. LLM integration is pending.";

  res.json({
    starRating: starRating,
    feedback: feedback,
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
