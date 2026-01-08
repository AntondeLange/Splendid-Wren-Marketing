import type { Metadata } from 'next'
import Container from '@/components/Container'
import Section from '@/components/Section'

export const metadata: Metadata = {
  title: 'Marketing Tools | Splendid Wren Marketing',
  description: 'Marketing tools and resources for small businesses.',
}

export default function Tools(): JSX.Element {
  return (
    <Section className="bg-white">
      <Container>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-primary mb-6 text-balance">
            Marketing Tools
          </h1>
          <p className="text-xl text-neutral-dark leading-relaxed text-balance">
            This section is currently under development. Tools will be available soon.
          </p>
          {/* 
            Future Tools (behind paywall):
            - Campaign Planner
            - 60-Minute Marketing Plan
            - Authentication and gated content will be implemented here
          */}
        </div>
      </Container>
    </Section>
  )
}
