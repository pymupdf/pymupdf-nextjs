import { NextFunction, Request, Response } from 'express';
import { loadPyMuPDF, loadPyMuPDF4LLM } from 'pymupdf-node';

export class PyMuPDFNodeService {
    public static pymupdf: Awaited<ReturnType<typeof loadPyMuPDF>>;
    public static pymupdf4llm: Awaited<ReturnType<typeof loadPyMuPDF4LLM>>;

    public static async initializePyMuPDF(): Promise<void> {
        PyMuPDFNodeService.pymupdf = await loadPyMuPDF('node_modules/pymupdf-node/pymupdf/pymupdf-1.26.0-cp312-abi3-pyodide_2024_0_wasm32.whl');
        PyMuPDFNodeService.pymupdf4llm = await loadPyMuPDF4LLM('node_modules/pymupdf-node/pymupdf/pymupdf4llm-0.0.24-py3-none-any.whl');
    }

    public static checkPyMuPDFReady(_req: Request, res: Response, next: NextFunction): void {
        if (PyMuPDFNodeService.pymupdf === null || PyMuPDFNodeService.pymupdf4llm === null) {
            res.status(503).json({ error: 'PyMuPDF is not initialized yet. Please try again later.' });
            return;
        }   
        next();
    }
}
