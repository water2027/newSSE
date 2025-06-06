import { requestFunc } from '../req'

// interface DeleteProductRequestBody {
//   productID: number
// }

async function deleteProduct(productID: number): Promise<any> {
  try {
    const res = await requestFunc(`/auth/deleteProduct`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        productID,
      },
    }, true)

    // 添加类型检查
    if (!res) {
      throw new Error('No response received')
    }

    const data = await res.json()
    return data
  }
  catch (e) {
    console.error(e)
  }
}

export { deleteProduct }
