import pactum from 'pactum';
import { SimpleReporter } from '../simple-reporter';
import { StatusCodes } from 'http-status-codes';

describe('ServeRest API', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseTestUrl = 'https://v2.jokeapi.dev';

  p.request.setDefaultTimeout(90000);

  beforeAll(() => {
    p.reporter.add(rep);
  });

  it('deve responder ao ping com sucesso', async () => {
    await p
      .spec()
      .get(`${baseTestUrl}/ping`)
      .expectStatus(StatusCodes.OK)
      .expectJsonLike({
        error: false,
        ping: 'Pong!'
      });
  });
});
