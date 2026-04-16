import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border-0 px-3 py-1 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-[#EDE9FF] text-[#7C6AF7] [a&]:hover:bg-[#DDD5FF]",
        secondary:
          "bg-[#F5F4F2] text-[#1A1A2E] [a&]:hover:bg-[#EAEAE8]",
        destructive:
          "bg-[#FFE5E5] text-[#FF6B6B] [a&]:hover:bg-[#FFD5D5]",
        outline:
          "border border-[#1A1A2E]/20 text-[#1A1A2E] [a&]:hover:bg-[#F5F4F2]",
        success:
          "bg-[#C5E8A0] text-[#2D5016] [a&]:hover:bg-[#B5D890]",
        warning:
          "bg-[#F5E642] text-[#5A5000] [a&]:hover:bg-[#E5D632]",
        info:
          "bg-[#B8D8F8] text-[#0D3B66] [a&]:hover:bg-[#A8C8E8]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };