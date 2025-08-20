import React from 'react'



const buildPageWindow = (currentPage, totalPages) => {
    const pages = []

    const add = (p) => pages.push(p)

    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) add(i)
    } else {
        add(1)
        const left = Math.max(2, currentPage - 1)
        const right = Math.min(totalPages - 1, currentPage + 1)
        if (left > 2) add('...')
        for (let i = left; i <= right; i++) add(i)
        if (right < totalPages - 1) add('...')
        add(totalPages)
    }

    return pages
}



const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    pageSize,
    currentPageCount,
    align = 'center',
    showPageInfo = true,
    className = '',
}) => {
    const safeTotalPages = Math.max(1, Number(totalPages || 1))
    const safeCurrentPage = Math.min(Math.max(1, Number(currentPage || 1)), safeTotalPages)

    const containerAlign = align === 'left'
        ? 'items-center sm:items-center sm:justify-start'
        : align === 'right'
            ? 'items-center sm:items-center sm:justify-end'
            : 'items-center'

    const startIndex = totalItems && pageSize
        ? (safeCurrentPage - 1) * pageSize + 1
        : null

    const endIndex = startIndex && pageSize
        ? startIndex + (currentPageCount ?? 0) - 1
        : null

    const pages = buildPageWindow(safeCurrentPage, safeTotalPages)

    return (
        <div className={`px-4 py-3 border-t border-gray-200 flex flex-col gap-2 ${containerAlign} ${className}`}>
            {showPageInfo && (
                <div className="text-sm text-gray-600 text-center">
                    {totalItems && pageSize && currentPageCount
                        ? (<>
                            Showing {startIndex} to {endIndex} of {totalItems}
                        </>)
                        : (<>
                            Page {safeCurrentPage} of {safeTotalPages}
                        </>)}
                </div>
            )}

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(Math.max(1, safeCurrentPage - 1))}
                    disabled={safeCurrentPage <= 1}
                    className="btn-outline px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Prev
                </button>

                {pages.map((p, i) => (
                    typeof p === 'number' ? (
                        <button
                            key={`p-${p}-${i}`}
                            onClick={() => onPageChange(p)}
                            className={`px-3 py-1 text-sm rounded-md border ${p === safeCurrentPage ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                        >
                            {p}
                        </button>
                    ) : (
                        <span key={`e-${i}`} className="px-2 text-gray-500">{p}</span>
                    )
                ))}

                <button
                    onClick={() => onPageChange(Math.min(safeTotalPages, safeCurrentPage + 1))}
                    disabled={safeCurrentPage >= safeTotalPages}
                    className="btn-outline px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
        </div>
    )
}



export default Pagination

