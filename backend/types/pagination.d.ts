type PaginationQueryStringType<T extends Record<string, string>> = {
	page: number
	limit: number
} & T
