import Koa from 'koa';
import KoaRouter from 'koa-router';
import serve from 'koa-static';

import home from './pages/home/public';

const port = 3000;

const app = new Koa();

const router = new KoaRouter();

router.get('/', (ctx, next) => {
  const domain = ctx.hostname;
  ctx.type = 'text/html; charset=utf-8';
  ctx.body = home.stream({ domain });
  return next();
});

app.use(serve(`${__dirname}/public`));

app
  .use(router.routes())
  .use(router.allowedMethods());

console.log(`API server listening on ${port}`);
app.listen(port);
