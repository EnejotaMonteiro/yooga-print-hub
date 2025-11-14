import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extrai o ID do vídeo de uma URL do YouTube (normal ou embed).
 * @param url A URL do YouTube.
 * @returns O ID do vídeo ou null se não for uma URL válida.
 */
export function extractYouTubeVideoId(url: string): string | null {
  const regExp = /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/;
  const match = url.match(regExp);
  return (match && match[1].length === 11) ? match[1] : null;
}

/**
 * Converte uma URL do YouTube (normal ou embed) para o formato de embed.
 * @param url A URL do YouTube.
 * @returns A URL no formato embed ou a URL original se não for um link do YouTube válido.
 */
export function convertToEmbedUrl(url: string): string {
  const videoId = extractYouTubeVideoId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}