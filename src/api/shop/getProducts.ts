import { requestFunc } from '../req'

interface GetProductsRequestBody {
    searchinfo: string;
    searchsort: string;
    limit: number;
    offset: number;
}

interface GetProductByIDRequestBody {
    productID: number;
}

async function getProducts(Searchsort: string): Promise<any> {
    try {
        const res = await requestFunc(`/auth/getProducts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: {
                searchinfo: "",
                searchsort: Searchsort, // 用于分表查询 分为home,history两种
                limit: 10,
                offset: 0,
            } as GetProductsRequestBody,
        }, true);

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

async function getProductByID(id: number): Promise<any> {
    try {
        const res = await requestFunc(`/auth/getProductDetail`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: {
                productID: id,
            } as GetProductByIDRequestBody,
        }, true);

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

export { getProducts, getProductByID };