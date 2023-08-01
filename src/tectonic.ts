
/*
*  ➜  tectonic -h
*  Tectonic 0.14.1
*  Process a (La)TeX document
*
*  USAGE:
*      tectonic [FLAGS] [OPTIONS] <input>
*
*  FLAGS:
*      -h, --help                  Prints help information
*      -k, --keep-intermediates    Keep the intermediate files generated during processing
*          --keep-logs             Keep the log files generated during processing
*      -C, --only-cached           Use only resource files cached locally
*      -p, --print                 Print the engine's chatter during processing
*          --synctex               Generate SyncTeX data
*          --untrusted             Input is untrusted -- disable all known-insecure features
*      -X                          Use experimental V2 interface (see `tectonic -X --help`); must be the first argument
*      -V, --version               Prints version information
*
*  OPTIONS:
*      -r, --reruns <count>                Rerun the TeX engine exactly this many times after the first
*          --makefile-rules <dest_path>    Write Makefile-format rules expressing the dependencies of this run to
*                                          <dest_path>
*      -b, --bundle <file_path>            Use this directory or Zip-format bundle file to find resource files instead of
*                                          the default
*          --outfmt <format>               The kind of output to generate [default: pdf]  [possible values: pdf, html, xdv,
*                                          aux, fmt]
*          --hide <hide_path>...           Tell the engine that no file at <hide_path> exists, if it tries to read it
*      -c, --chatter <level>               How much chatter to print when running [default: default]  [possible values:
*                                          default, minimal]
*      -Z <option>...                      Unstable options. Pass -Zhelp to show a list
*      -o, --outdir <outdir>               The directory in which to place output files [default: the directory containing
*                                          <input>]
*          --pass <pass>                   Which engines to run [default: default]  [possible values: default, tex,
*                                          bibtex_first]
*      -f, --format <path>                 The name of the "format" file used to initialize the TeX engine [default: latex]
*      -w, --web-bundle <url>              Use this URL to find resource files instead of the default
*          --color <when>                  Enable/disable colorful log output [default: auto]  [possible values: always,
*                                          auto, never]
*
*  ARGS:
*      <input>    The file to process, or "-" to process the standard input stream
*
**/
import { spawn } from 'node:child_process';
import { putStrLn } from './util/pretty-print';

export type ProcOutput = {
  stdout: string[],
  stderr: string[],
}

function nonEmptyLines(input: string): string[] {
  return input.split('\n').filter(s => s.length > 0);
}
function reflowLines(input: string[]): string[] {
  return nonEmptyLines(input.join(''));
}

export async function execTectonic(input: string) {
  return new Promise<ProcOutput>((resolve, reject) => {
    const stdoutBuf: string[] = []
    const stderrBuf: string[] = []
    let stdoutClosed = false;
    let stderrClosed = false;
    let procClosed = false;
    function resolveOnClosed() {
      if (stdoutClosed && stderrClosed && procClosed) {
        const stdout = reflowLines(stdoutBuf);
        const stderr = reflowLines(stderrBuf);
        resolve({ stdout, stderr });
      }
    }

    const command = spawn('tectonic', ['-p', '-'])

    command.stdout.on('data', (output: any) => {
      stdoutBuf.push(output.toString());
    });
    command.stderr.on('data', (output: any) => {
      stderrBuf.push(output.toString());
    });
    command.stderr.on('close', () => {
      stderrClosed = true;
      resolveOnClosed();
    });
    command.stdout.on('close', () => {
      stdoutClosed = true;
      resolveOnClosed();
    });
    command.on('close', (code) => {
      if (code !== 0) {
        putStrLn(`Tectonic exited with code ${code}`);
      }
      procClosed = true;
      resolveOnClosed();
    });
    command.stdin.write(input)
    command.stdin.end()
  });
}
