import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * cn() — Class Name Utility
 *
 * Combina duas bibliotecas para resolver dois problemas distintos:
 *
 * 1. clsx → permite classes condicionais:
 *    cn("base", isError && "text-red-500", isLarge && "text-xl")
 *    Resultado: "base text-red-500" (se isError=true, isLarge=false)
 *
 * 2. tailwind-merge → resolve conflitos do Tailwind:
 *    cn("p-4", "p-2")  → "p-2"  (sem merge, ambos seriam aplicados — bug visual)
 *    cn("text-sm", "text-lg") → "text-lg" (fica com o último)
 *
 * Uso nos componentes:
 *    <div className={cn("base-classes", className)} />
 *    Assim o componente aceita customização via prop, sem conflito.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
