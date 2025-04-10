"use client"

import { createContext, useContext, useState, useCallback } from "react"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 5000

const ToastActionContext = createContext({})
const ToastDispatchContext = createContext({})

function useToastActions() {
  const context = useContext(ToastActionContext)
  if (context === undefined) {
    throw new Error("useToastActions must be used within a ToastProvider")
  }
  return context
}

function useToastDispatch() {
  const context = useContext(ToastDispatchContext)
  if (context === undefined) {
    throw new Error("useToastDispatch must be used within a ToastProvider")
  }
  return context
}

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback(
    (toast) => {
      setToasts((prevToasts) => {
        const nextToasts = [...prevToasts]
        
        const existingToastIndex = nextToasts.findIndex(
          (t) => t.id === toast.id
        )
        
        if (existingToastIndex !== -1) {
          nextToasts[existingToastIndex] = toast
        } else {
          if (nextToasts.length >= TOAST_LIMIT) {
            nextToasts.shift()
          }
          nextToasts.push({
            ...toast,
            id: toast.id || crypto.randomUUID(),
            open: true,
          })
        }

        return nextToasts
      })

      return toast.id
    },
    [setToasts]
  )

  const dismissToast = useCallback(
    (toastId) => {
      setToasts((prevToasts) =>
        prevToasts.map((toast) =>
          toast.id === toastId ? { ...toast, open: false } : toast
        )
      )

      setTimeout(() => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== toastId))
      }, TOAST_REMOVE_DELAY)
    },
    [setToasts]
  )

  const dismissAllToasts = useCallback(() => {
    setToasts((prevToasts) =>
      prevToasts.map((toast) => ({ ...toast, open: false }))
    )
  }, [setToasts])

  return (
    <ToastActionContext.Provider value={{ toasts }}>
      <ToastDispatchContext.Provider
        value={{ addToast, dismissToast, dismissAllToasts }}
      >
        {children}
      </ToastDispatchContext.Provider>
    </ToastActionContext.Provider>
  )
}

function toast(props) {
  const { addToast } = useToastDispatch()
  return addToast(props)
}

export { ToastProvider, useToastActions, useToastDispatch, toast } 