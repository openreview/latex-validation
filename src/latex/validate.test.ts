import _ from 'lodash';
import { fileLines, nonEmptyLines  } from '~/util/files';
import { prettyPrint } from '~/util/pretty-print';
import { stripMargin } from '~/util/string-utils';
import { validateLatexFragment } from './validate';

describe('Latex validation', () => {

  const exampleErrors = nonEmptyLines(stripMargin(`
| \\section{Mumble\\footnote{I couldn't think of anything better}}
| \\caption{Energy: \\[e=mc^2\\]}
| \\caption{Energy: \\(e=mc^2\\)}
|`));
  const latexPackageFile = './resources/latex-packages.txt';
  const latexPackages = fileLines(latexPackageFile);
  if (!latexPackages) {
    throw new Error(`Loading ${latexPackageFile}: not found`);
  }

  it('should report errors', async () => {
    // N.B., only running a few examples as it's a very long runtime to test all of them
    for await (const example of exampleErrors) {
      const validation = await validateLatexFragment(example, latexPackages);
      prettyPrint({ validation });
    }
  });

});
