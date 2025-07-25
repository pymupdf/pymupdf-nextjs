import { Request, Response } from "express";
import { PagesService } from "./pages.service";
import { DocumentsService } from "../documents.service";
import { AnnotationRequest } from "../../../../types/annotation";
import { ErrorWithStatus } from "../../../../types/error";

export class PagesController {
    public static getImage(req: Request<{ docId: string; pageIndex: number }>, res: Response): void {
        const doc = DocumentsService.getDocument(req.params.docId);
        const pages = doc.pages();
        const pageIndex = req.params.pageIndex;

        if (pageIndex >= pages.length) {
            throw new ErrorWithStatus(400, `Page index ${pageIndex} is out of bounds. Document has ${pages.length} pages (0 to ${pages.length - 1}).`);
        }
        res.status(200).json({ image: PagesService.renderImage(doc.pages()[pageIndex]) });
    }

    public static getAnnotInfomations(req: Request<{ docId: string; pageIndex: number }>, res: Response): void {
        const doc = DocumentsService.getDocument(req.params.docId);
        const pages = doc.pages();
        const pageIndex = req.params.pageIndex;

        if (pageIndex >= pages.length) {
            const error = new ErrorWithStatus(400, `Page index ${pageIndex} is out of bounds. Document has ${pages.length} pages (0 to ${pages.length - 1}).`);
            console.log(error instanceof ErrorWithStatus, error instanceof Error);
            throw error;
        }
        res.status(200).json(PagesService.extractAllAnnotInformations(pages[pageIndex]));
    }

    public static postAnnotation(req: Request<{ docId: string; pageIndex: number }, {}, { annotation: AnnotationRequest }>, res: Response): void {
        const doc = DocumentsService.getDocument(req.params.docId);
        const page = doc.pages()[req.params.pageIndex];

        res.status(200).json(PagesService.createAnnotation(page, req.body.annotation));
    }

    public static applyRedaction(req: Request<{ docId: string; pageIndex: number }>, res: Response): void {
        const doc = DocumentsService.getDocument(req.params.docId);
        const page = doc.pages()[req.params.pageIndex];

        page.apply_redactions();
        res.status(200).json({});
    }
}
