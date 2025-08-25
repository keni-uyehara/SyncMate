import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FilterOption {
  value: string
  label: string
}

interface FilterConfig {
  key: string
  label: string
  options: FilterOption[]
  value: string
  onValueChange: (value: string) => void
}

interface SearchFilterBarProps {
  searchPlaceholder?: string
  filterOptions?: FilterOption[]
  filterLabel?: string
  onSearchChange?: (value: string) => void
  onFilterChange?: (value: string) => void
  searchValue?: string
  filterValue?: string
  // New props for multiple filters
  additionalFilters?: FilterConfig[]
  onClearAllFilters?: () => void
  showClearButton?: boolean
}

export function SearchFilterBar({
  searchPlaceholder = "Search...",
  filterOptions = [],
  filterLabel = "Filter",
  onSearchChange,
  onFilterChange,
  searchValue = "",
  filterValue = "all",
  additionalFilters = [],
  onClearAllFilters,
  showClearButton = false
}: SearchFilterBarProps) {
  const hasActiveFilters = filterValue !== "all" || additionalFilters.some(filter => filter.value !== "all")

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder={searchPlaceholder}
          className="pl-10 w-64"
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
        />
      </div>

      {/* Additional filters */}
      {additionalFilters.map((filter) => (
        <Select key={filter.key} value={filter.value} onValueChange={filter.onValueChange}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All {filter.label}</SelectItem>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {/* Clear all filters button */}
      {showClearButton && hasActiveFilters && onClearAllFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearAllFilters}
          className="flex items-center gap-1"
        >
          <X className="w-3 h-3" />
          Clear Filters
        </Button>
      )}
    </div>
  )
}
