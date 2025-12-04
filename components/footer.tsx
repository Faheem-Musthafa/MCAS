import Link from "next/link"
import { Instagram, Twitter, Facebook, Youtube, Sparkles, Heart } from "lucide-react"

export function Footer() {
  const footerLinks = {
    Navigation: [
      { name: "Home", href: "/" },
      { name: "Events", href: "#events" },
      { name: "Scores", href: "#scoreboard" },
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
      { name: "Support", href: "#" },
    ],
  }

  return (
    <footer className="relative overflow-hidden" style={{ background: 'var(--art-cream)' }}>
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="blob blob-pink absolute -bottom-20 -left-20 w-[200px] h-[200px] opacity-20" style={{ animationDelay: '0s' }} />
        <div className="blob blob-blue absolute -bottom-10 -right-20 w-[180px] h-[180px] opacity-20" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-16">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 group">
              <Sparkles size={24} className="text-[var(--art-accent)]" />
              <span className="text-2xl font-bold tracking-tight gradient-text">Artistry</span>
            </Link>
            <p className="mt-4 text-sm text-[var(--art-text-light)] leading-relaxed">
              Where creativity meets competition. Join us for an unforgettable celebration of art and sport.
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
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--art-text-light)] hover:text-[var(--art-text)] transition-all hover:scale-110"
                  style={{ background: 'rgba(255, 255, 255, 0.7)' }}
                >
                  <span className="sr-only">{label}</span>
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-sm mb-4 text-[var(--art-text)]">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm text-[var(--art-text-light)] hover:text-[var(--art-accent)] transition-colors"
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
        <div className="mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
          <p className="text-sm text-[var(--art-text-light)] flex items-center gap-1">
            Made with <Heart size={14} className="text-[var(--art-accent)]" /> by Faheem Musthafa
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-[var(--art-text-light)] hover:text-[var(--art-accent)] transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-xs text-[var(--art-text-light)] hover:text-[var(--art-accent)] transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
