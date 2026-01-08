import type { Metadata } from 'next'
import Container from '@/components/Container'
import Section from '@/components/Section'

export const metadata: Metadata = {
  title: 'Blog Post | Splendid Wren Marketing',
  description: 'Read our latest marketing insights and guidance for small businesses.',
}

export default function BlogPost({
  params,
}: {
  params: { id: string }
}): JSX.Element {
  // This is a placeholder - in a real app, you would fetch the post data based on params.id
  return (
    <>
      <Section className="bg-white">
        <Container>
          <div className="max-w-3xl mx-auto">
            <article>
              <time className="text-sm text-neutral-medium mb-4 block">
                March 15, 2024
              </time>
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-6 text-balance">
                Lorem ipsum dolor sit amet
              </h1>
              <div className="prose prose-lg max-w-none text-neutral-dark leading-relaxed space-y-6">
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <p>
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
                <p>
                  Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                </p>
              </div>
            </article>
          </div>
        </Container>
      </Section>
    </>
  )
}

