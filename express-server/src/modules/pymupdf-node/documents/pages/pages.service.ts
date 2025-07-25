import { Annot, Page } from "pymupdf-node";
import { AnnotationRequest, Info } from "../../../../types/annotation";
import { BinaryUtil } from "../../../../utils/binary-util";
import { PyMuPDFNodeService } from "../../pymupdf-node.service";
import { ErrorWithStatus } from "../../../../types/error";

export class PagesService {
    public static renderImage(page: Page): string {
        return BinaryUtil.uint8ToBase64(
            page.get_pixmap()
                .tobytes()
        );
    }

    public static extractAllAnnotInformations(page: Page): Info[] {
        const annotInfomations: Info[] = [];

        for (const annot of page.annots()) {
            annotInfomations.push(annot.info);
        }
        return annotInfomations;
    }
    
    public static createAnnotation(page: Page, annotation: AnnotationRequest): Info {
        const pymupdf = PyMuPDFNodeService.pymupdf;
        let annot: Annot;
        switch (annotation.type) {
            case pymupdf.Constant.PDF_ANNOT_TEXT: // 0
                annot = page.add_text_annot(
                    annotation.point ?? [50, 50], 
                    annotation.text ?? 'Text annotation',
                );
                break;
            case pymupdf.Constant.PDF_ANNOT_FREE_TEXT: // 2
                annot = page.add_freetext_annot(
                    annotation.rect ?? [300, 300, 400, 400], 
                    annotation.text ?? 'FreeText annotation', 
                    {
                        border_color: annotation.borderColor ?? [0.5, 0.5, 0.5],
                        text_color: annotation.textColor ?? [1, 1, 1],
                        fill_color: annotation.fillColor ?? [0, 0, 0],
                        border_width: annotation.borderWidth ?? 1,
                    }
                );
                break;
            case pymupdf.Constant.PDF_ANNOT_CIRCLE: // 5
                annot = page.add_circle_annot(annotation.rect ?? [100, 100, 200, 200]);
            case pymupdf.Constant.PDF_ANNOT_REDACT: // 12
                annot = page.add_redact_annot(
                    annotation.rect ?? [100, 400, 200, 500],
                    { 
                        text: annotation.text ?? 'Redact annotation', 
                        text_color: annotation.textColor ?? [0, 0, 0],
                        fill: annotation.fillColor ?? [1, 1, 1],
                    },
                );
                break;
            case pymupdf.Constant.PDF_ANNOT_STAMP: // 13
                annot = page.add_stamp_annot(annotation.rect ?? [200, 200, 300, 300], annotation.icon ?? 0);
                break;
            default:
                throw new ErrorWithStatus(400, `Unsupported annotation type: ${annotation.type}. In this example, only types 0, 2, 5, 12, and 13 are supported.`);
        }
        annot.update();
        return annot.info;
    }
}
