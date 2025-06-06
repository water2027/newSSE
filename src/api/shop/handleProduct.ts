import { requestFunc } from '../req'

export interface ProductCreation {
  price: number
  name: string
  description: string
  images: string[]
}

export interface PostProductRequestBody {
  UserID: number
  Price: number
  Title: string
  Content: string
  Photos: string[]
  ISAnonymous: boolean
}

async function handleProduct(product: ProductCreation, id: number): Promise<any> {
  try {
    const res = await requestFunc(`/auth/postProduct`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        UserID: id,
        Price: product.price,
        Title: product.name,
        Content: product.description,
        Photos: product.images,
        ISAnonymous: false,
      } as PostProductRequestBody,
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

export { handleProduct }
