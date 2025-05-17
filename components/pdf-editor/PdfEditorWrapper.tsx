"use client";
import {Pdf} from "@/components/pdf-editor/pdf.types";
import {PdfEditor} from "@/components/pdf-editor/PdfEditor";
import {loadFromDB, SavedData} from "@/dexie/db";
import {useEffect, useState} from "react";
import Loading from "../Loading";

export default function PdfEditorWrapper({pdf}: { pdf: Pdf | string }) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<SavedData | undefined>(undefined);
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        async function loadPdf(): Promise<void> {
            if (typeof pdf !== "string") {
                setError(true);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const data = await loadFromDB(pdf);

                if (!data?.pdf) {
                    setError(true);
                    return;
                }

                setData(data);
            } catch (err) {
                setError(true);
                console.error("Fehler beim Laden des PDFs:", err);
            } finally {
                setLoading(false);
            }
        }

        loadPdf();
    }, [pdf]);

    if (typeof pdf !== "string") {
        return <PdfEditor pdf={pdf}/>;
    }

    if (loading) {
        return <Loading><p className='text-lg'>Lade PDF...</p></Loading>;
    }

    if (error) {
        return <div className="text-red-500 p-4">Fehler beim Laden des PDFs</div>;
    }

    if (!data?.pdf) {
        return <div className="p-4">Keine PDF-Daten gefunden</div>;
    }

    return <PdfEditor pdf={data.pdf}/>;
}