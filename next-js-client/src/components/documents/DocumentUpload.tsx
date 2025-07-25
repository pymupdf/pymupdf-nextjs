'use client';

import { DocInfo } from "@/types/document";
import { env } from "../../../env";
import FileDropZone from "../upload/FileDropZone";

interface Props {
    onUploadDocuments: (docInfos: DocInfo[]) => void;
    hasDocInfo: boolean;
}

const DocumentUpload: React.FC<Props> = ({ onUploadDocuments, hasDocInfo }) => {
    const uploadFile = async (file: File): Promise<DocInfo> => {
        const formData = new FormData();
        formData.append('doc', file);

        const res = await fetch(`${env.baseUrl}/pymupdf-node/documents`, { method: 'POST', body: formData });
        const result = await res.json();

        return result.docInfo;
    };   
    const handleFileDropdown = async (files: File[]): Promise<void> => {
        const result = await Promise.all(files.map(uploadFile));
        onUploadDocuments(result);
    };

    return (
        <div className={hasDocInfo ? 'w-full h-[48px]' : 'w-full h-full'} >
            <FileDropZone onFilesDropped={handleFileDropdown} />
        </div>
    )
};

export default DocumentUpload;
