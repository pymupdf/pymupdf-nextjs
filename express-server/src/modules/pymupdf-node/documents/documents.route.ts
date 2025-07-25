import { Router } from 'express';
import multer from 'multer';
import { DocumentsController } from './documents.controller';
import pagesRouter from './pages/pages.route';

const documentsRouter = Router();
const upload = multer();

documentsRouter.post('/', upload.single('doc'), DocumentsController.getDocument);
documentsRouter.get('/:docId/annotations', DocumentsController.getAnnotations);
documentsRouter.get('/:docId/markdown', DocumentsController.getMarkdown);
documentsRouter.use('/:docId/pages', pagesRouter);

export default documentsRouter;
