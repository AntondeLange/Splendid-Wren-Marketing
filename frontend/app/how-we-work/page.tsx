import type { Metadata } from 'next'
import Container from '@/components/Container'
import Section from '@/components/Section'
import Button from '@/components/Button'

export const metadata: Metadata = {
  title: 'How We Work & Pricing | Splendid Wren Marketing',
  description: 'Learn about our process and pricing approach for small business marketing consultancy.',
}

export default function HowWeWork(): JSX.Element {
  const steps = [
    {
      number: '01',
      title: 'Initial Consultation',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.',
    },
    {
      number: '02',
      title: 'Strategy Development',
      description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt.',
    },
    {
      number: '03',
      title: 'Implementation Guidance',
      description: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis.',
    },
    {
      number: '04',
      title: 'Ongoing Support',
      description: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
    },
  ]

  return (
    <>
      {/* Hero Section */}
      <Section className="bg-white">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-primary mb-6 text-balance">
              How We Work
            </h1>
            <p className="text-xl text-neutral-dark leading-relaxed text-balance">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
        </Container>
      </Section>

      {/* Process Steps */}
      <Section>
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-16">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start"
                >
                  <div className="md:col-span-3">
                    <div className="text-6xl font-heading font-bold text-neutral-light mb-2">
                      {step.number}
                    </div>
                    <h3 className="text-2xl font-heading font-bold text-primary">
                      {step.title}
                    </h3>
                  </div>
                  <div className="md:col-span-9">
                    <p className="text-lg text-neutral-dark leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Pricing Section */}
      <Section className="bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-4">
                Pricing Guide
              </h2>
              <p className="text-lg text-neutral-dark">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. We work with you to find the right approach.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {[
                {
                  title: 'Starter',
                  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
                  price: 'From $X,XXX',
                },
                {
                  title: 'Growth',
                  description: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                  price: 'From $X,XXX',
                },
                {
                  title: 'Enterprise',
                  description: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco.',
                  price: 'Custom',
                },
              ].map((tier, index) => (
                <div
                  key={index}
                  className="bg-white p-8 rounded-soft border border-neutral-light hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-2xl font-heading font-bold text-primary mb-4">
                    {tier.title}
                  </h3>
                  <p className="text-xl font-heading font-bold text-primary mb-4">
                    {tier.price}
                  </p>
                  <p className="text-neutral-dark leading-relaxed mb-6">
                    {tier.description}
                  </p>
                  <Button href="/contact" variant="outline" className="w-full">
                    Get Started
                  </Button>
                </div>
              ))}
            </div>

            <div className="bg-white p-8 rounded-soft border border-neutral-light text-center">
              <p className="text-lg text-neutral-dark mb-6">
                Not sure which approach is right for you? Let&apos;s have a conversation about your needs.
              </p>
              <Button href="/contact" variant="primary">
                Schedule a Consultation
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
