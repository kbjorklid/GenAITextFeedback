import express, { Request, Response } from 'express';
import cors from 'cors';


const app = express();
app.use(cors());
app.use(express.json());
const port = 3000;

app.get('/api/hello', (req: Request, res: Response) => {
  res.json({ message: 'Hello, World' });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});