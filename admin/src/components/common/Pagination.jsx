import React from 'react'
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi'


function getPageNumbers(current, total) {
    const delta = 2
    const range = []
    const rangeWithDots = []
    let l

    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
            range.push(i)
        }
    }

    for (let i of range) {
        if (l) {
            if (i - l === 2) {
                rangeWithDots.push(l + 1)
            } else if (i - l !== 1) {
                rangeWithDots.push('...')
            }
        }
        rangeWithDots.push(i)
        l = i
    }
    return rangeWithDots
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

    if (safeTotalPages <= 1) return null

    const startIndex = totalItems && pageSize
        ? (safeCurrentPage - 1) * pageSize + 1
        : null

    const endIndex = startIndex && pageSize
        ? startIndex + (currentPageCount ?? 0) - 1
        : null

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
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

            <div className="flex justify-center items-center gap-2">
                {/* First Page */}
                <button
                    onClick={() => onPageChange(1)}
                    disabled={safeCurrentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-primary/10 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
                    aria-label="First"
                >
                    <FiChevronsLeft size={15} />
                </button>

                {/* Previous */}
                <button
                    onClick={() => onPageChange(Math.max(1, safeCurrentPage - 1))}
                    disabled={safeCurrentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-primary/10 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    aria-label="Previous"
                >
                    <FiChevronLeft size={15} />
                </button>

                {/* Page numbers with ellipsis */}
                {getPageNumbers(safeCurrentPage, safeTotalPages).map((pg, idx) =>
                    pg === '...' ? (
                        <span key={idx} className="px-2 text-gray-400 select-none">...</span>
                    ) : (
                        <button
                            key={pg}
                            onClick={() => onPageChange(pg)}
                            className={`px-3 py-1 rounded-lg border transition cursor-pointer text-xs
                                ${pg === safeCurrentPage
                                    ? 'bg-primary text-white border-primary font-bold'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-primary/10 text-xs'
                                }
                            `}
                        >
                            {pg}
                        </button>
                    )
                )}

                {/* Next */}
                <button
                    onClick={() => onPageChange(Math.min(safeTotalPages, safeCurrentPage + 1))}
                    disabled={safeCurrentPage === safeTotalPages}
                    className="p-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-primary/10 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    aria-label="Next"
                >
                    <FiChevronRight size={15} />
                </button>

                {/* Last Page */}
                <button
                    onClick={() => onPageChange(safeTotalPages)}
                    disabled={safeCurrentPage === safeTotalPages}
                    className="p-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-primary/10 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    aria-label="Last"
                >
                    <FiChevronsRight size={15} />
                </button>
            </div>
        </div>
    )
}


export default Pagination

