'use client';

import { useState } from "react";
import DocumentUpload from "./DocumentUpload"
import { DocInfo } from "@/types/document";
import DocumentPageList from "./DocumentPageList";
import DocumentToolbar from "../toolbar/DocumentToolbar";

const DocumentManager: React.FC = () => {
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const [docInfos, setDocInfos] = useState<Record<string, DocInfo>>({});
    const [pageKeys, setPageKeys] = useState<Record<number, string>>({});
    const docIds = Object.keys(docInfos);
    const hasDocInfo = docIds.length > 0;

    const addDocuments = (docInfos: DocInfo[]) => {
        if (selectedDocId === null) {
            setSelectedDocId(docInfos[0].docId);
            setPageKeys(createPageKeys(docInfos[0].pageCount));
        }
        setDocInfos(prev => {
            const documents = { ...prev };
            docInfos.forEach(docInfo => documents[docInfo.docId] = docInfo);
            return documents;
        });
    };
    const selectDocId = (docId: string) => {
        setSelectedDocId(docId);
        setPageKeys(createPageKeys(docInfos[docId].pageCount));
    };
    const createPageKeys = (count: number) => Array
        .from({ length: count })
        .reduce<Record<number, string>>((acc, _, index) => {
            acc[index] = getPageKey(index);
            return acc;
        }, {});
    const getPageKey = (pageIndex: number) => `${pageIndex}-${new Date().getTime()}`;
    const refreshPageKey = (pageIndex: number) => {
        setPageKeys(prev => ({ ...prev, [pageIndex]: getPageKey(pageIndex) }))
    }

    return (
        <div className={hasDocInfo ? "w-full h-fit p-[16px]" : "w-full h-full p-[16px]"}>
            <DocumentUpload onUploadDocuments={addDocuments} hasDocInfo={hasDocInfo} />
            {
                selectedDocId && 
                <div className="mt-[16px] bg-(--viewer-bg-rgb) rounded-[4px] overflow-hidden">
                    <DocumentToolbar 
                        docInfos={docInfos}
                        selectedDocId={selectedDocId}
                        refreshPageKey={refreshPageKey}
                        onSelectDocId={selectDocId} 
                    />
                    <DocumentPageList docInfo={docInfos[selectedDocId]} pageKeys={pageKeys} />
                </div>
            }
        </div>
    );
}

export default DocumentManager;
