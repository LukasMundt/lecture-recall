// Hilfsfunktion zum Laden der zuletzt geöffneten PDF
export function getLastOpenedPdf(): string | null {
    try {
        return sessionStorage.getItem(`last-opened-pdf`);
    } catch (error) {
        console.error('Fehler beim Laden der zuletzt geöffneten PDF:', error);
        return null;
    }
}

// Hilfsfunktion zum Speichern der zuletzt geöffneten PDF
export function saveLastOpenedPdf(name: string) {
    try {
        sessionStorage.setItem('last-opened-pdf', name);
    } catch (error) {
        console.error('Fehler beim Speichern der zuletzt geöffneten PDF:', error);
    }
}

// Hilfsfunktion zum Löschen der zuletzt geöffneten PDF
export function removeLastOpenedPdf(): void {
    try {
        sessionStorage.removeItem('last-opened-pdf');
    } catch (error) {
        console.error('Fehler beim Löschen der zuletzt geöffneten PDF:', error);
    }
}