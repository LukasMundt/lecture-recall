import Dexie, {Table} from 'dexie';
import {Pdf} from "@/components/pdf-editor/pdf.types";

export interface SavedData {
    name: string;
    shapes?: SavedShape[];
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

export async function loadRecentLocalPdfs(): Promise<{name: string, lastModified: Date}[]> {
    try {
        return await db.pdfs.toArray().then((pdfs) => pdfs.map((pdf) => ({name: pdf.name, lastModified: new Date(pdf.lastModified)})));
    } catch (error) {
        console.error('Fehler beim Laden der Namen der gespeicherten PDFs:', error);
        return [];
    }
}