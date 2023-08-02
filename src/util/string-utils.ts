import _ from 'lodash';

export function stripMargin(block: string): string {
  const lines = block.split('\n');
  const stripped = stripMargins(lines);
  return stripped.join('\n');
}

export function stripMargins(lines: string[]): string[] {
  return _
    .map(lines, l => {
      if (/^ *\|/.test(l)) {
        return l.slice(l.indexOf('|') + 1);
      }
      return l;
    });
}
