"use client";
import {useState} from "react";
import {PdfPicker} from "@/app/(special)/editor/PdfPicker";
import {PdfEditor} from "@/components/pdf-editor/PdfEditor";
import {Pdf} from "@/components/pdf-editor/pdf.types";

type State =
    | {
    phase: 'pick';
}
    | {
    phase: 'edit';
    pdf: Pdf;
};

export default function ClientEditor() {
    const [state, setState] = useState<State>({ phase: 'pick' });

    switch (state.phase) {
        case 'pick':
            return (
                <div className="">
                    <PdfPicker onOpenPdf={(pdf) => setState({ phase: 'edit', pdf })} />
                </div>
            );
        case 'edit':
            return (
                <div className="h-dvh w-full flex flex-col absolute items-center justify-center text-center gap-[21px] PdfEditor">
                    <PdfEditor pdf={state.pdf} />
                </div>
            );
    }
}