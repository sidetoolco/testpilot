// Tipos compartidos para los componentes de Report

/**
 * Tipo para las orientaciones del PDF
 * 
 * Beneficios de usar este tipo:
 * - Centraliza la definición de orientaciones válidas
 * - Facilita cambios futuros (agregar/quitar orientaciones)
 * - Proporciona autocompletado en el IDE
 * - Previene errores de tipeo
 * 
 * Uso:
 * import { PDFOrientation } from './types';
 * 
 * interface Props {
 *   orientation?: PDFOrientation;
 * }
 * 
 * Ejemplo de cómo agregar una nueva orientación en el futuro:
 * export type PDFOrientation = 'portrait' | 'landscape' | 'square';
 * 
 * Solo necesitas cambiar esta línea y TypeScript te avisará de todos los lugares
 * donde necesitas manejar la nueva orientación.
 */
export type PDFOrientation = 'portrait' | 'landscape'; 