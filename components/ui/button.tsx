import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-[transform,background-color,box-shadow] duration-160 ease-out outline-none focus-visible:ring-2 focus-visible:ring-ring active:translate-y-px active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        sage: "bg-[#cbdcc9] text-[#1d2b21] hover:bg-[#bccfba] hover:shadow-[0_8px_20px_-8px_rgba(61,79,66,0.45)]",
        outline:
          "border border-[#d8e2d6] bg-white text-[#1d2b21] hover:bg-[#f2f7f1]",
        ghost: "text-[#4b5b4f] hover:bg-[#eef4ec] hover:text-[#1d2b21]",
      },
      size: {
        sm: "h-8 px-3 text-[13px]",
        default: "h-10 px-5",
        lg: "h-11 px-6",
        icon: "size-8 shrink-0 px-0",
        "icon-sm": "size-7 shrink-0 px-0",
      },
    },
    defaultVariants: { variant: "sage", size: "default" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
