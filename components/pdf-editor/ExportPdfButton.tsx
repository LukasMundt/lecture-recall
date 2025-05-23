"use client";
import { PDFDocument } from 'pdf-lib'
import { useState } from 'react'
import { Editor, useEditor, Box } from 'tldraw'
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Pdf } from "@/components/pdf-editor/pdf.types";
import { toast } from 'sonner';

export function ExportPdfButton({ pdf }: { pdf: Pdf }) {
    const [exportProgress, setExportProgress] = useState<number | null>(null)
    const editor = useEditor()

    return (
        <Button
            className="mr-2 mt-2 mb-1 cursor-pointer ButtonOnCanvas"
            onClick={async () => {
                setExportProgress(0)
                try {
                    await exportPdf(editor, pdf, setExportProgress)
                } finally {
                    setExportProgress(null)
                }
            }}
        >
            {exportProgress ? `Exporting... ${Math.round(exportProgress * 100)}%` :
                <span className="flex gap-3"><Download /><span className="hidden md:block">Export PDF</span></span>}
        </Button>
    )
}

async function exportPdf(
    editor: Editor,
    { name, source, pages }: Pdf,
    onProgress: (progress: number) => void
) {
    const totalThings = pages.length * 2 + 2
    let progressCount = 0
    const tickProgress = () => {
        progressCount++
        onProgress(progressCount / totalThings)
    }

    try {
        const pdf = await PDFDocument.load(source)
        tickProgress()

        const pdfPages = pdf.getPages()
        if (pdfPages.length !== pages.length) {
            throw new Error('PDF page count mismatch')
        }

        const pageShapeIds = new Set(pages.map((page) => page.shapeId))
        const allIds = Array.from(editor.getCurrentPageShapeIds()).filter((id) => !pageShapeIds.has(id))

        for (let i = 0; i < pages.length; i++) {
            const page = pages[i]
            const pdfPage = pdfPages[i]

            const bounds = page.bounds
            const shapesInBounds = allIds.filter((id) => {
                const shapePageBounds = editor.getShapePageBounds(id)
                if (!shapePageBounds) return false
                return shapePageBounds.collides(bounds)
            })

            if (shapesInBounds.length === 0) {
                tickProgress()
                tickProgress()
                continue
            }

            const exportedPng = await editor.toImage(shapesInBounds, {
                format: 'png',
                background: false,
                bounds: new Box(bounds.x, bounds.y, bounds.w, bounds.h),
                padding: 0,
                scale: 1,
            })
            tickProgress()

            pdfPage.drawImage(await pdf.embedPng(await exportedPng.blob.arrayBuffer()), {
                x: 0,
                y: 0,
                width: pdfPage.getWidth(),
                height: pdfPage.getHeight(),
            })
            tickProgress()
        }

        const url = URL.createObjectURL(new Blob([await pdf.save()], { type: 'application/pdf' }))
        tickProgress()
        const a = document.createElement('a')
        a.href = url
        a.download = name
        a.click()
        URL.revokeObjectURL(url)
    } catch (error) {
        console.error('Fehler beim Exportieren der PDF:', error);
        toast.error('Die PDF konnte nicht exportiert werden. Bitte versuchen Sie es erneut.');
        throw error;
    }
}