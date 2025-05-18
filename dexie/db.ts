import Dexie, {Table} from 'dexie';
import {Pdf} from "@/components/pdf-editor/pdf.types";

export interface SavedPdf {
    name: string;
    pdf?: Pdf;
    lastModified: string;
}

export interface SavedShapes {
    name: string;
    shapes?: SavedShape[];
    lastModified: string;
}

export interface SavedShape {
    id: string;
    type: string;
    index?: string;

    [key: string]: any;
}

export interface SavedPosition {
    name: string;
    x: number;
    y: number;
}

class PdfEditorDatabase extends Dexie {
    pdfs!: Table<SavedPdf>;
    scrollPositions!: Table<SavedPosition>;
    shapes!: Table<SavedShapes>;

    constructor() {
        super('pdf-editor-db');
        this.version(1).stores({
            pdfs: 'name'
        });
        this.version(1).stores({
            shapes: 'name'
        })
        this.version(1).stores({
            scrollPositions: 'name'
        });
    }
}

const db = new PdfEditorDatabase();

// Hilfsfunktion zum Speichern der Daten
export async function savePdfToDB(data: SavedPdf) {
    try {
        await db.pdfs.put(data);
    } catch (error) {
        console.error('Fehler beim Speichern in der Datenbank:', error);
    }
}

// Hilfsfunktion zum Laden der Daten
export async function loadPdfFromDB(name: string): Promise<SavedPdf | undefined> {
    try {
        return await db.pdfs.get(name);
    } catch (error) {
        console.error('Fehler beim Laden aus der Datenbank:', error);
        return undefined;
    }
}

export async function saveShapesToDB(data: SavedShapes) {
    try {
        await db.shapes.put(data);
    } catch (error) {
        console.error('Fehler beim Speichern in der Datenbank:', error);
    }
}

export async function loadShapesFromDB(name: string): Promise<SavedShapes | undefined> {
    try {
        return await db.shapes.get(name);
    } catch (error) {
        console.error('Fehler beim Laden aus der Datenbank:', error);
        return undefined;
    }
}

export async function loadRecentLocalPdfsFromDB(): Promise<{name: string, lastModified: Date}[]> {
    try {
        return await db.shapes.toArray().then((pdfs) => pdfs.map((pdf) => ({name: pdf.name, lastModified: new Date(pdf.lastModified)})));
    } catch (error) {
        console.error('Fehler beim Laden der Namen der gespeicherten PDFs:', error);
        return [];
    }
}

// Hilfsfunktion zum Laden der Scrollposition
export async function loadScrollPositionsFromDB(name: string): Promise<{ x: number; y: number; } | undefined> {
    try {
        return await db.scrollPositions.get(name);
    } catch (error) {
        console.error('Fehler beim Laden der Scrollposition aus der Datenbank:', error);
        return undefined;
    }
}

// Hilfsfunktion zum Speichern der Scrollposition
export async function saveScrollPositionToDB(name: string, x: number, y: number) {
    try {
        await db.scrollPositions.put({
            name,
            x,
            y
        });
    } catch (error) {
        console.error('Fehler beim Speichern der Scrollposition in der Datenbank:', error);
    }
}