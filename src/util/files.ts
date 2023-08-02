import fs from 'fs-extra';

export function readTextFile(filename: string): string | undefined {
  if (!fs.existsSync(filename)) return;
  return fs.readFileSync(filename).toString();
}

export function nonEmptyLines(block: string): string[] {
  return block.split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0);
}
export function fileLines(filename: string): string[] | undefined {
  const content = readTextFile(filename);
  if (!content) return;
  return nonEmptyLines(content);
}
