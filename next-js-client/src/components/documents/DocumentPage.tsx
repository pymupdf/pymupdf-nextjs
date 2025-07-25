import { useEffect, useState } from "react";
import { env } from "../../../env";
import Image from "next/image";
import Spinner from "../loading/Spinner";

interface Props {
    docId: string;
    pageIndex: number;
}

const DocumentPage: React.FC<Props> = ({ docId, pageIndex }) => {
    const [pageImage, setPageImage] = useState<string | null>(null);

    useEffect(() => {
        fetch(`${env.baseUrl}/pymupdf-node/documents/${docId}/pages/${pageIndex}/image`)
            .then(res => res.json())
            .then(page => setPageImage(page.image));
    }, [docId, pageIndex]);

    return (
       <div className="w-[550px] h-[800px] relative">
            {pageImage ? < Image className="object-cover w-[550px] h-[800px]" width={550} height={800} src={`data:image/png;base64,${pageImage}`} alt={pageIndex.toString()} /> : <Spinner />}
       </div> 
    );
}

export default DocumentPage;
