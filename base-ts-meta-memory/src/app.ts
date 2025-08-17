import { join } from 'path';
import { createBot, createProvider, createFlow, addKeyword } from '@builderbot/bot';
import { MemoryDB as Database } from '@builderbot/bot';
import { MetaProvider as Provider } from '@builderbot/provider-meta';

const PORT = process.env.PORT ?? 3009;

const welcomeFlow = addKeyword<Provider, Database>(['hi', 'hello', 'hola'])
  .addAnswer(
    '¡Hola! , si estás interesado en rentar un auto para trabajar en Uber o Didi, te haré unas preguntas.'
  )
  .addAnswer('¿Cuál es tu rango de edad?', {
    buttons: [
      { body: '18-23' },
      { body: '24-30' },
      { body: '31 o más' }
    ]
  });

const underageFlow = addKeyword<Provider, Database>(['18-23'])
  .addAnswer('Lo siento, no cumples con los requisitos. ¡Que tengas un excelente dia! 😊');

const ageQualifyFlow = addKeyword<Provider, Database>(['24-30', '31 o más'])
  .addAnswer('¿Vivienda propia o prestada?', {
    buttons: [
      { body: 'Vivienda propia' },
      { body: 'Vivienda prestada' }
    ]
  });


const housingFlow = addKeyword<Provider, Database>(['Vivienda propia', 'Vivienda prestada'])
  .addAnswer('¿Cuenta con cochera cerrada?', {
    buttons: [
      { body: 'Tengo cochera' },
      { body: 'No tengo cochera' }
    ]
  });

const noGarageFlow = addKeyword<Provider, Database>(['No tengo cochera'])
  .addAnswer('Lo siento, no cumples con los requisitos.');

const garageYesFlow = addKeyword<Provider, Database>(['Tengo cochera'])
  .addAnswer('¿Cuántos dependientes tiene?', {
    buttons: [
      { body: 'Ninguno' },
      { body: '1-2' },
      { body: '3 o más' }
    ]
  });

const dependentsDisqualifyFlow = addKeyword<Provider, Database>(['3 o más'])
  .addAnswer('Lo siento, no cumples con los requisitos.');

const dependentsQualifyFlow = addKeyword<Provider, Database>(['Ninguno', '1-2'])
  .addAnswer('¿Cuenta con recibo predial a su nombre?', {
    buttons: [
      { body: 'Sí, tengo recibo' },
      { body: 'No, no tengo recibo' }
    ]
  });

const noReceiptFlow = addKeyword<Provider, Database>(['No, no tengo recibo'])
  .addAnswer('Lo siento, no cumples con los requisitos.');

const receiptFlow = addKeyword<Provider, Database>(['Sí, tengo recibo'])
  .addAnswer('¿Ha rentado auto antes?', {
    buttons: [
      { body: 'He rentado antes' },
      { body: 'Nunca he rentado' }
    ]
  });

const finalRented = addKeyword<Provider, Database>(['He rentado antes', 'Nunca he rentado'])
  .addAnswer(
    '¡Felicidades! Eres apto para una reunión presencial mañana a las 7:00 PM en Venecia 607, cerca del CBTis 110. A continuación te envío la dirección del lugar ¡Te esperamos!'
  )
  .addAnswer(
    'Aquí puedes ver la ubicación en el mapa: https://maps.app.goo.gl/TEHcTAbzW2U9ucpQ6'
  );

const main = async () => {
  const adapterFlow = createFlow([
    welcomeFlow,
    underageFlow,
    ageQualifyFlow,
    housingFlow,
    noGarageFlow,
    garageYesFlow,
    dependentsQualifyFlow,
    dependentsDisqualifyFlow,
    noReceiptFlow,
    receiptFlow,
    finalRented
  ]);

  const adapterProvider = createProvider(Provider, {
    jwtToken: 'EAAUaowzWqOgBPDSZAzqcj2sl9VJqeZBnA61inNZBDo6qe8ZAOWOk6QkPIkTQ6uNxniDYrgUyEkRZCwC33yryi6wsLn4wq5WrkJzRrvfcbnV77SngIc9ZA2C778wERJ8f3wnJOH3h38nsIAoi1hqivpe2c7hIXZA41LmBfh7ZAyOCPVG4NRRZAJ2BZBuoLWdttIXnudbGH8oqtfd0da7cIQxzJ1fe2SqBhOIh0LkRRoozZC12tRtTQZDZD',
    numberId: '768026173041214',
    verifyToken: 'gato',
    version: 'v22.0'
  });

  const adapterDB = new Database();

  const { handleCtx, httpServer } = await createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB
  });

  adapterProvider.server.post(
    '/v1/messages',
    handleCtx(async (bot, req, res) => {
      const { number, message, urlMedia } = req.body;
      await bot.sendMessage(number, message, { media: urlMedia ?? null });
      return res.end('sended');
    })
  );

  adapterProvider.server.post(
    '/v1/register',
    handleCtx(async (bot, req, res) => {
      const { number, name } = req.body;
      await bot.dispatch('REGISTER_FLOW', { from: number, name });
      return res.end('trigger');
    })
  );

  adapterProvider.server.post(
    '/v1/blacklist',
    handleCtx(async (bot, req, res) => {
      const { number, intent } = req.body;
      if (intent === 'remove') bot.blacklist.remove(number);
      if (intent === 'add') bot.blacklist.add(number);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ status: 'ok', number, intent }));
    })
  );

  httpServer(+PORT);
};

main();
