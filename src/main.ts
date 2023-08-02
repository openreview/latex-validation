import { withRestServer } from './server/rest-api';
import { registerCmd, YArgsT, runRegisteredCmds, YArgs } from './util/arglib';

export function registerCLICommands(yargv: YArgsT) {
  registerCmd(
    yargv,
    'run-server',
    'Run REST API Server',
  )(async () => {
    for await (const server of withRestServer()) {
      await new Promise<void>((resolve) => {
        server.on('close', () => {
          resolve();
        });
      });
    }
  });
}

registerCLICommands(YArgs);

runRegisteredCmds(YArgs)
