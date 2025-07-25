export interface Info {
    name: string;
    content: string;
    title: string;
    creationDate: string;
    modDate: string;
    subject: string;
    id: string;
}

export interface AnnotationRequest {
    type: number;
    point?: [number, number];
    rect?: [number, number, number, number];
    text?: string;
    icon?: number;
    crossOut?: boolean;
    textColor?: [number, number, number];
    fillColor?: [number, number, number];
    borderColor?: [number, number, number];
    borderWidth?: number;
}
