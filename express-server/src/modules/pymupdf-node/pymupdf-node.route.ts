import { PyMuPDFNodeService } from './pymupdf-node.service';
import documentsRouter from './documents/documents.route';
import { Router } from 'express';

const pymupdfNodeRouter = Router();

pymupdfNodeRouter.use(PyMuPDFNodeService.checkPyMuPDFReady);
pymupdfNodeRouter.use('/documents', documentsRouter);

export default pymupdfNodeRouter;
