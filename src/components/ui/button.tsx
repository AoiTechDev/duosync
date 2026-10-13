import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// `hovered:` / `pressed:` are custom variants from globals.css. They behave like
// hover:/active:, but can also be forced with data-force="hover" | "active".
const buttonVariants = cva(
  "relative isolate inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-semibold cursor-pointer transition-[transform,filter,box-shadow,background-color,border-color,color] duration-200 ease-out hovered:-translate-y-0.5 pressed:translate-y-0 pressed:scale-[0.98] disabled:pointer-events-none disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        // Gold, notched. The shape lives on ::before so the drop-shadow on the
        // button itself is not cut off by clip-path, and follows the notch.
        default: [
          "rounded-none text-primary-foreground",
          "before:absolute before:inset-0 before:-z-10",
          "before:[clip-path:polygon(0_0,calc(100%-11px)_0,100%_11px,100%_100%,11px_100%,0_calc(100%-11px))]",
          "before:bg-linear-to-b before:from-[color-mix(in_oklab,var(--primary),white_30%)] before:to-primary",
          "drop-shadow-[0_0_10px_color-mix(in_oklab,var(--primary)_35%,transparent)]",
          "hovered:drop-shadow-[0_0_18px_color-mix(in_oklab,var(--primary)_75%,transparent)]",
          "pressed:before:from-primary pressed:before:to-[color-mix(in_oklab,var(--primary),black_12%)]",
          "pressed:drop-shadow-[0_0_6px_color-mix(in_oklab,var(--primary)_40%,transparent)]",
          "disabled:before:bg-none disabled:before:bg-foreground/8 disabled:text-foreground/25 disabled:drop-shadow-none",
        ],
        secondary: [
          "border border-electric text-electric bg-transparent",
          "hovered:bg-electric/5 hovered:shadow-[0_0_18px_color-mix(in_oklab,var(--electric)_45%,transparent)]",
          "pressed:bg-electric/10 pressed:shadow-none",
          "disabled:border-electric/15 disabled:text-electric/45",
        ],
        ghost: [
          "border border-border bg-card text-foreground",
          "hovered:bg-popover hovered:border-input",
          "pressed:bg-muted",
          "disabled:bg-transparent disabled:text-muted-foreground/60",
        ],
        destructive: [
          "border border-destructive/40 bg-destructive/10 text-destructive",
          "hovered:border-destructive hovered:shadow-[0_0_16px_color-mix(in_oklab,var(--destructive)_40%,transparent)]",
          "pressed:bg-destructive/15 pressed:shadow-none",
          "disabled:border-destructive/15 disabled:bg-destructive/5 disabled:text-destructive/40",
        ],
        discord: [
          "bg-discord text-white",
          "hovered:shadow-[0_0_22px_color-mix(in_oklab,var(--discord)_65%,transparent)]",
          "pressed:bg-[color-mix(in_oklab,var(--discord),black_15%)] pressed:shadow-none",
          "disabled:bg-discord/25 disabled:text-white/40",
        ],
        light: [
          "bg-foreground text-primary-foreground",
          "hovered:shadow-[0_0_20px_color-mix(in_oklab,var(--foreground)_35%,transparent)]",
          "pressed:bg-[color-mix(in_oklab,var(--foreground),black_10%)] pressed:shadow-none",
          "disabled:bg-foreground/20 disabled:text-primary-foreground/50",
        ],
        // Kept for existing call sites (variant="outline" is used across the app).
        outline: [
          "border border-input bg-transparent text-foreground",
          "hovered:bg-popover hovered:border-electric/60",
          "pressed:bg-muted",
          "disabled:opacity-50",
        ],
        link: "text-electric underline-offset-4 hovered:underline hovered:translate-y-0 disabled:opacity-50",
      },
      size: {
        default: "h-11 px-6 has-[>svg]:px-5",
        sm: "h-8 gap-1.5 px-3 text-xs has-[>svg]:px-2.5",
        lg: "h-12 px-8 text-base has-[>svg]:px-6",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
