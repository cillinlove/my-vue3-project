export interface ProductCategory {
  id: number
  name: string
}

export interface Product {
  id: number
  name: string
  price: number
  stock: number
  category: number
  categoryName?: string
  images: string[]
  createdAt: string
  updatedAt: string
}

export interface ProductCreateRequest {
  name: string
  price: number
  stock: number
  category: number
  images: string[]
}

export interface ProductUpdateRequest {
  id: number
  name: string
  price: number
  stock: number
  category: number
  images: string[]
}

export interface ProductQueryParams {
  name?: string
  category?: number
  page: number
  pageSize: number
}

export interface ProductListResponse {
  list: Product[]
  total: number
  page: number
  pageSize: number
}
