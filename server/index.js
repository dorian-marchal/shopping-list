const _ = require('lodash');
const Koa = require('koa');
const Router = require('koa-router');
const cors = require('koa-cors');
const bodyParser = require('koa-bodyparser');
const app = new Koa();
const router = new Router();

const SERVER_PORT = 3001;

const { log } = console;

const nextId = () => parseInt(_.uniqueId(), 10);

let availableProducts = [
  { id: nextId(), name: 'Citron' },
  { id: nextId(), name: 'Lait' },
  { id: nextId(), name: 'Oeuf' },
  { id: nextId(), name: 'Pain' },
  { id: nextId(), name: 'Jambon' },
  { id: nextId(), name: 'Ketchup' },
];

let shoppingList = [availableProducts[0].id, availableProducts[3].id];

router
  .get('/availableProducts', async (ctx, next) => {
    ctx.body = availableProducts;
    await next();
  })

  .post('/availableProducts/add', async (ctx, next) => {
    const { productName } = ctx.request.body;
    if (_.isString(productName)) {
      const newProduct = {
        id: nextId(),
        name: productName,
      };
      availableProducts = [...availableProducts, newProduct];
      ctx.body = newProduct;
      log(`Added product '${productName}'`);
    } else {
      ctx.status = 400;
      ctx.body = {
        error: '`productName` parameter not found.',
      };
    }
    await next();
  })

  .get('/shoppingList', async (ctx, next) => {
    ctx.body = shoppingList;
    await next();
  })

  .post('/shoppingList/add', async (ctx, next) => {
    const { id } = ctx.request.body;
    const product = _.find(availableProducts, ['id', id]);
    if (_.isNil(product)) {
      ctx.status = 400;
      ctx.body = {
        error: 'Product not found.',
      };
    } else {
      if (shoppingList.includes(id)) {
        log(`Item '${product.name}' already in the list`);
      } else {
        shoppingList = [...shoppingList, product.id];
        log(`Added item '${product.name}'`);
      }
      ctx.body = shoppingList;
    }
    await next();
  })

  .post('/shoppingList/remove', async (ctx, next) => {
    const { id } = ctx.request.body;
    if (!shoppingList.includes(id)) {
      ctx.status = 400;
      ctx.body = {
        error: `No item for ID ${id}`,
      };
    } else {
      shoppingList = shoppingList.filter((productId) => productId !== id);
      ctx.body = shoppingList;
      log(`Removed item n°${id}`);
    }
    await next();
  });

function delay(delayMs) {
  return async (ctx, next) => {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    await next();
  };
}

function logger() {
  return async (ctx, next) => {
    const { method, url } = ctx.request;
    log('\n');
    log('―――――');
    log(`${method} ${url}...`);
    await next();
    const { status, message } = ctx.response;
    log(`――――― ${status} ${message}`);
  };
}

app
  .use(cors())
  .use(delay(300))
  .use(bodyParser())
  .use(logger())
  .use(router.routes());

app.listen(SERVER_PORT, () => log(`Listening on port ${SERVER_PORT}...`));
