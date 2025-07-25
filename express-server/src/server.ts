import cors from 'cors'
import express, { NextFunction, Request, Response } from 'express'
import appRouter from './router';
import { PyMuPDFNodeService } from './modules/pymupdf-node/pymupdf-node.service';
import { ErrorWithStatus } from './types/error';

const app = express();
const PORT = 8080;
const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(err.constructor.name);
  console.log(err.message);
  if (err instanceof ErrorWithStatus) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  res.status(500).json({ error: 'Internal Server Error' });
}

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(appRouter);
app.use(errorMiddleware);

app.listen(PORT, () => {
  PyMuPDFNodeService.initializePyMuPDF();
  console.log(`Server started on ${PORT}`);
})
