export function getWebPPath(imagePath: string): string {
  if (!imagePath) return '';
  const lastDot = imagePath.lastIndexOf('.');
  if (lastDot === -1) return imagePath;
  return imagePath.slice(0, lastDot) + '.webp';
}

export function getThumbnailPath(imagePath: string): string {
  if (!imagePath) return '';
  const lastDot = imagePath.lastIndexOf('.');
  if (lastDot === -1) return imagePath;
  return imagePath.slice(0, lastDot) + '-thumb.webp';
}

export function imageExists(_path: string): boolean {
  // This is a placeholder - in production we'd check the manifest
  // For now, we assume WebP versions exist for all optimized images
  return true;
}