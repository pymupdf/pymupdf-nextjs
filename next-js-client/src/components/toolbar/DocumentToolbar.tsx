'use client';

import { DocInfo } from "@/types/document";
import DocumentSelector from "./DocumentSelector";
import RequestModal from "../modal/RequestModal";
import { useState } from "react";

interface Props {
    docInfos: Record<string, DocInfo>;
    selectedDocId: string;
    onSelectDocId: (docId: string) => void;
    refreshPageKey: (pageIndex: number) => void;
}

const DocumentToolbar: React.FC<Props> = ({ selectedDocId, docInfos, onSelectDocId, refreshPageKey }) => {
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    
    return (
        <div className="p-[12px] flex justify-between items-center bg-(--toolbar-bg-rgb)">
            <section className="left">
                <DocumentSelector 
                    docInfos={docInfos}
                    selectedDocId={selectedDocId}
                    onSelectDocId={onSelectDocId}
                />
            </section>
            <section className="center"></section>
            <section className="right">
                <button 
                    className="text-(--foreground-rgb) border-(--forground-rgb) outline-none border p-[6px] rounded-[4px] hover:bg-(--toolbar-button-hover-rgb)"
                    onClick={() => setIsRequestModalOpen(prev => !prev)}
                >
                    Rest API Console
                </button>
                <RequestModal 
                    docId={selectedDocId}
                    isOpen={isRequestModalOpen} 
                    onRequestClose={() => setIsRequestModalOpen(false)} 
                    refreshPageKey={refreshPageKey}
                />
            </section>
        </div>
    );
}

export default DocumentToolbar;
