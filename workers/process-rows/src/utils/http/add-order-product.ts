import { createOrderProductHttp } from '@/http/orders/create-order-product-http'
interface FindOrCreateClientParams {
  productId: number
  orderId: number
  currentProductValue: number
}
export async function addOrderProduct({
  orderId,
  productId,
  currentProductValue,
}: FindOrCreateClientParams) {
  try {
    // const { orderProduct } = await getOrderProductHttp({
    //   orderId,
    //   productId,
    // })

    // if (orderProduct.value === currentProductValue) {
    //   // aumentar a quantidade
    //   await updateQuantifyOfProductsInTheOrderHttp({
    //     orderId,
    //     productId,
    //   })

    //   return {
    //     ...orderProduct,
    //     quantity: orderProduct.quantity++,
    //   }
    // }

    const productCreated = await createOrderProductHttp({
      orderId,
      productId,
      value: currentProductValue,
    })

    return productCreated
  } catch (error) {
    // if (error instanceof AxiosError && error.status === 404) {
    //   try {
    //     const productCreated = await createOrderProductHttp({
    //       orderId,
    //       productId,
    //       value: currentProductValue,
    //     })
    //     return productCreated
    //   } catch (error) {
    //     return null
    //   }
    // }
    return null
  }
}
