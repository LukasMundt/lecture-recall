import dotenv from 'dotenv';

// Lädt die .env-Datei
dotenv.config();

// Exportiere die geladenen Variablen
export const runtimeEnv = process.env;