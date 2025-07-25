import { Request, Response } from "express";
import { DocumentsService } from "./documents.service";

export class DocumentsController {
    public static async getDocument(req: Request, res: Response): Promise<void> {
        if (!req.file) {
            throw new Error('No file uploaded or file buffer is missing.');
        }
        const docInfo = await DocumentsService.openDocument(req.file.buffer.buffer);
        res.status(200).json({ docInfo });
    }
    
    public static getMarkdown(req: Request<{ docId: string }>, res: Response): void {
        const doc = DocumentsService.getDocument(req.params.docId);
        const markdown = DocumentsService.getMarkdown(doc);
        res.status(200).json({ markdown });
    }

    public static getAnnotations(req: Request<{ docId: string }>, res: Response): void {
        const doc = DocumentsService.getDocument(req.params.docId);
        
        res.status(200).json(DocumentsService.extractAllAnnotInformation(doc));
    }
}
