"use client";
import {useMemo, useEffect, useRef} from 'react';
import {
    Box,
    SVGContainer,
    TLComponents,
    TLImageShape,
    TLShapePartial,
    Tldraw,
    react,
    sortByIndex,
    track,
    useEditor,
    IndexKey,
} from 'tldraw';
import './style.css'
import {ExportPdfButton} from "@/components/pdf-editor/ExportPdfButton";
import {Pdf} from "@/components/pdf-editor/pdf.types";
import {saveToDB, loadFromDB, SavedData} from '@/dexie/db';
import {saveLastOpenedPdf} from './logic';
import Loading from '../Loading';

// TODO:
// - prevent changing pages (create page, change page, move shapes to new page)
// - prevent locked shape context menu
// - inertial scrolling for constrained camera
// - render pages on-demand instead of all at once.

export function PdfEditor({pdf}: { pdf: Pdf }) {
    const components = useMemo<TLComponents>(
        () => ({
            PageMenu: null,
            InFrontOfTheCanvas: () => <PageOverlayScreen pdf={pdf}/>,
            LoadingScreen: () => <Loading><p className='text-lg'>Lade PDF...</p></Loading>,
            SharePanel: () => <ExportPdfButton pdf={pdf}/>,
        }),
        [pdf]
    );

    // Speicherintervall
    const lastSaveTime = useRef<number>(0);
    const hasChanges = useRef<boolean>(false);
    const SAVE_INTERVAL = 10000; // 10 Sekunden
    const PDF_SAVE_DELAY = 1000; // 1 Sekunde Verzug für PDF-Speicherung

    // Speichere die zuletzt geöffnete PDF für den tab
    useEffect(() => {
        saveLastOpenedPdf(pdf.name);
    }, [pdf]);

    // Funktion zum Speichern der Shapes
    const saveShapes = async (editor: any) => {
        const now = Date.now();
        if (now - lastSaveTime.current < SAVE_INTERVAL) {
            hasChanges.current = true;
            return;
        }

        const shapes = editor.getCurrentPageShapes();
        const nonLockedShapes = shapes.filter((shape: any) => !shape.isLocked);

        try {
            const savedData = await loadFromDB(pdf.name);
            const newData: SavedData = {
                name: pdf.name,
                shapes: nonLockedShapes,
                lastModified: new Date().toISOString(),
                pdf: savedData?.pdf
            };

            await saveToDB(newData);

            lastSaveTime.current = now;
            hasChanges.current = false;
        } catch (error) {
            console.error('Fehler beim Speichern der Shapes in der Datenbank:', error);
        }
    };

    // Funktion zum Speichern der PDF
    const savePdf = async () => {
        const pdfData = {
            name: pdf.name,
            pages: pdf.pages.map(page => ({
                src: page.src,
                bounds: page.bounds,
                assetId: page.assetId,
                shapeId: page.shapeId
            })),
            source: pdf.source
        };

        try {
            const savedData = await loadFromDB(pdf.name);
            const newData: SavedData = {
                name: pdf.name,
                pdf: pdfData,
                lastModified: new Date().toISOString(),
                shapes: savedData?.shapes
            };

            await saveToDB(newData);
        } catch (error) {
            console.error('Fehler beim Speichern der PDF in der Datenbank:', error);
        }
    };

    return (
        <Tldraw
            onMount={(editor) => {
                // Erstelle zuerst die Assets
                editor.createAssets(
                    pdf.pages.map((page) => ({
                        id: page.assetId,
                        typeName: 'asset',
                        type: 'image',
                        meta: {},
                        props: {
                            w: page.bounds.w,
                            h: page.bounds.h,
                            mimeType: 'image/png',
                            src: page.src,
                            name: 'page',
                            isAnimated: false,
                        },
                    }))
                );

                // Erstelle dann die PDF-Seiten
                editor.createShapes(
                    pdf.pages.map(
                        (page): TLShapePartial<TLImageShape> => ({
                            id: page.shapeId,
                            type: 'image',
                            x: page.bounds.x,
                            y: page.bounds.y,
                            isLocked: true,
                            props: {
                                assetId: page.assetId,
                                w: page.bounds.w,
                                h: page.bounds.h,
                            },
                        })
                    )
                );

                // Warte einen Moment, bevor die gespeicherten Shapes geladen werden
                setTimeout(async () => {
                    // Lade die gespeicherten Shapes, wenn vorhanden
                    const savedData = await loadFromDB(pdf.name);
                    if (savedData?.shapes && savedData.shapes.length > 0) {
                        editor.createShapes(savedData.shapes);
                    }
                }, 100);

                const shapeIds = pdf.pages.map((page) => page.shapeId);
                const shapeIdSet = new Set(shapeIds);

                // Don't let the user unlock the pages
                editor.sideEffects.registerBeforeChangeHandler(
                    'shape',
                    (prev, next) => {
                        if (!shapeIdSet.has(next.id)) return next;
                        if (next.isLocked) return next;
                        return {...prev, isLocked: true};
                    }
                );

                // Make sure the shapes are below any of the other shapes
                function makeSureShapesAreAtBottom() {
                    const shapes = shapeIds
                        .map((id) => editor.getShape(id)!)
                        .sort(sortByIndex);

                    // Setze alle PDF-Shapes an den Anfang der Seite
                    editor.updateShapes(
                        shapes.map((shape, i) => ({
                            id: shape.id,
                            type: shape.type,
                            isLocked: shape.isLocked,
                            index: `a${i}` as IndexKey
                        }))
                    );
                }

                // Führe die initiale Platzierung einmal aus
                makeSureShapesAreAtBottom();

                // Constrain the camera to the bounds of the pages
                const targetBounds = pdf.pages.reduce(
                    (acc, page) => acc.union(new Box(page.bounds.x, page.bounds.y, page.bounds.w, page.bounds.h)),
                    new Box(pdf.pages[0].bounds.x, pdf.pages[0].bounds.y, pdf.pages[0].bounds.w, pdf.pages[0].bounds.h)
                );

                function updateCameraBounds(isMobile: boolean) {
                    editor.setCameraOptions({
                        constraints: {
                            bounds: targetBounds,
                            padding: {x: isMobile ? 16 : 164, y: 64},
                            origin: {x: 0.5, y: 0},
                            initialZoom: 'fit-x-100',
                            baseZoom: 'default',
                            behavior: 'contain',
                        },
                    });
                    editor.setCamera(editor.getCamera(), {reset: true});
                }

                let isMobile = editor.getViewportScreenBounds().width < 840;

                react('update camera', () => {
                    const isMobileNow = editor.getViewportScreenBounds().width < 840;
                    if (isMobileNow === isMobile) return;
                    isMobile = isMobileNow;
                    updateCameraBounds(isMobile);
                });

                updateCameraBounds(isMobile);

                // Speichere die PDF mit Verzug
                setTimeout(() => {
                    savePdf();
                }, PDF_SAVE_DELAY);

                // Prüfe regelmäßig auf Änderungen der Shapes
                const saveInterval = setInterval(() => {
                    if (hasChanges.current) {
                        saveShapes(editor);
                    }
                }, SAVE_INTERVAL);

                // Speichere bei Änderungen der Shapes
                editor.sideEffects.registerAfterChangeHandler('shape', (prev, next) => {
                    if (!next.isLocked) {
                        hasChanges.current = true;
                    }
                });

                // Cleanup beim Unmount
                return () => {
                    clearInterval(saveInterval);
                    if (hasChanges.current) {
                        saveShapes(editor);
                    }
                };
            }}
            components={components}
        />
    );
}

const PageOverlayScreen = track(function PageOverlayScreen({
                                                               pdf,
                                                           }: {
    pdf: Pdf;
}) {
    const editor = useEditor();

    const viewportPageBounds = editor.getViewportPageBounds();
    const viewportScreenBounds = editor.getViewportScreenBounds();

    const relevantPageBounds = pdf.pages
        .map((page) => {
            if (!viewportPageBounds.collides(page.bounds)) return null;
            const topLeft = editor.pageToViewport(page.bounds);
            const bottomRight = editor.pageToViewport({
                x: page.bounds.maxX,
                y: page.bounds.maxY,
            });
            
            // Validiere die Werte
            const width = Math.max(0, bottomRight.x - topLeft.x);
            const height = Math.max(0, bottomRight.y - topLeft.y);
            
            if (isNaN(width) || isNaN(height)) return null;
            
            return new Box(
                topLeft.x,
                topLeft.y,
                width,
                height
            );
        })
        .filter((bounds): bounds is Box => bounds !== null);

    function pathForPageBounds(bounds: Box) {
        return `M ${bounds.x} ${bounds.y} L ${bounds.maxX} ${bounds.y} L ${bounds.maxX} ${bounds.maxY} L ${bounds.x} ${bounds.maxY} Z`;
    }

    const viewportPath = `M 0 0 L ${viewportScreenBounds.w} 0 L ${viewportScreenBounds.w} ${viewportScreenBounds.h} L 0 ${viewportScreenBounds.h} Z`;

    return (
        <>
            <SVGContainer className="PageOverlayScreen-screen">
                <path
                    d={`${viewportPath} ${relevantPageBounds
                        .map(pathForPageBounds)
                        .join(' ')}`}
                    fillRule="evenodd"
                    fill="rgba(255, 255, 255, 0.1)"
                />
            </SVGContainer>
            {relevantPageBounds.map((bounds, i) => (
                <div
                    key={i}
                    className="PageOverlayScreen-outline"
                    style={{
                        width: bounds.w,
                        height: bounds.h,
                        transform: `translate(${bounds.x}px, ${bounds.y}px)`,
                        opacity: 0.1
                    }}
                />
            ))}
        </>
    );
});
