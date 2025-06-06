import { requestFunc } from '../req'

// interface GetProductsRequestBody {
//   searchinfo: string
//   searchsort: string
//   limit: number
//   offset: number
// }

// interface GetProductByIDRequestBody {
//   productID: number
// }

export interface Product {
  SellerID: number
  ProductID: number
  Seller: string
  Price: number
  Name: string
  Description: string
  Photos: string[]
  ISAnonymous: boolean
}

export interface ProductDetail {
  SellerID: number
  ProductID: number
  Seller: string
  Price: number
  Name: string
  Description: string
  Photos: string[]
  ISAnonymous: boolean
}

async function getProducts(Searchsort: string): Promise<Product[]> {
  try {
    const res = await requestFunc(`/auth/getProducts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        searchinfo: '',
        searchsort: Searchsort, // 用于分表查询 分为home,history两种
        limit: 10,
        offset: 0,
      },
    }, true)

    if (!res) {
      throw new Error('No response received')
    }

    const data = await res.json() as Product[]
    return data || []
  }
  catch (e) {
    console.error(e)
    return []
  }
}

async function getProductByID(id: number): Promise<ProductDetail> {
  try {
    const res = await requestFunc(`/auth/getProductDetail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        productID: id,
      },
    }, true)

    if (!res) {
      throw new Error('No response received')
    }

    const data = await res.json() as ProductDetail
    return data
  }
  catch (e) {
    console.error(e)
    return {
      SellerID: 0,
      ProductID: 0,
      Seller: '',
      Price: 0,
      Name: '',
      Description: '',
      Photos: [],
      ISAnonymous: false,
    }
  }
}

export { getProductByID, getProducts }
