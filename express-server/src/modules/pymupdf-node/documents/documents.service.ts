import { Document } from "pymupdf-node";
import { PyMuPDFNodeService } from "../pymupdf-node.service";
import { randomUUID } from "crypto";
import { Info } from "../../../types/annotation";
import { PagesService } from "./pages/pages.service";
import { ErrorWithStatus } from "../../../types/error";

export class DocumentsService {
    private static DEFAULT_DOC_TITLE = 'Untitled'
    private static DOC_TITLE_COUNT = 0;
    private static documents: Record<string, Document> = {};

    public static getDocument(docId: string): Document {
        const doc = DocumentsService.documents[docId];

        if (!doc) {
            throw new ErrorWithStatus(404, `Document with ID '${docId}' was not found.`);
        }
        return doc;
    }

    private static setDocument(docId: string, doc: Document): void {
        DocumentsService.documents[docId] = doc;
    }

    public static async openDocument(file: ArrayBuffer): Promise<{ docId: string; pageCount: number; title: string }> {
        const pymupdf = PyMuPDFNodeService.pymupdf;
        const doc = new pymupdf.Document(null, file);
        const docId = randomUUID();

        DocumentsService.setDocument(docId, doc);
        return { docId, pageCount: doc.pages().length, title: DocumentsService.getDocTitle(doc) };
    }

    public static getMarkdown(doc: Document): string {
        const pymupdf4llm = PyMuPDFNodeService.pymupdf4llm;
        return pymupdf4llm.to_markdown(doc, { extract_words: false });
    }

    private static getDocTitle(doc: Document): string {
        const title = doc.metadata.title;

        if (title.length > 0) {
            return title;
        }
        const untitle = DocumentsService.DOC_TITLE_COUNT === 0
            ? DocumentsService.DEFAULT_DOC_TITLE
            : `${DocumentsService.DEFAULT_DOC_TITLE} (${DocumentsService.DOC_TITLE_COUNT})`;
      
        DocumentsService.DOC_TITLE_COUNT++;
        return untitle;
    }

    public static extractAllAnnotInformation(doc: Document): Record<number, Info[]> {
        const annots: Record<number, Info[]> = {};

        for (const page of doc.pages()) {
            annots[page.number] = PagesService.extractAllAnnotInformations(page);
        }
        return annots;
    }
}
