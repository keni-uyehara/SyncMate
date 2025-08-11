import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter } from "lucide-react"

interface FilterOption {
  value: string
  label: string
}

interface SearchFilterBarProps {
  searchPlaceholder?: string
  filterOptions?: FilterOption[]
  filterLabel?: string
  onSearchChange?: (value: string) => void
  onFilterChange?: (value: string) => void
  searchValue?: string
  filterValue?: string
}

export function SearchFilterBar({
  searchPlaceholder = "Search...",
  filterOptions = [],
  filterLabel = "Filter",
  onSearchChange,
  onFilterChange,
  searchValue = "",
  filterValue = "all"
}: SearchFilterBarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder={searchPlaceholder}
          className="pl-10 w-64"
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
        />
      </div>
      {filterOptions.length > 0 && (
        <Select value={filterValue} onValueChange={onFilterChange}>
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All {filterLabel}</SelectItem>
            {filterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}
