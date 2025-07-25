"use client";

import { ChangeEvent, useEffect, useState } from "react";
import ReactModal from "react-modal";
import { env } from "../../../env";
import Spinner from "../loading/Spinner";

type RecursiveValue = string | number | boolean | { [key: string]: RecursiveValue };

interface Body {
    selected: Record<string, RecursiveValue>;
    readonly?: string[];
    parse?: string[];
}

const ListId = '__LIST_ID__';
interface BodyWithList extends Body {
    list: Record<string | number, Record<string, RecursiveValue> & { [ ListId ]: number }>;
    selected: Record<string, RecursiveValue> & { [ ListId ]: number };
}

interface Request {
    method: 'GET' | 'POST';
    endPoint: string;
    body?: Body | BodyWithList;
    pathParams?: Record<string, string>;
};

interface Props {
    isOpen: boolean;
    docId: string;
    onRequestClose: () => void;
    refreshPageKey: (pageIndex: number) => void;
}

const requests: Request[] = [
    {
        method: 'GET',
        endPoint: '/pymupdf-node/documents/:docId/markdown',
    },
    {
        method: 'GET',
        endPoint: '/pymupdf-node/documents/:docId/annotations',
    },
    {
        method: 'GET',
        endPoint: '/pymupdf-node/documents/:docId/pages/:pageIndex/annotations',
        pathParams: { pageIndex: '0' },
    },
    {
        method: 'POST',
        endPoint: '/pymupdf-node/documents/:docId/pages/:pageIndex/annotations',
        pathParams: { pageIndex: '0' },
        body: { 
            selected: { [ListId]: 0, annotation: { type: 0, point: '[50, 50]', text: 'Text annotation' } },
            list: {
                Text: { [ListId]: 0, annotation: { type: 0, point: '[50, 50]', text: 'Text annotation' } },
                FreeText: { [ListId]: 1, annotation: { type: 2, rect: '[300, 300, 400, 400]', text: 'FreeText annotation', textColor: '[1, 1, 1]', fillColor: '[0, 0, 0]' } },
                Circle: { [ListId]: 2, annotation: { type: 5, rect: '[100, 100, 200, 200]' } },
                Redact: { [ListId]: 3, annotation: { type: 12, rect: '[100, 400, 200, 500]', text: 'Redact annotation', textColor: '[1, 1, 1]', fillColor: '[0, 0, 0]' } },
                Stamp: { [ListId]: 4, annotation: { type: 13, rect: '[200, 200, 300, 300]', icon: 0 } },
            },
            readonly: ['annotation.type'],
            parse: ['annotation.rect', 'annotation.point', 'annotation.textColor', 'annotation.fillColor'],
        },
    },
    {
        method: 'POST',
        endPoint: '/pymupdf-node/documents/:docId/pages/:pageIndex/apply',
        pathParams: { pageIndex: '0' },
    }
];

const RequestModal: React.FC<Props> = ({ docId, isOpen, onRequestClose, refreshPageKey }) => {
    const [selectedRequest, setSelectedRequest] = useState<Request>(JSON.parse(JSON.stringify(requests[0])));
    const [response, setResponse] = useState<string | null>(null);
    const [requestLoading, setRequestLoading] = useState(false);

    const selectRequest = (e: ChangeEvent<HTMLSelectElement>) => {
        const request = requests.find(r => `${r.method} ${r.endPoint}` === e.target.value);

        if (!request) {
            throw new Error('');
        }
        setResponse(null);
        setSelectedRequest(JSON.parse(JSON.stringify(request)));
    }
    const getRequestUrl = (request: Request, withMethod: boolean = false): string => {
        let path = request.endPoint.replace(':docId', docId);
    
        if (request.pathParams) {
            for (const [key, value] of Object.entries(request.pathParams)) {
                path = path.replace(`:${key}`, encodeURIComponent(String(value)));
            }
        }
        // if (request.queryParams) {
        //     const query = Object.entries(request.queryParams)
        //         .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        //         .join('&');
        //     if (query) {
        //         path += `?${query}`;
        //     }
        // }
        return withMethod ? `${request.method} ${path}` : path;
    };
    const request = async () => {
        setResponse(null);
        setRequestLoading(true);
    
        try {
            const requestUrl = getRequestUrl(selectedRequest);
            const body = JSON.stringify(parseBody(selectedRequest.body?.selected ?? {}, selectedRequest.body?.parse ?? []), null, 2);
            const res = await fetch(
                `${env.baseUrl}${requestUrl}`, 
                { 
                    method: selectedRequest.method, 
                    body: selectedRequest.method === 'POST' ? body : null,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                },
            );
            const json = await res.json();
            if (
                selectedRequest.method === 'POST' && 
                selectedRequest.pathParams && 
                typeof selectedRequest.pathParams.pageIndex === 'string' &&
                !Number.isNaN(Number(selectedRequest.pathParams.pageIndex))
            ) {
                refreshPageKey(Number(selectedRequest.pathParams.pageIndex));
            }
            setResponse(JSON.stringify(json ?? '{}', null, 2));
        } catch (e) {
            setResponse(e instanceof Error ? e.message : JSON.stringify(e, null, 2));
        } finally {
            setRequestLoading(false);
        }
    };
    const renderBody = (body: Record<string, RecursiveValue>, readonly: string[] = [], keys: string[] = [], depth: number = 1) => {
        return Object.keys(body).map(key => {
            if (key === ListId) {
                return;
            }
            const value = body[key];
            const isNasted = typeof value === 'object';
            const newKeys = [ ...keys, key ];
            const path = newKeys.join('.');
            const isReadOnly = readonly.includes(path);
            const onChange = (value: number | string | boolean) => setSelectedRequest(prev => {
                const request = { ...prev };
                const keys = [ ...newKeys ];
                const lastKey = keys.pop()!;
                const lastObj = keys.reduce((acc, k) => {
                    if (typeof acc[k] !== 'object') {
                        throw new Error(`Invalid path: key "${k}" does not lead to an object in the nested structure.`);
                    }
                    return acc[k]
                }, request.body!.selected);

                lastObj[lastKey] = value;

                return request;
            });

            return (
                <div 
                    key={path} 
                    style={{ paddingLeft: 16 * depth }}
                    className={isNasted ? "flex flex-col gap-[4px]" : "flex gap-[4px]"}
                >
                    <span>{`${key}:`}</span>
                    {isNasted && renderBody(value, readonly, newKeys, depth + 1)}
                    {
                        !isNasted && 
                        (
                            <div className="w-full">
                                {
                                    typeof value === 'number' && 
                                    <input 
                                        className="w-full outline-none rounded-[4px] border-[4px] bg-(--modal-input-rgb) border-(--modal-input-rgb) focus:border-blue-700" 
                                        onChange={e => onChange(Number(e.target.value))} 
                                        pattern="[0-9]*" 
                                        readOnly={isReadOnly} 
                                        value={value} 
                                    />
                                }
                                {
                                    typeof value === 'string' && 
                                    <input 
                                        className="w-full outline-none rounded-[4px] border-[4px] bg-(--modal-input-rgb) border-(--modal-input-rgb) focus:border-blue-700" 
                                        readOnly={isReadOnly} 
                                        value={value} 
                                        onChange={e => onChange(e.target.value)}
                                    />
                                }
                                {
                                    typeof value === 'boolean' && 
                                    <input 
                                        type="checkbox" 
                                        readOnly={isReadOnly} 
                                        checked={value} 
                                        onChange={e => onChange(Boolean(e.target.checked))} 
                                    />
                                }
                            </div>
                        )
                    }
                </div>
            );
        })
    };
    const renderBodySelector = (selected: BodyWithList['selected'], list: BodyWithList['list']) => {
        const listKeys = Object.keys(list);
        const selectedValue = listKeys.find(key => list[key][ListId] === selected[ListId]);

        if (typeof selectedValue === 'undefined') {
            throw new Error('Selected value does not match any item in the list.');
        }
        const onChange = (e: ChangeEvent<HTMLSelectElement>) => {
            const selectedKey = listKeys.find(key => key === e.target.value);
            if (typeof selectedKey === 'undefined') {
                throw new Error('Selected value does not match any item in the list.');
            }
            const selected = list[selectedKey];
            setSelectedRequest(prev => {
                const request = { ...prev };

                if (typeof request.body === 'undefined') {
                    throw new Error('Unexpected state: request.body is missing. This should not happen.');
                }
                request.body = { ...request.body, selected: selected };
                return request;
            })
        }
        return (
            <select 
                value={selectedValue} 
                onChange={onChange}
                className="w-full p-[8px] bg-(--modal-input-rgb) text-(--foreground-rgb) rounded-[4px] outline-none"
            >
                {listKeys.map(key => <option key={key} value={key}>{key}</option>)}
            </select>
        );
    };
    const parseBody = (body: Record<string, RecursiveValue>, parse: string[] = [], keys: string[] = []) => {
        const copied = JSON.parse(JSON.stringify(body));
        
        Object.keys(copied).forEach(key => {
            const value = copied[key];
            const newKeys = [...keys, key];

            if (typeof value === 'object') {
                copied[key] = parseBody(value, parse, newKeys);
            }
            if (typeof value === 'string' && parse.includes(newKeys.join('.'))) {
                try {
                    copied[key] = JSON.parse(value);
                } catch {
                    throw new Error(`Syntax error: failed to parse value at key "${newKeys.join('.')}". Received: ${JSON.stringify(value)}`);
                } 
            }
        });

        delete copied[ListId];

        return copied;
    };


    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = 'visible'
            };
        }
        document.body.style.overflow = 'visible';
    }, [isOpen]);

    return (
        <ReactModal
            style={{
                overlay: {
                    backgroundColor: 'var(--modal-overlay-rgba)',
                    zIndex: 2,
                },
                content: {
                    padding: 32,
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 720,
                    height: 826,
                    backgroundColor: 'var(--modal-content-rgb)',
                    border: '',
                    zIndex: 2,
                },
            }}
            ariaHideApp={false}
            isOpen={isOpen}
            onRequestClose={() => {
                onRequestClose();
                setResponse(null);
            }}
        >
            {requestLoading && <Spinner />}
            <div className="flex flex-col gap-[24px]">
                <header className='flex justify-between'>
                    <div className="text-[24px] font-bold" >REST API Console</div>
                    <button></button>
                </header>
                <main className='flex flex-col items-start gap-[16px]'>
                    <section className='flex flex-col gap-[8px] w-full'>
                        <div className="text-[16px]">Select Endpoint:</div>
                        <div>
                            <select 
                                className="w-full p-[8px] bg-(--modal-input-rgb) text-(--foreground-rgb) rounded-[4px] outline-none"
                                value={`${selectedRequest.method} ${selectedRequest.endPoint}`} 
                                onChange={selectRequest}
                            >
                                {requests.map(request => {
                                    const value = `${request.method} ${request.endPoint}`;
                                    return  <option key={value} value={value}>{value}</option>;
                                })}
                            </select>
                        </div>
                    </section>
                    {
                        selectedRequest.pathParams && 
                        <section className="w-full flex flex-col gap-[8px]">
                            <div className="text-[16px]">Path Params:</div>
                            <div className="pl-[16px] flex flex-col gap-[4px]" >
                                {Object.keys(selectedRequest.pathParams).map(key => 
                                    (<div 
                                        key={`${docId}-${key}`} 
                                        className="w-full flex items-center gap-[4px]"
                                    >
                                        <span className="text-[14px]">{`${key}:`}</span>
                                        <input 
                                            className="w-full outline-none border-[4px] rounded-[4px] text-(--foreground-rgb) bg-(--modal-input-rgb) border-(--modal-input-rgb) focus:border-blue-700"
                                            value={selectedRequest.pathParams![key]} 
                                            onChange={e => setSelectedRequest({ ...selectedRequest, pathParams: { ...selectedRequest.pathParams, [key]: e.target.value }})}
                                        />
                                    </div>)
                                )}
                            </div>
                        </section>
                    }
                    {/* {
                        selectedRequest.queryParams &&
                        <section className="flex flex-col gap-[8px]">
                            <div className="text-[16px]">Query Params:</div>
                            <div className="pl-[16px]"></div>
                        </section>
                    } */}
                    {
                        selectedRequest.body &&
                        <section className="flex flex-col gap-[8px] w-full">
                            <div className="text-[16px]">Body:</div>
                            {'list' in selectedRequest.body && renderBodySelector(selectedRequest.body.selected, selectedRequest.body.list)}
                            {renderBody(selectedRequest.body.selected, selectedRequest.body.readonly)}
                        </section>
                    }
                    <button 
                        onClick={request}
                        className="px-[12px] py-[6px] rounded-[4px] bg-(--modal-input-rgb) hover:bg-(--modal-button-hover-rgb)"
                    >Request</button>
                </main>
                <footer className="flex flex-col gap-[16px]">
                    <section className="flex flex-col gap-[12px]">
                        <div className="text-[16px]">Request:</div>
                        <div className="p-[16px] rounded-[4px] text-[14px] bg-(--modal-input-rgb) whitespace-pre-wrap" >{getRequestUrl(selectedRequest, true)}</div>
                    </section>
                    <section className="flex flex-col gap-[12px]">
                        <div className="text-[16px]">Response:</div>
                        <div className="p-[16px] rounded-[4px] whitespace-pre-wrap w-full max-h-[360px] overflow-y-auto bg-(--modal-input-rgb)">{response}</div>
                    </section>
                </footer>
            </div>
        </ReactModal>
    );
}

export default RequestModal;
