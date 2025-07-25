import { Router } from "express"
import { PagesController } from "./pages.controller";

const pagesRouter = Router({ mergeParams: true });

pagesRouter.get('/:pageIndex/image', PagesController.getImage);
pagesRouter.get('/:pageIndex/annotations', PagesController.getAnnotInfomations);
pagesRouter.post('/:pageIndex/annotations', PagesController.postAnnotation);
pagesRouter.post('/:pageIndex/apply', PagesController.applyRedaction);

export default pagesRouter;
