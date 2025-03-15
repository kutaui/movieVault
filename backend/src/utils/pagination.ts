export function Pagination(page: number, perPage: number, totalCount: number) {
	const totalPages = Math.ceil(totalCount / perPage)
	const currentPage = page
	const previousPage = page - 1
	const nextPage = page + 1
	const isFirstPage = page === 1
	const isLastPage = page === totalPages

	return {
		page,
		perPage,
		totalPages,
		currentPage,
		previousPage,
		nextPage,
		isFirstPage,
		isLastPage,
	}
}
