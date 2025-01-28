import { env } from '@/config/env'

import { app } from './app'

app
  .listen({
    port: env.PORT,
    host: '0.0.0.0',
  })
  .then(() => console.log(`HTTP server is running at PORT: ${env.PORT}`))
