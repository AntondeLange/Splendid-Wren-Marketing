import type { Metadata } from 'next'
import Container from '@/components/Container'
import Section from '@/components/Section'
import Button from '@/components/Button'
import AnimateOnScroll from '@/components/AnimateOnScroll'
import HeroSection from '@/components/HeroSection'

export const metadata: Metadata = {
  title: 'Splendid Wren Marketing | Small Business Marketing Consultancy',
  description: 'Warm, clear, and human-focused marketing guidance for small businesses in Australia.',
}

export default function Home(): JSX.Element {
  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      {/* How We Help Section */}
      <Section className="bg-white">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-4">
              How We Help
            </h2>
            <p className="text-lg text-neutral-dark max-w-2xl mx-auto">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'Clear Strategy',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
              },
              {
                title: 'Practical Guidance',
                description: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
              },
              {
                title: 'Human-Centered',
                description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
              },
              {
                title: 'Long-Term Growth',
                description: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
              },
            ].map((pillar, index) => (
              <div key={index} className="bg-white p-8 rounded-soft border border-neutral-light hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <h3 className="text-xl font-heading font-bold text-primary mb-4">
                  {pillar.title}
                </h3>
                <p className="text-neutral-dark leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Brand Message Section */}
      <Section className="bg-white">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-2xl md:text-3xl font-accent italic text-neutral-dark mb-8 text-balance">
              &ldquo;Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.&rdquo;
            </p>
            <p className="text-lg text-neutral-dark">
              We believe in marketing that respects your business, your customers, and your time.
            </p>
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section className="bg-background-soft">
        <Container>
          <div className="max-w-2xl mx-auto text-center bg-white p-12 rounded-soft border border-neutral-light">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-4">
              Ready to get started?
            </h2>
            <p className="text-lg text-neutral-dark mb-8">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Let&apos;s have a conversation.
            </p>
            <Button href="/contact" variant="primary">
              Contact Us
            </Button>
          </div>
        </Container>
      </Section>
    </>
  )
}
