type PaginationQueryString<T extends Record<string, string>> = {
	page: number
	limit: number
} & T
