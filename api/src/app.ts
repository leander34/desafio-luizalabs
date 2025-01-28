import 'dotenv/config'

import fastifyCors from '@fastify/cors'
import formbody from '@fastify/formbody'
import fastifyMultipart from '@fastify/multipart'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import fastify, { type FastifyInstance } from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { errorHandler } from '@/error-handler'

import { customersRoutes } from './infra/http/routes/customers/routes'
import { orderFilesRoutes } from './infra/http/routes/order-files/routes'
import { ordersRoutes } from './infra/http/routes/orders/routes'

export class App {
  private _app: FastifyInstance
  constructor() {
    this._app = fastify().withTypeProvider<ZodTypeProvider>()
    this.configs()
    this.middlewares()
    this.routes()
    this.errorHandler()
  }

  get app() {
    return this._app
  }

  configs() {
    this._app.register(fastifyCors)
    this._app.register(formbody)
    this._app.setSerializerCompiler(serializerCompiler)
    this._app.setValidatorCompiler(validatorCompiler)
    this._app.register(fastifyMultipart)
    this._app.register(fastifySwagger, {
      openapi: {
        info: {
          title: 'Desafio labs',
          description: 'Processador de arquivos legados',
          version: '1.0.0',
        },
      },
      transform: jsonSchemaTransform,
    })
  }

  middlewares() {}

  routes() {
    this._app.register(fastifySwaggerUI, {
      routePrefix: '/docs',
    })
    this._app.register(orderFilesRoutes)
    this._app.register(customersRoutes, {
      prefix: '/users',
    })
    this._app.register(ordersRoutes, {
      prefix: '/orders',
    })
  }

  errorHandler() {
    this._app.setErrorHandler(errorHandler)
  }
}

export const app = new App().app
