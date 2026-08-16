export function getPageNumberFromStoragePath(path: string): number | null {
  const match = path.match(/page[-_\s]*(\d{1,4})\.(png|jpe?g|webp|gif)/i);
  if (!match) return null;

  const pageNumber = Number.parseInt(match[1], 10);
  return Number.isFinite(pageNumber) && pageNumber > 0 ? pageNumber : null;
}

export function buildBookPageRows(
  bookId: string,
  storagePaths: string[]
): Array<{ book_id: string; page_number: number; image_url: string }> {
  const rows = storagePaths
    .map((path) => {
      const pageNumber = getPageNumberFromStoragePath(path);
      if (!pageNumber) return null;

      return {
        book_id: bookId,
        page_number: pageNumber,
        image_url: path,
      };
    })
    .filter((row): row is { book_id: string; page_number: number; image_url: string } => row !== null)
    .sort((a, b) => a.page_number - b.page_number);

  return rows;
}
