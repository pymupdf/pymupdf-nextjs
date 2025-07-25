import { Router } from "express";
import pymupdfNodeRouter from "./modules/pymupdf-node/pymupdf-node.route";

const appRouter = Router();

appRouter.use('/pymupdf-node', pymupdfNodeRouter);

export default appRouter;
