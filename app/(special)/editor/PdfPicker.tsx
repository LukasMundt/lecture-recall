"use client";
import {useState, useEffect} from 'react';
import {
    AssetRecordType,
    Box,
    createShapeId,
} from 'tldraw';
import {Button} from "@/components/ui/button";
import {Loader, FileText, Clock, Plus} from "lucide-react";
import {Pdf, PdfPage} from "@/components/pdf-editor/pdf.types";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {ScrollArea} from "@/components/ui/scroll-area";
import {loadRecentLocalPdfs} from "@/dexie/db";

const pageSpacing = 32;

interface PdfPickerProps {
    onOpenPdf: (pdf: any) => void;
}

export function PdfPicker({onOpenPdf}: PdfPickerProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [recentPdfs, setRecentPdfs] = useState<{name: string, lastModified: string}[]>([]);

    useEffect(() => {
        async function loadRecentPdfs() {
            const allPdfs = await loadRecentLocalPdfs();
            if (allPdfs) {
                setRecentPdfs(allPdfs.sort((a, b) => 
                    new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
                ));
            }
        }
        loadRecentPdfs();
    }, []);

    async function loadPdf(name: string, source: ArrayBuffer): Promise<Pdf> {
        const PdfJS = await import('pdfjs-dist');
        PdfJS.GlobalWorkerOptions.workerSrc = new URL(
            'pdfjs-dist/build/pdf.worker.min.mjs',
            import.meta.url
        ).toString();
        const pdf = await PdfJS.getDocument(source.slice(0)).promise;
        const pages: PdfPage[] = [];

        const canvas = window.document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Failed to create canvas context');

        const visualScale = 1.5;
        const scale = window.devicePixelRatio;

        let top = 0;
        let widest = 0;
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({scale: scale * visualScale});
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const renderContext = {
                canvasContext: context,
                viewport,
            };
            await page.render(renderContext).promise;

            const width = viewport.width / scale;
            const height = viewport.height / scale;
            pages.push({
                src: canvas.toDataURL(),
                bounds: new Box(0, top, width, height),
                assetId: AssetRecordType.createId(),
                shapeId: createShapeId(),
            });
            top += height + pageSpacing;
            widest = Math.max(widest, width);
        }
        canvas.width = 0;
        canvas.height = 0;

        for (const page of pages) {
            page.bounds.x = (widest - page.bounds.width) / 2;
        }

        return {
            name,
            pages,
            source,
        };
    }

    function onClickOpenPdf() {
        const input = window.document.createElement('input');
        input.type = 'file';
        input.accept = 'application/pdf';
        input.addEventListener('change', async (e) => {
            const fileList = (e.target as HTMLInputElement).files;
            if (!fileList || fileList.length === 0) return;
            const file = fileList[0];

            setIsLoading(true);
            try {
                const pdf = await loadPdf(file.name, await file.arrayBuffer());
                onOpenPdf(pdf);
            } finally {
                setIsLoading(false);
            }
        });
        input.click();
    }

    if (isLoading) {
        return (<div className="h-dvh w-full items-center flex flex-col justify-center absolute">
            <Loader className="animate-spin" />
            <span className="sr-only">Loading</span>
        </div>);
    }

    return (
        <div className="h-dvh w-full items-center flex flex-col justify-center absolute p-4 gap-8">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Zuletzt geöffnete PDFs</CardTitle>
                    <CardDescription>Wählen Sie eine PDF aus der Liste oder öffnen Sie eine neue Datei</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[300px]">
                        {recentPdfs.length > 0 ? (
                            <div className="space-y-2">
                                {recentPdfs.map((pdf) => (
                                    <div
                                        key={pdf.name}
                                        className="p-4 rounded-lg cursor-pointer hover:bg-accent transition-colors flex items-center gap-3"
                                        onClick={() => onOpenPdf(pdf.name)}
                                    >
                                        <FileText className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">{pdf.name}</p>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {new Date(pdf.lastModified).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground py-8">
                                Keine kürzlich geöffneten PDFs
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
            
            <Button onClick={onClickOpenPdf} size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Neue PDF öffnen
            </Button>
        </div>
    );
}
