import Link from 'next/link'
import Image from 'next/image'

export default function Footer(): JSX.Element {
  return (
    <footer className="bg-white border-t border-neutral-light mt-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="inline-block mb-4" aria-label="Splendid Wren Marketing Home">
              <Image
                src="/Images/logo.png"
                alt="Splendid Wren Marketing"
                width={720}
                height={320}
                className="h-40 w-auto"
              />
            </Link>
            <p className="text-neutral-dark text-sm">
              Warm, clear, and human-focused marketing guidance for small businesses.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-heading font-semibold text-primary mb-4">
              Navigation
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-neutral-dark hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-neutral-dark hover:text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/how-we-work" className="text-sm text-neutral-dark hover:text-primary transition-colors">
                  How We Work
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-neutral-dark hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-neutral-dark hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-heading font-semibold text-primary mb-4">
              Connect
            </h4>
            <p className="text-sm text-neutral-dark">
              Based in Australia
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-light">
          <p className="text-xs text-neutral-medium text-center">
            © {new Date().getFullYear()} Splendid Wren Marketing. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

