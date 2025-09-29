import pactum from 'pactum';
import { SimpleReporter } from '../simple-reporter';
import { StatusCodes } from 'http-status-codes';
import { faker } from '@faker-js/faker';

describe('JokeAPI Tests', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = 'https://v2.jokeapi.dev';

  p.request.setDefaultTimeout(60000);

  beforeAll(() => {
    p.reporter.add(rep);
  });

  afterAll(() => {
    p.reporter.end();
  });

  describe('System Endpoints', () => {
    it('deve responder ao ping com sucesso', async () => {
      await p
        .spec()
        .get(`${baseUrl}/ping`)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          error: false,
          ping: 'Pong!'
        })
        .expectHeaderContains('content-type', 'application/json');
    });

    it('deve retornar informações da API', async () => {
      await p
        .spec()
        .get(`${baseUrl}/info`)
        .expectStatus(StatusCodes.OK)
        .expectBodyContains('version')
        .expectBodyContains('jokes')
        .expectBodyContains('categories')
        .expectJsonSchema({
          type: 'object',
          properties: {
            error: { type: 'boolean' },
            version: { type: 'string' },
            jokes: { type: 'object' }
          },
          required: ['error', 'version', 'jokes']
        });
    });

    it('deve retornar categorias disponíveis', async () => {
      await p
        .spec()
        .get(`${baseUrl}/categories`)
        .expectStatus(StatusCodes.OK)
        .expectBodyContains('categories')
        .expectBodyContains('categoryAliases')
        .expectJsonLike({
          error: false
        });
    });

    it('deve retornar flags disponíveis', async () => {
      await p
        .spec()
        .get(`${baseUrl}/flags`)
        .expectStatus(StatusCodes.OK)
        .expectBodyContains('flags')
        .expectJsonLike({
          error: false
        });
    });

    it('deve retornar formatos disponíveis', async () => {
      await p
        .spec()
        .get(`${baseUrl}/formats`)
        .expectStatus(StatusCodes.OK)
        .expectBodyContains('formats')
        .expectJsonLike({
          error: false
        });
    });

    it('deve retornar lista de endpoints', async () => {
      await p
        .spec()
        .get(`${baseUrl}/endpoints`)
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'array'
        });
    });

    it('deve retornar idiomas suportados', async () => {
      await p
        .spec()
        .get(`${baseUrl}/languages`)
        .expectStatus(StatusCodes.OK)
        .expectBodyContains('jokeLanguages')
        .expectBodyContains('systemLanguages');
    });

    it('deve retornar código de idioma para português', async () => {
      await p
        .spec()
        .get(`${baseUrl}/langcode/portuguese`)
        .expectStatus(StatusCodes.OK)
        .expectBodyContains('code')
        .expectJsonLike({
          error: false,
          code: 'pt'
        });
    });

    it('deve retornar código de idioma para inglês', async () => {
      await p
        .spec()
        .get(`${baseUrl}/langcode/english`)
        .expectStatus(StatusCodes.OK)
        .expectBodyContains('code')
        .expectJsonLike({
          error: false,
          code: 'en'
        });
    });
  });

  describe('Joke Endpoints', () => {
    it('deve retornar piada de qualquer categoria', async () => {
      await p
        .spec()
        .get(`${baseUrl}/joke/Any`)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          error: false
        })
        .expectResponseTime(5000);
    });

    it('deve retornar piada de programação', async () => {
      await p
        .spec()
        .get(`${baseUrl}/joke/Programming`)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          error: false,
          category: 'Programming'
        });
    });

    it('deve retornar piada sombria', async () => {
      await p
        .spec()
        .get(`${baseUrl}/joke/Dark`)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          error: false,
          category: 'Dark'
        });
    });

    it('deve retornar múltiplas piadas', async () => {
      await p
        .spec()
        .get(`${baseUrl}/joke/Any`)
        .withQueryParams({
          amount: 3
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          error: false,
          amount: 3
        });
    });

    it('deve retornar piadas em formato específico', async () => {
      await p
        .spec()
        .get(`${baseUrl}/joke/Any`)
        .withQueryParams({
          format: 'json'
        })
        .expectStatus(StatusCodes.OK)
        .expectHeaderContains('content-type', 'application/json');
    });

    it('deve retornar piada com filtro de tipo single', async () => {
      await p
        .spec()
        .get(`${baseUrl}/joke/Any`)
        .withQueryParams({
          type: 'single'
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          error: false,
          type: 'single'
        });
    });

    it('deve retornar piada com filtro de tipo twopart', async () => {
      await p
        .spec()
        .get(`${baseUrl}/joke/Any`)
        .withQueryParams({
          type: 'twopart'
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          error: false,
          type: 'twopart'
        });
    });

    it('deve retornar piada com blacklist flags', async () => {
      await p
        .spec()
        .get(`${baseUrl}/joke/Any`)
        .withQueryParams({
          blacklistFlags: 'nsfw,racist'
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          error: false
        });
    });

    it('deve retornar piada contendo palavra específica', async () => {
      await p
        .spec()
        .get(`${baseUrl}/joke/Programming`)
        .withQueryParams({
          contains: 'code'
        })
        .expectStatus(StatusCodes.OK);
    });

    it('deve retornar erro para categoria inválida', async () => {
      await p
        .spec()
        .get(`${baseUrl}/joke/InvalidCategory`)
        .expectStatus(StatusCodes.BAD_REQUEST)
        .expectJsonLike({
          error: true
        });
    });

    it('deve retornar erro para ID range inválido', async () => {
      await p
        .spec()
        .get(`${baseUrl}/joke/Any`)
        .withQueryParams({
          idRange: '999999-999999'
        })
        .expectStatus(StatusCodes.BAD_REQUEST)
        .expectJsonLike({
          error: true
        });
    });
  });

  describe('Submit Joke Endpoint', () => {
    it('deve testar submissão de piada com dry-run', async () => {
      await p
        .spec()
        .post(`${baseUrl}/submit`)
        .withQueryParams({
          'dry-run': true
        })
        .withJson({
          formatVersion: 3,
          category: 'Misc',
          type: 'single',
          joke: faker.lorem.sentence(),
          flags: {
            nsfw: false,
            religious: false,
            political: false,
            racist: false,
            sexist: false,
            explicit: false
          },
          lang: 'en'
        })
        .expectStatus(StatusCodes.CREATED)
        .expectJsonLike({
          error: false
        });
    });

    it('deve testar submissão de piada twopart com dry-run', async () => {
      await p
        .spec()
        .post(`${baseUrl}/submit`)
        .withQueryParams({
          'dry-run': true
        })
        .withJson({
          formatVersion: 3,
          category: 'Programming',
          type: 'twopart',
          setup: faker.lorem.sentence(),
          delivery: faker.lorem.sentence(),
          flags: {
            nsfw: false,
            religious: false,
            political: false,
            racist: false,
            sexist: false,
            explicit: false
          },
          lang: 'en'
        })
        .expectStatus(StatusCodes.CREATED)
        .expectJsonLike({
          error: false
        });
    });

    it('deve retornar erro para submissão inválida', async () => {
      await p
        .spec()
        .post(`${baseUrl}/submit`)
        .withQueryParams({
          'dry-run': true
        })
        .withJson({
          formatVersion: 3,
          category: 'InvalidCategory',
          type: 'single',
          joke: '',
          flags: {
            nsfw: false,
            religious: false,
            political: false,
            racist: false,
            sexist: false,
            explicit: false
          },
          lang: 'en'
        })
        .expectStatus(StatusCodes.BAD_REQUEST);
    });

    it('deve retornar erro para formato de versão inválido', async () => {
      await p
        .spec()
        .post(`${baseUrl}/submit`)
        .withQueryParams({
          'dry-run': true
        })
        .withJson({
          formatVersion: 1,
          category: 'Misc',
          type: 'single',
          joke: faker.lorem.sentence(),
          flags: {
            nsfw: false,
            religious: false,
            political: false,
            racist: false,
            sexist: false,
            explicit: false
          },
          lang: 'en'
        })
        .expectStatus(StatusCodes.BAD_REQUEST);
    });
  });
});
