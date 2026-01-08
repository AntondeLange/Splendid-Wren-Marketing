import type { Metadata } from 'next'
import Link from 'next/link'
import Container from '@/components/Container'
import Section from '@/components/Section'

export const metadata: Metadata = {
  title: 'Blog | Splendid Wren Marketing',
  description: 'Practical, thoughtful marketing insights for small businesses.',
}

export default function Blog(): JSX.Element {
  // Placeholder blog posts
  const posts = [
    {
      id: 1,
      title: 'Lorem ipsum dolor sit amet',
      excerpt: 'Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.',
      date: 'March 15, 2024',
    },
    {
      id: 2,
      title: 'Duis aute irure dolor in reprehenderit',
      excerpt: 'In voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt.',
      date: 'February 28, 2024',
    },
    {
      id: 3,
      title: 'Sed ut perspiciatis unde omnis',
      excerpt: 'Iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi.',
      date: 'January 10, 2024',
    },
  ]

  return (
    <>
      {/* Hero Section */}
      <Section className="bg-white">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-primary mb-6 text-balance">
              Blog
            </h1>
            <p className="text-xl text-neutral-dark leading-relaxed text-balance">
              Practical, thoughtful marketing insights for small businesses.
            </p>
          </div>
        </Container>
      </Section>

      {/* Blog Posts */}
      <Section>
        <Container>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-12">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="border-b border-neutral-light pb-12 last:border-b-0 last:pb-0"
                >
                  <Link
                    href={`/blog/${post.id}`}
                    className="group block"
                  >
                    <time className="text-sm text-neutral-medium mb-2 block">
                      {post.date}
                    </time>
                    <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary mb-4 group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-lg text-neutral-dark leading-relaxed">
                      {post.excerpt}
                    </p>
                    <span className="inline-block mt-4 text-primary font-medium group-hover:underline">
                      Read more →
                    </span>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
