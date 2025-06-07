import { requestFunc } from '../req'

interface DeleteProductRequestBody {
  productID: number;
}

async function deleteProduct(productID: number): Promise<any> {
  try {
    const res = await requestFunc(`/auth/saleProduct`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        productID: productID,
      } as DeleteProductRequestBody,
    }, true);

    // 添加类型检查
    if (!res) {
      throw new Error('No response received');
    }

    const data = await res.json();
    return data;
  }
  catch (e) {
    alert(e);
    console.error(e);
  }
}

async function saleProduct(productID: number): Promise<any> {
  try {
    const res = await requestFunc(`/auth/saleProduct`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        productID: productID,
      } as DeleteProductRequestBody,
    }, true);

    // 添加类型检查
    if (!res) {
      throw new Error('No response received');
    }

    const data = await res.json();
    return data;
  }
  catch (e) {
    alert(e);
    console.error(e);
  }
}

export { deleteProduct, saleProduct };