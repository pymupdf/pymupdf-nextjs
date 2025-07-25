import { DocInfo } from "@/types/document";

interface Props {
    docInfos: Record<string, DocInfo>;
    selectedDocId: string;
    onSelectDocId: (docId: string) => void;
}

const DocumentSelector: React.FC<Props> = ({ docInfos, selectedDocId, onSelectDocId }) => {
    const docIds = Object.keys(docInfos);

    return (
        <select 
            className="outline-none p-[4px] border rounded-[4px] border-(--foreground-rgb) text-(--foreground-rgb) hover:bg-(--toolbar-button-hover-rgb)"
            value={selectedDocId} 
            onChange={(e) => onSelectDocId(e.target.value)}
        >
            {docIds.map(docId => <option key={docId} value={docId}>{docInfos[docId].title }</option>)}
        </select>
    );
}

export default DocumentSelector;
