"use client"

import { Heart } from "lucide-react"
import { FEST_CONFIG } from "@/lib/supabase/types"

export function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="relative overflow-hidden">
              {/* Bottom bar */}
        <div className="border-t border-border/50">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground text-center md:text-left">
                © {currentYear} {FEST_CONFIG.department}. All rights reserved.
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                Made with <Heart size={14} className="text-[var(--art-accent)] fill-current animate-pulse" /> by {FEST_CONFIG.Created}
              </p>
            </div>
          </div>
        </div>
         </footer>
  )
}
