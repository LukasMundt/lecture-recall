import {Box, TLAssetId, TLShapeId} from "tldraw";

export interface PdfPage {
    src: string;
    bounds: Box;
    assetId: TLAssetId;
    shapeId: TLShapeId;
}

export interface Pdf {
    name: string;
    pages: PdfPage[];
    source: string | ArrayBuffer;
}