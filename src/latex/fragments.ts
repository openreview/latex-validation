import _ from 'lodash';
import { nonEmptyLines } from '~/util/files';

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

interface LatexFragment extends FormattedInput {
  document: string;
}

type PrepareLatexFragmentArgs = {
  fragment: string,
  packages: string[]
  // split one word/line
};

export function prepareLatexFragment({
  fragment,
  packages
}: PrepareLatexFragmentArgs): LatexFragment {
  const formatted = formatInputLines(fragment)
  const document = wrapLatex(formatted.fragmentLines, packages);

  return { document, ...formatted };
}

function wrapLatex(fragment: string, packages: string[]): string {
  const docLines = [
    '\\documentclass[11pt,oneside]{book}',
    ...packages,
    '\\begin{document}',
    '{',
    fragment,
    '}',
    '\\end{document}',
  ];
  return docLines.join('\n');
}


interface FormattedInput {
  fragmentLines: string;
  fragmentLinesNumbered: string;
}

function formatInputLines(input: string): FormattedInput {
  const inputLines = nonEmptyLines(input)
  const fragmentLines = inputLines.join('\n');
  const fragmentLinesNumbered = _.map(inputLines,
    (line, i) => `${i + 1}. ${line}`
  ).join('\n');

  return { fragmentLines, fragmentLinesNumbered };
}
