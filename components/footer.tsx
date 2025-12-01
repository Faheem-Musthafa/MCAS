import Link from "next/link"
import { Instagram, Twitter, Facebook, Youtube } from "lucide-react"

export function Footer() {
  const footerLinks = {
    Navigation: [
      { name: "Home", href: "/" },
      { name: "Schedule", href: "#events" },
      { name: "Participants", href: "#participants" },
      { name: "Gallery", href: "#gallery" },
    ],
    Resources: [
      { name: "Event Rules", href: "#" },
      { name: "Venue Map", href: "#" },
      { name: "FAQs", href: "#" },
      { name: "Contact", href: "#" },
    ],
    Connect: [
      { name: "LinkedIn", href: "#" },
      { name: "Community", href: "#" },
      { name: "Vercel Forum", href: "#" },
    ],
  }

  return (
    <footer className="border-t border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-16">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight">MCAS</span>
              <span className="text-xs px-2 py-0.5 border border-border rounded text-muted-foreground">11</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Art moves the mind, sport moves the body. Join us for the 11th Student Union celebration.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 mt-6">
              {[
                { icon: Twitter, label: "Twitter" },
                { icon: Instagram, label: "Instagram" },
                { icon: Facebook, label: "Facebook" },
                { icon: Youtube, label: "YouTube" },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                >
                  <span className="sr-only">{label}</span>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-medium text-sm mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© 2025 MCAS Student Union. Department of Computer Science.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
