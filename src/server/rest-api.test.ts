import _ from 'lodash';
import { withRestServer } from './rest-api';
import axios from 'axios';
import { nonEmptyLines } from '~/util/files';
import { stripMargin } from '~/util/string-utils';
import { prettyPrint } from '~/util/pretty-print';


describe('REST Endpoints', () => {

  const examples = nonEmptyLines(stripMargin(`
| \\section{Mumble\\footnote{I couldn't think of anything better}}
| \\caption{Energy: \\[e=mc^2\\]}
| \\caption{Energy: \\(e=mc^2\\)}
|`));

  it('should use withServer() and properly shutdown', async () => {
    for await (const __ of withRestServer()) {
      const url = 'http://localhost:9100/latex/fragment';
      for await (const example of examples) {
        const resp = await axios.post(url, {latex: example});
        const data = resp.data;
        prettyPrint({ response: data })
      }
    }
  });

});
