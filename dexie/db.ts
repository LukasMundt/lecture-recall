import Dexie, {Table} from 'dexie';
import {Box} from 'tldraw';
import {Pdf} from "@/components/pdf-editor/pdf.types";

export interface SavedData {
    name: string;
    shapes?: any[];
    pdf?: Pdf;
    lastModified: string;
}

export interface SavedShape {
    id: string;
    type: string;
    index?: string;

    [key: string]: any;
}

class PdfEditorDatabase extends Dexie {
    pdfs!: Table<SavedData>;

    constructor() {
        super('pdf-editor-db');
        this.version(1).stores({
            pdfs: 'name'
        });
    }
}

const db = new PdfEditorDatabase();

// Hilfsfunktion zum Speichern der Daten
export async function saveToDB(data: SavedData) {
    try {
        await db.pdfs.put(data);
    } catch (error) {
        console.error('Fehler beim Speichern in der Datenbank:', error);
    }
}

// Hilfsfunktion zum Laden der Daten
export async function loadFromDB(name: string): Promise<SavedData | undefined> {
    try {
        return await db.pdfs.get(name);
    } catch (error) {
        console.error('Fehler beim Laden aus der Datenbank:', error);
        return undefined;
    }
}

// Hilfsfunktion zum Laden der PDF-Daten
export async function loadPdfFromDB(name: string): Promise<{ pdf: any | null, shapes?: any[] }> {
    try {
        const savedData = await loadFromDB(name);
        if (!savedData?.pdf) return {pdf: null};

        // Konvertiere den String zurück in ein ArrayBuffer
        const binaryString = savedData.pdf.source;
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const sourceBuffer = bytes.buffer;

        // Konvertiere die Bounds in Box-Objekte
        const pages = savedData.pdf.pages.map((page: any) => ({
            ...page,
            bounds: new Box(
                page.bounds.x,
                page.bounds.y,
                page.bounds.w,
                page.bounds.h
            )
        }));

        return {
            pdf: {
                name: savedData.pdf.name,
                pages,
                source: sourceBuffer
            },
            shapes: savedData.shapes
        };
    } catch (error) {
        console.error('Fehler beim Laden der PDF aus der Datenbank:', error);
        return {pdf: null};
    }
}