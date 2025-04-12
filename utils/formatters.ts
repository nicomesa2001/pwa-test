/**
 * Utilidades para formatear valores en la aplicación
 */

/**
 * Formatea un valor numérico como moneda
 * @param amount Cantidad a formatear
 * @param locale Configuración regional (por defecto es-MX)
 * @param currency Moneda (por defecto MXN)
 * @returns String formateado como moneda
 */
export function formatCurrency(amount: number, locale = 'es-MX', currency = 'MXN'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Formatea una fecha en formato legible
 * @param dateString Fecha en formato string o timestamp
 * @param locale Configuración regional (por defecto es-MX)
 * @returns String de fecha formateada
 */
export function formatDate(dateString: string | number | Date): string {
  const date = new Date(dateString);
  
  // Si la fecha es inválida, devolver string vacío
  if (isNaN(date.getTime())) {
    return '';
  }
  
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Formatea una fecha y hora en formato legible
 * @param dateString Fecha en formato string o timestamp
 * @param locale Configuración regional (por defecto es-MX)
 * @returns String de fecha y hora formateada
 */
export function formatDateTime(dateString: string | number | Date): string {
  const date = new Date(dateString);
  
  // Si la fecha es inválida, devolver string vacío
  if (isNaN(date.getTime())) {
    return '';
  }
  
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
