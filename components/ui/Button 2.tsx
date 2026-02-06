import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-bhoomi-green text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/30 active:scale-[0.98]",
        destructive:
          "bg-red-500 text-white shadow-md shadow-red-500/20 hover:bg-red-600 hover:shadow-lg active:scale-[0.98]",
        outline:
          "border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20",
        secondary:
          "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/15",
        ghost:
          "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white",
        link: "text-bhoomi-green underline-offset-4 hover:underline",
        success:
          "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-700 active:scale-[0.98]",
        premium:
          "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30 hover:from-purple-600 hover:to-indigo-700 active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-6 text-base",
        xl: "h-14 rounded-xl px-8 text-lg",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
