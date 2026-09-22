/** Small helpers for programmatically building level grids — avoids hand-typing
 * misaligned ASCII rows, which is an easy way to silently break a level layout. */

export function createGrid(cols: number, rows: number): string[][] {
  const grid: string[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: string[] = [];
    for (let c = 0; c < cols; c++) {
      const isBorder = r === 0 || r === rows - 1 || c === 0 || c === cols - 1;
      row.push(isBorder ? "#" : ".");
    }
    grid.push(row);
  }
  return grid;
}

export function setCell(grid: string[][], col: number, row: number, ch: string): void {
  if (grid[row] && grid[row][col] !== undefined) grid[row][col] = ch;
}

export function fillRect(
  grid: string[][],
  col: number,
  row: number,
  w: number,
  h: number,
  ch: string,
): void {
  for (let r = row; r < row + h; r++) {
    for (let c = col; c < col + w; c++) {
      if (grid[r] && grid[r][c] !== undefined) grid[r][c] = ch;
    }
  }
}

export function toRows(grid: string[][]): string[] {
  return grid.map((row) => row.join(""));
}
