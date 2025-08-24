import { Button } from "./button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalCount: number
  startItem: number
  endItem: number
  onPageChange: (page: number) => void
  getPageNumbers: () => (number | string)[]
}

export function Pagination({
  currentPage,
  totalPages,
  totalCount,
  startItem,
  endItem,
  onPageChange,
  getPageNumbers
}: PaginationProps) {
  if (totalCount === 0) return null

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-200">
      {/* Results Summary */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span className="font-medium text-gray-700">Results</span>
        <span className="text-gray-400">•</span>
        <span className="text-gray-600">
          Showing <span className="font-semibold text-gray-900">{startItem.toLocaleString()}</span> to{' '}
          <span className="font-semibold text-gray-900">{endItem.toLocaleString()}</span> of{' '}
          <span className="font-semibold text-gray-900">{totalCount.toLocaleString()}</span>
        </span>
      </div>
      
      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <Button 
          variant="outline" 
          size="sm" 
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-9 px-3 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 border-gray-300"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>
        
        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400 text-sm">
                •••
              </span>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page as number)}
                className={`h-9 w-9 p-0 text-sm font-medium transition-colors ${
                  currentPage === page 
                    ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-sm' 
                    : 'text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900'
                }`}
              >
                {page}
              </Button>
            )
          ))}
        </div>
        
        {/* Next Button */}
        <Button 
          variant="outline" 
          size="sm" 
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-9 px-3 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 border-gray-300"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}
