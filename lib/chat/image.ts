export function isImageDataUrl(content: string): boolean {
  return content.startsWith("data:image");
}

export function extractImageMediaType(dataUrl: string): string {
  const match = dataUrl.match(/^data:([^;]+);base64,/);
  return match?.[1] ?? "image/png";
}
