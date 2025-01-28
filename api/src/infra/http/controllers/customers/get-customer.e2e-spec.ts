import { app } from '@/app'
// const prisma = new PrismaClient()
// const app = fastify()

// app.get('/customer', async (req, res) => {
//   const customer = await prisma.customer.findMany({})

//   return res.send(customer)
// })
describe.skip('Answer question (E2E)', () => {
  beforeAll(async () => {
    // await prismaClient.$connect()
    // await app.ready()
    // await app.ready()
  })

  afterAll(async () => {
    await app.close()
    // await app.close()
  })

  test('[GET] /customer/:id', async () => {
    console.log(process.env.DATABASE_URL)
    console.log(process.env.REDIS_DB)

    // const customers = await prisma.customer.findMany({})
    // const customers2 = await prismaClient2.customer.findMany({})
    // console.log(customers)
    // console.log(customers2)
    const res = await app.inject({
      method: 'GET',
      url: `/customers/1`,
    })
    console.log(res.body)
    console.log(res.json())
    console.log(res.payload)

    // const response = await request(app.server).get(`/customers/1`)
    // console.log(response.body)

    expect(404).toEqual(404)
  })
})
