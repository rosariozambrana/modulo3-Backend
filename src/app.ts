import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import { errorHandler, notFoundHandler } from './common/middlewares/errorHandler';
import clienteRoutes from './modules/clientes/cliente.routes';
import productoRoutes from './modules/productos/producto.routes';
import pedidoRoutes from './modules/pedidos/pedido.routes';

export function createApp(): Application {
  const app = express();


  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );
  app.use(cors({ origin: env.corsOrigin === '*' ? '*' : env.corsOrigin.split(',') }));
  app.use(express.json());
  if (env.nodeEnv !== 'test') {
    app.use(morgan('dev'));
  }
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api/clientes', clienteRoutes);
  app.use('/api/productos', productoRoutes);
  app.use('/api/pedidos', pedidoRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
