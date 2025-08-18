import { join } from 'path';
import { createBot, createProvider, createFlow, addKeyword } from '@builderbot/bot';
import { MemoryDB as Database } from '@builderbot/bot';
import { MetaProvider as Provider } from '@builderbot/provider-meta';
import { initDB } from './db';

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
    jwtToken: 'EAAUaowzWqOgBPDZBfImHKHeLAxLidUmI5VOfbGoM4KOozH23CZAuZBv9YksLZAmtemwgd9jowuE67oMHnFKLPFAZCeRYtqSAK7dlet8PcOC2eL8HYHZCZCegZAuxUyj6z2uS52WDw2BGeFn2kEZCV6qEW9iwjCoiQT6LeWoLEShvLfyE25ZBSmhaZAOZCi0ZBERgId1GEP9u5X2WiFB9kIBLNqalYMeE0RrBK4hXVIf7QaZC1nEAQ9vgZDZD',
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

  adapterProvider.server.post(
    '/api/candidato',
    handleCtx(async (_bot, req, res) => {
      const db = await initDB();
      const {
        telefono,
        edad,
        vivienda,
        cochera,
        dependientes,
        recibo_predial,
        rento_antes
      } = req.body;
      const sql =
        'INSERT INTO candidatos (telefono, edad, vivienda, cochera, dependientes, recibo_predial, rento_antes) VALUES (?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE edad=?, vivienda=?, cochera=?, dependientes=?, recibo_predial=?, rento_antes=?';
      await db.execute(sql, [
        telefono,
        edad,
        vivienda,
        cochera ? 1 : 0,
        dependientes,
        recibo_predial ? 1 : 0,
        rento_antes ? 1 : 0,
        edad,
        vivienda,
        cochera ? 1 : 0,
        dependientes,
        recibo_predial ? 1 : 0,
        rento_antes ? 1 : 0
      ]);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ status: 'ok' }));
    })
  );

  adapterProvider.server.get(
    '/api/candidato/:telefono',
    handleCtx(async (_bot, req, res) => {
      const db = await initDB();
      const { telefono } = req.params as any;
      const [rows] = await db.execute(
        'SELECT telefono, edad, vivienda, cochera, dependientes, recibo_predial, rento_antes FROM candidatos WHERE telefono = ?',
        [telefono]
      );
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify((rows as any)[0] ?? {}));
    })
  );

  adapterProvider.server.post(
    '/api/cita',
    handleCtx(async (_bot, req, res) => {
      const db = await initDB();
      const { telefono, fecha } = req.body;
      const target = new Date(fecha);
      // search next available date if the requested one is taken
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const dateStr = target.toISOString().slice(0, 10);
        const [rows] = await db.execute('SELECT id FROM citas WHERE fecha = ?', [
          dateStr
        ]);
        if ((rows as any).length === 0) break;
        target.setDate(target.getDate() + 1);
      }
      const finalDate = target.toISOString().slice(0, 10);
      await db.execute('INSERT INTO citas (telefono, fecha) VALUES (?, ?)', [
        telefono,
        finalDate
      ]);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(
        JSON.stringify({ status: 'ok', fecha: finalDate })
      );
    })
  );

  adapterProvider.server.get(
    '/api/cita/:telefono',
    handleCtx(async (_bot, req, res) => {
      const db = await initDB();
      const { telefono } = req.params as any;
      const [rows] = await db.execute(
        'SELECT telefono, fecha FROM citas WHERE telefono = ?',
        [telefono]
      );
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify((rows as any)[0] ?? {}));
    })
  );

  httpServer(+PORT);
};

main();
