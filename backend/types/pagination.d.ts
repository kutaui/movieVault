type OrderDirection = 'asc' | 'desc'

type PaginationQueryStringType<
	T extends Record<string, unknown>,
	TOrderable = string
> = {
	page: number
	limit: number
	orderBy?: TOrderable
	order?: OrderDirection
} & T


