import { execTectonic } from './tectonic';
import { prettyPrint, putStrLn } from './util/pretty-print';
import _ from 'lodash';
import { fileLines, readTextFile } from './util/files';
import { prepareLatexFragment  } from './latex/fragments';

describe('Tectonic Execution', () => {

  function latexExamples(): string[] {
    const examples = fileLines('./test/latex-examples.txt');
    return examples || [];
  }

  // it('should record process spawn/runtime', async () => {});
  it('should pass valid examples', async () => {
    // N.B., only running a few examples as it's a very long runtime to test all of them
    const examples = latexExamples();
    for await (const example of examples.slice(0, 3)) {
      const { document, fragmentLinesNumbered  } = prepareLatexFragment({ fragment: example });


      const { stderr } = await execTectonic(document);
      if (stderr.length > 0) {
        putStrLn(`Error> ${example}`);
        putStrLn(stderr.join('\n'));
        putStrLn('Example is: ');
        putStrLn(fragmentLinesNumbered);
        putStrLn()
      } else {
        putStrLn(`Ok> ${example}`);
      }
    }
  });

});
