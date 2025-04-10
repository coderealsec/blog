import * as React from "react"
import { XIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const SheetContext = React.createContext({
  open: false,
  setOpen: () => {},
  side: "right"
})

function Sheet({ children, open, onOpenChange, ...props }) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const openState = open !== undefined ? open : internalOpen
  const setOpenState = onOpenChange || setInternalOpen

  return (
    <SheetContext.Provider value={{ open: openState, setOpen: setOpenState, ...props }}>
      {children}
    </SheetContext.Provider>
  )
}

function SheetTrigger({ children, asChild, ...props }) {
  const { setOpen } = React.useContext(SheetContext)
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      onClick: (e) => {
        children.props.onClick?.(e)
        setOpen(true)
      },
    })
  }
  
  return (
    <button
      type="button"
      {...props}
      onClick={() => setOpen(true)}
    >
      {children}
    </button>
  )
}

function SheetClose({ children, ...props }) {
  const { setOpen } = React.useContext(SheetContext)
  
  if (!children) {
    return (
      <button
        type="button"
        className="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
        onClick={() => setOpen(false)}
        {...props}
      >
        <XIcon className="size-4" />
        <span className="sr-only">Close</span>
      </button>
    )
  }
  
  if (React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      onClick: (e) => {
        children.props.onClick?.(e)
        setOpen(false)
      },
    })
  }
  
  return (
    <button
      type="button"
      {...props}
      onClick={() => setOpen(false)}
    >
      {children}
    </button>
  )
}

function SheetPortal({ children, ...props }) {
  return <>{children}</>
}

function SheetOverlay({ className, ...props }) {
  const { open, setOpen } = React.useContext(SheetContext)
  
  if (!open) return null
  
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-black/50 animate-in fade-in-0",
        className
      )}
      onClick={() => setOpen(false)}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}) {
  const { open } = React.useContext(SheetContext)
  
  if (!open) return null
  
  return (
    <>
      <SheetOverlay />
      <div
        className={cn(
          "bg-background fixed z-50 flex flex-col gap-4 shadow-lg animate-in transition ease-in-out duration-300",
          side === "right" &&
            "slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          side === "left" &&
            "slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          side === "top" &&
            "slide-in-from-top inset-x-0 top-0 h-auto border-b",
          side === "bottom" &&
            "slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
          className
        )}
        {...props}
      >
        {children}
        <SheetClose />
      </div>
    </>
  )
}

function SheetHeader({
  className,
  ...props
}) {
  return (
    <div
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  )
}

function SheetFooter({
  className,
  ...props
}) {
  return (
    <div
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}) {
  return (
    <h2
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}) {
  return (
    <p
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
