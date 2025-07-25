import { DocInfo } from "@/types/document";
import DocumentPage from "./DocumentPage";

interface Props {
    docInfo: DocInfo;
    pageKeys: Record<number, string>;
}

const DocumentPageList: React.FC<Props> = ({ docInfo, pageKeys }) => {
    return (
        <div className="flex py-[16px] flex-col items-center gap-[8px]">
            {Array.from({ length: docInfo.pageCount }).map((_, index) => <DocumentPage key={pageKeys[index]} docId={docInfo.docId} pageIndex={index} />)}
        </div>
    );
};

export default DocumentPageList;
