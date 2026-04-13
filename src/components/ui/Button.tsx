import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", fullWidth = false, ...props }, ref) => {
    const variants: Record<string, string> = {
      default: "bg-primary-500 text-white hover:bg-primary-600 shadow-sm",
      destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
      outline: "border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700",
      secondary: "bg-secondary-500 text-white hover:bg-secondary-600 shadow-sm",
      ghost: "hover:bg-gray-100 text-gray-700",
      link: "text-primary-500 underline-offset-4 hover:underline",
    };
    const sizes: Record<string, string> = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3 text-sm",
      lg: "h-11 rounded-md px-8 text-base",
      icon: "h-10 w-10",
    };
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          fullWidth ? "w-full" : "",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
