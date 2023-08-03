
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
import { SendHandle, spawn } from 'node:child_process';
import { prettyPrint } from './util/pretty-print';

export interface ProcOutput {
  exitCode: number;
  stdout: string[];
  stderr: string[];
}

function nonEmptyLines(input: string): string[] {
  return input.split('\n').filter(s => s.length > 0);
}
function reflowLines(input: string[]): string[] {
  return nonEmptyLines(input.join(''));
}

export async function execTectonic(input: string, reportTiming: boolean=true): Promise<ProcOutput> {
  return new Promise<ProcOutput>((resolve) => {
    let exitCode = -1;
    const stdoutBuf: string[] = []
    const stderrBuf: string[] = []
    let stdoutClosed = false;
    let stderrClosed = false;
    let procClosed = false;


    ////////
    // Timer functionality
    const times: Record<string, number[]> = {
      timeToClose: [],
      timeToDisconnect: [],
      timeToError: [],
      timeToExit: [],
      timeToMessage: [],
      timeToSpawn: [],
      'stdout.data': [],
      'stdout.close': [],
      'stderr.data': [],
      'stderr.close': [],
    };

    const timeStartMS = (new Date()).getTime();
    function recordTimeFromStart(key: string) {
      if (!reportTiming) return;
      const nowMS = (new Date()).getTime();
      times[key].push(nowMS - timeStartMS);
    }
    // /Timer
    ////////

    function resolveOnClosed() {
      if (stdoutClosed && stderrClosed && procClosed) {
        const stdout = reflowLines(stdoutBuf);
        const stderr = reflowLines(stderrBuf);
        prettyPrint({ times });
        resolve({ exitCode, stdout, stderr });
      }
    }

    const command = spawn('tectonic', ['-']);

    command.on('close', (code?: number) => {
      recordTimeFromStart('timeToClose')
      exitCode = code || -1;
      procClosed = true;
      resolveOnClosed();
    });
    command.on('disconnect', () => {
      recordTimeFromStart('timeToDisconnect');
    });
    command.on('error', (error: Error) => {
      recordTimeFromStart('timeToError');
    });
    command.on('exit', (code: number, signal: string) => {
      recordTimeFromStart('timeToExit');
    });
    command.on('message', (msg: any, sendHandle: SendHandle) => {
      recordTimeFromStart('timeToMessage');
    });
    command.on('spawn', () => {
      recordTimeFromStart('timeToSpawn');
    });


    command.stdout.on('data', (output: any) => {
      recordTimeFromStart('stdout.data');
      stdoutBuf.push(output.toString());
    });
    command.stderr.on('data', (output: any) => {
      recordTimeFromStart('stderr.data');
      stderrBuf.push(output.toString());
    });
    command.stderr.on('close', () => {
      recordTimeFromStart('stderr.close');
      stderrClosed = true;
      resolveOnClosed();
    });
    command.stdout.on('close', () => {
      recordTimeFromStart('stdout.close');
      stdoutClosed = true;
      resolveOnClosed();
    });
    command.stdin.write(input)
    command.stdin.end()
  });
}
