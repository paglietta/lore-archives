"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="relative">
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, { open, setOpen })
          : child
      )}
    </div>
  )
}

const DropdownMenuTrigger = ({ 
  children, 
  asChild, 
  open, 
  setOpen 
}: { 
  children: React.ReactNode
  asChild?: boolean
  open?: boolean
  setOpen?: (open: boolean) => void
}) => {
  const handleClick = () => setOpen?.(!open)
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, { onClick: handleClick })
  }
  
  return <button onClick={handleClick}>{children}</button>
}

const DropdownMenuContent = ({ 
  children, 
  align = "start",
  open,
  setOpen,
  className
}: { 
  children: React.ReactNode
  align?: "start" | "end"
  open?: boolean
  setOpen?: (open: boolean) => void
  className?: string
}) => {
  if (!open) return null
  
  return (
    <div 
      className={cn(
        "absolute z-50 mt-2 rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        align === "end" ? "right-0" : "left-0",
        className
      )}
      onClick={() => setOpen?.(false)}
    >
      {children}
    </div>
  )
}

const DropdownMenuItem = ({ 
  children, 
  asChild,
  className 
}: { 
  children: React.ReactNode
  asChild?: boolean
  className?: string
}) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      className: cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
        className,
        (children as any).props?.className
      )
    })
  }
  
  return (
    <div className={cn(
      "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
      className
    )}>
      {children}
    </div>
  )
}

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem }