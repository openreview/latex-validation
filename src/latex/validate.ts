import { execTectonic } from '~/tectonic';
import { putStrLn, prettyPrint } from '~/util/pretty-print';
import { prepareLatexFragment } from './fragments';

function parseIntOrElse(s: string, fallback: number): number {
  try {
    return Number.parseInt(s);
  }
  catch {
    return fallback;
  }
}

interface Error {
  line: number;
  message: string;
}

interface Errors {
  status: 'error';
  exitCode: number;
  errors: Error[];
  numberedLines: string;
}

interface Success {
  status: 'ok';
}

type Validation = Errors | Success;

export function isSuccess(v: Validation): v is Success {
  return v.status === 'ok';
}

function filterErrorLines(lines: string[]): Error[] {
  const filter = /^error: texput\.tex:(\d+):/;
  const splitter = /^error: texput\.tex:(\d+):(.+$)/;
  const errorLines = lines.filter(l => filter.test(l));
  return errorLines.map(l => {
    const results = splitter.exec(l);
    if (!results) {
      const message = `Could not extract error message from: ${l}`;
      const error: Error = { line: -1, message };
      return error;
    }
    const [, lineNum, errMsg] = results;
    const line = parseIntOrElse(lineNum, 0);
    const message = errMsg.trim();
    const error: Error = { line, message };
    return error;
  });
}

export async function validateLatexFragment(fragment: string, packages: string[]): Promise<Validation> {
  const { document, fragmentLinesNumbered } = prepareLatexFragment({ fragment, packages });
  putStrLn('Prepared document is')
  putStrLn(document)

  const { exitCode, stderr } = await execTectonic(document)
  prettyPrint({ msg: 'tectonic exit code/stderr', exitCode, stderr });

  const errors = filterErrorLines(stderr);
  if (errors.length > 0 || exitCode === -2) return ({
    status: 'error',
    exitCode,
    errors,
    numberedLines: fragmentLinesNumbered
  });

  return { status: 'ok' };
}
