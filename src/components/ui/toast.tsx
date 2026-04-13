"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type ToastProps = {
  id?: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  className?: string;
};

const Toast = React.forwardRef<HTMLDivElement, ToastProps & { onDismiss?: () => void }>(
  ({ className, title, description, variant = "default", onDismiss, ...props }, ref) => {
    const variants: Record<string, string> = {
      default: "bg-white border-gray-200",
      destructive: "bg-red-50 border-red-200",
      success: "bg-green-50 border-green-200",
    };

    React.useEffect(() => {
      const timer = setTimeout(() => onDismiss?.(), 5000);
      return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
      <div
        ref={ref}
        className={cn(
          "fixed bottom-4 right-4 z-50 flex max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg animate-in slide-in-from-bottom-5",
          variants[variant],
          className
        )}
        {...props}
      >
        <div className="flex-1">
          {title && <p className="font-medium text-sm">{title}</p>}
          {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
        </div>
        <button onClick={onDismiss} className="text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>
    );
  }
);
Toast.displayName = "Toast";

// Simple toast state management
type ToastData = ToastProps & { id: string };
let toastListeners: Set<(toasts: ToastData[]) => void> = new Set();
let toasts: ToastData[] = [];

export function useToast() {
  const [state, setState] = React.useState<ToastData[]>(toasts);

  React.useEffect(() => {
    toastListeners.add(setState);
    return () => {
      toastListeners.delete(setState);
    };
  }, []);

  const toast = React.useCallback(
    (data: Omit<ToastData, "id">) => {
      const id = Math.random().toString(36).slice(2);
      toasts = [...toasts, { ...data, id }];
      toastListeners.forEach((l) => l(toasts));
      setTimeout(() => {
        toasts = toasts.filter((t) => t.id !== id);
        toastListeners.forEach((l) => l(toasts));
      }, 5000);
    },
    []
  );

  const dismiss = React.useCallback((id: string) => {
    toasts = toasts.filter((t) => t.id !== id);
    toastListeners.forEach((l) => l(toasts));
  }, []);

  return { toast, toasts: state, dismiss };
}

export function Toaster() {
  const { toasts, dismiss } = useToast();
  return (
    <>
      {toasts.map((t) => (
        <Toast
          key={t.id}
          id={t.id}
          title={t.title}
          description={t.description}
          variant={t.variant}
          onDismiss={() => dismiss(t.id)}
        />
      ))}
    </>
  );
}

export { Toast };
