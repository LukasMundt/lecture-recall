"use client";
import { useMemo, useEffect, useRef, useState, useCallback } from 'react';
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
    TLShapeId,
    DefaultMenuPanel, Editor, TLShape
} from 'tldraw';
import './style.css'
import { ExportPdfButton } from "@/components/pdf-editor/ExportPdfButton";
import { Pdf } from "@/components/pdf-editor/pdf.types";
import {
    loadScrollPositionsFromDB, loadShapesFromDB,
    SavedPdf,
    SavedShapes,
    savePdfToDB,
    saveScrollPositionToDB,
    saveShapesToDB
} from '@/dexie/db';
import { removeLastOpenedPdf, saveLastOpenedPdf } from './logic';
import Loading from '../Loading';
import SaveStatusIndicator, { SavingStatus } from './SaveStatusIndicator';
import { Button } from "@/components/ui/button";
import { ArrowUpLeft } from 'lucide-react';

// TODO:
// - prevent sending shapes behind the pages
// - prevent locked shape context menu
// - inertial scrolling for constrained camera
// - render pages on-demand instead of all at once.

export function PdfEditor({ pdf, onBackToPick }: { pdf: Pdf, onBackToPick: () => void }) {
    const [saveStatus, setSaveStatus] = useState<SavingStatus>('saved');
    const lastSaveTime = useRef<number>(0);
    const hasChanges = useRef<boolean>(false);
    const SAVE_INTERVAL = 10000; // 10 Sekunden
    const PDF_SAVE_DELAY = 1000; // 1 Sekunde Verzug für PDF-Speicherung
    const editorRef = useRef<Editor>(null);

    const performSaveShapesLogic = useCallback(async (editor: Editor | null) => {
        if (!editor) return;
        setSaveStatus('saving');
        const shapes = editor.getCurrentPageShapes();
        const nonLockedShapes = shapes.filter((shape: TLShape) => !shape.isLocked);

        try {
            const newData: SavedShapes = {
                name: pdf.name,
                shapes: nonLockedShapes,
                lastModified: new Date().toISOString(),
            };
            await saveShapesToDB(newData);
            lastSaveTime.current = Date.now();
            hasChanges.current = false;
            setSaveStatus('saved');
        } catch (error) {
            console.error('Fehler beim Speichern der Shapes in der Datenbank:', error);
            setSaveStatus('unsaved');
            throw error;
        }
    }, [pdf.name, setSaveStatus]);

    const autoSaveShapes = useCallback(async (editor: Editor | null) => {
        if (!editor) return;
        const now = Date.now();
        if (hasChanges.current && (now - lastSaveTime.current >= SAVE_INTERVAL)) {
            await performSaveShapesLogic(editor);
        } else if (hasChanges.current && saveStatus !== 'unsaved') {
            setSaveStatus('unsaved');
        }
    }, [performSaveShapesLogic, SAVE_INTERVAL, saveStatus, setSaveStatus]);

    const forceSaveAllPendingChanges = useCallback(async (editor: Editor | null) => {
        if (!editor) return;
        let savedSuccessfully = true;
        if (hasChanges.current) {
            try {
                await performSaveShapesLogic(editor);
            } catch {
                savedSuccessfully = false;
            }
        }
        return savedSuccessfully;
    }, [performSaveShapesLogic, pdf.name]);

    const handleBackToPick = useCallback(async () => {
        if (editorRef.current) {
            await forceSaveAllPendingChanges(editorRef.current);
            removeLastOpenedPdf();
        }
        if (typeof onBackToPick === 'function') {
            onBackToPick();
        } else {
            console.warn("PdfEditor: onBackToPick prop was not provided or is not a function.");
        }
    }, [editorRef, forceSaveAllPendingChanges, onBackToPick]);

    const components = useMemo<TLComponents>(
        () => ({
            PageMenu: null,
            InFrontOfTheCanvas: () => <PageOverlayScreen pdf={pdf} />,
            LoadingScreen: () => <Loading><p className='text-lg'>Lade PDF...</p></Loading>,
            SharePanel: () => (
                <div className="flex items-center gap-2" style={{ zIndex: 100000 }}>
                    <SaveStatusIndicator status={saveStatus} />
                    <ExportPdfButton pdf={pdf} />
                </div>
            ),
            MenuPanel: () => (<div className='flex items-center gap-2'>
                <DefaultMenuPanel />
                <Button onClick={handleBackToPick} variant="outline" size="sm"
                    className="cursor-pointer ButtonOnCanvas flex items-center gap-1">
                    <ArrowUpLeft size={16} /> Zurück
                </Button>
            </div>)
        }),
        [pdf, saveStatus, handleBackToPick]
    );

    useEffect(() => {
        saveLastOpenedPdf(pdf.name);
    }, [pdf]);

    const savePdf = async () => {
        const pdfData: Pdf = {
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
            const newPdf: SavedPdf = {
                name: pdf.name,
                pdf: pdfData,
                lastModified: new Date().toISOString(),
            };
            await savePdfToDB(newPdf);

            // this is done because the recently opened pdfs are only loaded from the shapes table
            const currentShapes = await loadShapesFromDB(pdf.name);
            const newShapes: SavedShapes = {
                name: pdf.name,
                shapes: currentShapes?.shapes,
                lastModified: new Date().toISOString(),
            }
            await saveShapesToDB(newShapes);
        } catch (error) {
            console.error('Fehler beim Speichern der PDF in der Datenbank:', error);
        }
    };

    return (
        <Tldraw
            options={{
                maxPages: 1,
            }}
            onMount={(editor) => {
                editorRef.current = editor;
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
                    const savedShapes = await loadShapesFromDB(pdf.name);
                    if (savedShapes?.shapes && savedShapes.shapes.length > 0) {
                        const shapes = savedShapes.shapes.map(shape => ({
                            ...shape,
                            id: shape.id as TLShapeId,
                            index: shape.index as IndexKey,
                            type: shape.type as string
                        }));
                        editor.createShapes(shapes as TLShapePartial[]);
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
                        return { ...prev, isLocked: true };
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
                            padding: { x: isMobile ? 16 : 164, y: 64 },
                            origin: { x: 0.5, y: 0 },
                            initialZoom: 'fit-x-100',
                            baseZoom: 'default',
                            behavior: 'contain',
                        },
                    });

                    // Lade die gespeicherte Scrollposition und setze die Kamera entsprechend,
                    // oder wende den initialZoom an, falls keine Position gespeichert ist.
                    loadScrollPositionsFromDB(pdf.name).then((scrollData) => {
                        if (scrollData) {
                            // Gespeicherte Position gefunden, verwende diese.
                            editor.setCamera({
                                ...editor.getCamera(),
                                x: scrollData.x,
                                y: scrollData.y
                            });
                        } else {
                            // Keine gespeicherte Position, wende initialZoom und Constraints an.
                            editor.setCamera(editor.getCamera(), { reset: true });
                        }
                    });
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
                const shapeSaveIntervalId = setInterval(() => {
                    if (editorRef.current) {
                        autoSaveShapes(editorRef.current);
                    }
                }, SAVE_INTERVAL);

                // Speichere bei Änderungen der Shapes
                editor.sideEffects.registerAfterChangeHandler('shape', (prev, next) => {
                    if (!next.isLocked) {
                        hasChanges.current = true;
                        if (saveStatus !== 'unsaved' && saveStatus !== 'saving') {
                            setSaveStatus('unsaved');
                        }
                    }
                });

                // Intervall zum Speichern der Scrollposition
                const scrollSaveIntervalId = setInterval(() => {
                    if (editorRef.current) { // Sicherstellen, dass editorRef.current existiert
                        const camera = editorRef.current.getCamera();
                        saveScrollPositionToDB(pdf.name, camera.x, camera.y);
                    }
                }, SAVE_INTERVAL);

                // Cleanup beim Unmount
                return () => {
                    clearInterval(shapeSaveIntervalId);
                    clearInterval(scrollSaveIntervalId);
                    if (editorRef.current) {
                        forceSaveAllPendingChanges(editorRef.current);
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
