"use client";
import { Pdf } from "@/components/pdf-editor/pdf.types";
import { PdfEditor } from "@/components/pdf-editor/PdfEditor";
import { loadFromDB, SavedData } from "@/dexie/db";
import { useEffect, useState } from "react";
import Loading from "../Loading";
import { toast } from "sonner";

export default function PdfEditorWrapper({ pdf, onBackToPick }: { pdf: Pdf | string, onBackToPick: () => void }) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<SavedData | undefined>(undefined);

    useEffect(() => {
        async function loadPdf(): Promise<void> {
            if (typeof pdf !== "string") {
                return;
            }

            try {
                setLoading(true);
                const data = await loadFromDB(pdf);

                if (!data?.pdf) {
                    onBackToPick();
                    toast.error("PDF konnte nicht geladen werden.")
                    return;
                }

                setData(data);
            } catch (err) {
                onBackToPick();
                toast.error("PDF konnte nicht geladen werden.")
                console.error("Fehler beim Laden des PDFs:", err);
            } finally {
                setLoading(false);
            }
        }
        if (typeof pdf === "string") {
            loadPdf();
        }
    }, [pdf]);

    if (typeof pdf !== "string") {
        return <PdfEditor pdf={pdf} onBackToPick={onBackToPick} />;
    }

    if (loading) {
        return <Loading><p className='text-lg'>Lade PDF...</p></Loading>;
    }

    if (!data?.pdf) {
        return <div className="p-4">Keine PDF-Daten gefunden</div>;
    }

    return <PdfEditor pdf={data.pdf} onBackToPick={onBackToPick} />;
}