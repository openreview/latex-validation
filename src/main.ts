import { prepareLatexFragment } from './latex/fragments';
import { isSuccess, validateLatexFragment } from './latex/validate';
import { withRestServer } from './server/rest-api';
import { registerCmd, YArgsT, runRegisteredCmds, YArgs, opt } from './util/arglib';
import { fileLines } from './util/files';
import { putStrLn } from './util/pretty-print';

export function registerCLICommands(yargv: YArgsT) {
  registerCmd(
    yargv,
    'run-server',
    'Run REST API Server',
    opt.existingFile('latex-packages')
  )(
    async (args) => {
      const { latexPackages } = args;

      const packageList = fileLines(latexPackages);
      if (!packageList) {
        putStrLn(`Error, package list could not be loaded from ${latexPackages}`);
        return;
      }

      for await (const server of withRestServer(packageList)) {
        await new Promise<void>((resolve) => {
          server.on('close', () => {
            resolve();
          });
        });
      }
    });

  registerCmd(
    yargv,
    'validate',
    'Validate a fragment',
    opt.file('latex-packages'),
    opt.str('fragment')
  )(async (args) => {
    const { latexPackages, fragment } = args;

    const packageList = fileLines(latexPackages);
    if (!packageList) {
      putStrLn(`Error, package list could not be loaded from ${latexPackages}`);
      return;
    }

    const result = await validateLatexFragment(fragment, packageList);
    if (!isSuccess(result)) {
      const message = result.errors.map(e => e.message).join('\n');
      putStrLn(message)
      return;
    }
    putStrLn('Ok');
  });

  registerCmd(
    yargv,
    'make-document',
    'Create a fully-formed wrapped document from a fragment',
    opt.file('latex-packages'),
    opt.str('fragment')
  )(async (args) => {
    const { latexPackages, fragment } = args;

    const packageList = fileLines(latexPackages);
    if (!packageList) {
      putStrLn(`Error, package list could not be loaded from ${latexPackages}`);
      return;
    }
    const { document, fragmentLinesNumbered } = prepareLatexFragment({ fragment, packages: packageList });
    putStrLn(document);

  });
}

registerCLICommands(YArgs);

runRegisteredCmds(YArgs)
