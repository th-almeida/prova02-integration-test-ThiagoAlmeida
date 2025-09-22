import pactum from 'pactum';
import { SimpleReporter } from '../simple-reporter';
import { StatusCodes } from 'http-status-codes';

describe('ServeRest API', () => {
  let idUsuario = '';
  const p = pactum;
  const rep = SimpleReporter;
  //const basetest = 'https://v2.jokeapi.dev/endpoints'
  const baseTestUrl = 'https://v2.jokeapi.dev'

  p.request.setDefaultTimeout(90000);

  beforeAll(async () => {
    p.reporter.add(rep);

    idUsuario = await p
      .spec()
      .get(`${baseTestUrl}/ping`)
      .expectStatus(StatusCodes.OK)
      .expectBodyContains('Teste realizado com sucesso')

  });
});