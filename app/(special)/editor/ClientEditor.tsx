"use client";
import {useState, useEffect} from "react";
import {PdfPicker} from "@/app/(special)/editor/PdfPicker";
import {Pdf} from "@/components/pdf-editor/pdf.types";
import PdfEditorWrapper from "@/components/pdf-editor/PdfEditorWrapper";
import {getLastOpenedPdf} from "@/components/pdf-editor/logic";
import Loading from "@/components/Loading";

type State =
    | {
    phase: 'loading';
}
    | {
    phase: 'pick';
}
    | {
    phase: 'edit';
    pdf: Pdf|string;
};

export default function ClientEditor() {
    const [state, setState] = useState<State>({ phase: 'loading' });

    // Überprüfe sofort auf bestehende Daten
    useEffect(() => {
        async function checkExistingData() {
            const lastOpenedPdf = getLastOpenedPdf();
            if(lastOpenedPdf != null) {
                setState({ phase: 'edit', pdf: lastOpenedPdf });
                return;
            }
            setState({ phase: 'pick' });
        }
        checkExistingData();
    }, []);

    switch (state.phase) {
        case 'loading':
            return (
                <Loading><p className='text-lg'>Lade PDF...</p></Loading>
            );
        case 'pick':
            return (
                <div className="">
                    <PdfPicker onOpenPdf={(pdf) => setState({ phase: 'edit', pdf })} />
                </div>
            );
        case 'edit':
            return (
                <div className="h-dvh w-full flex flex-col absolute items-center justify-center text-center gap-[21px] PdfEditor">
                    <PdfEditorWrapper pdf={state.pdf}/>
                </div>
            );
    }
}