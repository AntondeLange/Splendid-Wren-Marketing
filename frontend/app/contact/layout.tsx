import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us | Splendid Wren Marketing',
  description: 'Get in touch with Splendid Wren Marketing to discuss your small business marketing needs.',
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

