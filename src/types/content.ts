export interface Content {
  id: number
  title: string
  type: 'article' | 'banner' | 'notice'
  content: string
  status: 'published' | 'draft'
  sort: number
  createdAt: string
  updatedAt: string
}

export interface ContentCreateRequest {
  title: string
  type: 'article' | 'banner' | 'notice'
  content: string
  status: 'published' | 'draft'
  sort: number
}

export interface ContentUpdateRequest {
  id: number
  title: string
  type: 'article' | 'banner' | 'notice'
  content: string
  status: 'published' | 'draft'
  sort: number
}

export interface ContentQueryParams {
  title?: string
  type?: 'article' | 'banner' | 'notice'
  status?: 'published' | 'draft'
  page: number
  pageSize: number
}

export interface ContentListResponse {
  list: Content[]
  total: number
  page: number
  pageSize: number
}