"use client"

import { cn } from "@/lib/utils"
import { categories } from "@/lib/data"
import Image from "next/image"

interface CategoryNavProps {
  activeCategory: string
  onCategoryChange: (categoryId: string) => void
}

export function CategoryNav({ activeCategory, onCategoryChange }: CategoryNavProps) {
  return (
    <nav className="py-4">
      <div className="max-w-lg mx-auto px-4">
        <div className="grid grid-cols-4 gap-x-2 gap-y-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                "flex flex-col items-center gap-1.5 flex-shrink-0 transition-all duration-200",
                "hover:scale-105 active:scale-95"
              )}
            >
              <div
                className={cn(
                  "w-[72px] h-[72px] rounded-2xl overflow-hidden border-2 transition-all duration-200 flex items-center justify-center bg-secondary/30",
                  activeCategory === category.id
                    ? "border-primary shadow-md shadow-primary/20"
                    : "border-transparent"
                )}
              >
                <Image
                  src={category.icon}
                  alt={category.name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
              <span
                className={cn(
                  "text-[11px] font-medium text-center leading-tight w-[72px] truncate",
                  activeCategory === category.id
                    ? "text-foreground font-bold"
                    : "text-muted-foreground"
                )}
              >
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
