import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"

interface ActionItem {
  label: string
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  variant?: "default" | "destructive"
}

interface ActionDropdownProps {
  actions: ActionItem[]
  itemId: string
  onDropdownToggle?: (isOpen: boolean) => void
}

export function ActionDropdown({ actions, itemId, onDropdownToggle }: ActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleDropdown = () => {
    const newState = !isOpen
    setIsOpen(newState)
    onDropdownToggle?.(newState)
  }

  const handleActionClick = (action: ActionItem) => {
    action.onClick()
    setIsOpen(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest(`[data-dropdown-id="${itemId}"]`)) {
        setIsOpen(false)
        onDropdownToggle?.(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [itemId, onDropdownToggle])

  return (
    <div className="relative" data-dropdown-id={itemId}>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={toggleDropdown}
      >
        <MoreHorizontal className="w-4 h-4" />
      </Button>
      {isOpen && (
        <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg py-1 z-10 min-w-[200px]">
          {actions.map((action, index) => {
            const Icon = action.icon
            return (
              <button 
                key={index}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${
                  action.variant === "destructive" ? "text-red-600 hover:text-red-700" : ""
                }`}
                onClick={() => handleActionClick(action)}
              >
                <Icon className="w-4 h-4" />
                {action.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}



