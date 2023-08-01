import { execTectonic } from './tectonic';
import fs from 'fs-extra';
import { prettyPrint, putStrLn } from './util/pretty-print';
import _ from 'lodash';

describe('Tectonic Execution', () => {
  function readTextFile(filename: string): string | undefined {
    if (!fs.existsSync(filename)) return;
    return fs.readFileSync(filename).toString();
  }
  function latexExamples(): string[] {
    const examples = readTextFile('./test/latex-examples.txt');
    if (examples) {
      return examples.split('\n')
        .map(latexStr => latexStr.trim())
        .filter(s => s.length > 0);
    }
    return [];
  }



  const docHeaders = `
\\documentclass[11pt,oneside]{book}
\\usepackage{enumitem}
\\usepackage{fancyhdr}
\\usepackage[a4paper,top=2cm,bottom=3cm,left=2cm,right=2cm,marginparwidth=1.75cm]{geometry}
\\usepackage{hyperref}
\\usepackage{eurosym}

%\\usepackage[T1]{fontenc}
% For Vietnamese characters
\\usepackage[T5]{fontenc}
\\usepackage[utf8]{inputenc}

\\usepackage{multicol}
\\usepackage{pdfpages}
\\usepackage{times}
\\usepackage{amsmath}
\\usepackage[english,latin]{babel}
`;






  // \\BLOCK{if not nopax}
  // \\usepackage{pax}
  // \\BLOCK{endif}

  function wrapLatex(fragment: string): string {
    // \\documentclass[a4paper]{article}
    const latexDoc = `
${docHeaders}
\\begin{document}
{
 ${fragment}
}
\\end{document}
`;
    return latexDoc;
  }
  type FormattedInput = {
    lines: string,
    numberedLines: string
  }
  function formatInput(input: string): FormattedInput {
    const linesArray = input.split('\n').filter(s => s.length > 0);
    const lines = linesArray.join('\n');
    const numberedLines = _.map(linesArray,
      (line, i) => `${i + 1}. ${line}`
    ).join('\n');

    return { lines, numberedLines };
  }

  it.only('should run examples', async () => {
    const examples = latexExamples();
    for await (const example of examples) {
      const latexDoc = wrapLatex(example);
      const { lines, numberedLines } = formatInput(latexDoc);

      const { stdout, stderr } = await execTectonic(lines);
      if (stderr.length > 0) {
        putStrLn(`Error> ${example}`);
        putStrLn(stderr.join('\n'));
        putStrLn('Example is: ');
        putStrLn(numberedLines);
        putStrLn()
      } else {
        putStrLn(`Ok> ${example}`);
      }
    }
  });




  it('example1', async () => {
    const examples = latexExamples();
    // console.table(examples);
    for await (const example of examples.slice(0, 1)) {

      // $ \\textbf{\\Sigma} $ -Additivity in Measure Theory
      const tokens = (' $ {\\Sigma} \\ismath $ -Additivity in Measure Theory ');


      const latexDoc = `
\\documentclass[a4paper]{article}
\\begin{document}
\\newcommand{\\ismath}{\\ifmmode \\mathrm{Yes}\\else No\\fi.}
{
 ${tokens}
}
\\end{document}
`;
      const lines = latexDoc.split('\n').filter(s => s.length > 0);
      // prettyPrint({ lines })
      const numberedLines = _.map(lines,
        (line, i) => `${i}. ${line}`
      ).join('\n');

      putStrLn(numberedLines);
      const result = await execTectonic(lines.join('\n'));
      prettyPrint({ result });

    }
  });
});
