import type { Metadata } from 'next'
import Image from 'next/image'
import Container from '@/components/Container'
import Section from '@/components/Section'
import AnimateOnScroll from '@/components/AnimateOnScroll'

export const metadata: Metadata = {
  title: 'About Us | Splendid Wren Marketing',
  description: 'Learn about Splendid Wren Marketing and our purpose-driven approach to helping small businesses.',
}

export default function About(): JSX.Element {
  return (
    <>
      {/* Hero Section */}
      <Section className="bg-white">
        <Container>
          <AnimateOnScroll direction="fade" className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-primary mb-8 text-balance">
              About Splendid Wren Marketing
            </h1>
            <p className="text-xl text-neutral-dark leading-relaxed text-balance">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.
            </p>
          </AnimateOnScroll>
        </Container>
      </Section>

      {/* Founder Story Section */}
      <Section>
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
              <AnimateOnScroll direction="right" className="relative aspect-square rounded-soft overflow-hidden">
                <Image
                  src="/Images/Headshot_Cuppa.jpg"
                  alt="Founder headshot"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </AnimateOnScroll>
              <AnimateOnScroll direction="left" className="h-full">
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-6">
                  Founder Story
                </h2>
                <div className="space-y-4 text-neutral-dark leading-relaxed">
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                  </p>
                  <p>
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                  </p>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </Container>
      </Section>

      {/* Purpose Section */}
      <Section className="bg-white">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-8 text-center">
              Our Purpose
            </h2>
            <div className="space-y-6 text-lg text-neutral-dark leading-relaxed">
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
          </div>
        </Container>
      </Section>

      {/* Values Section with Images */}
      <Section>
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-12 text-center">
              What We Stand For
            </h2>
            
            <div className="space-y-16">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="order-2 md:order-1">
                  <h3 className="text-2xl font-heading font-bold text-primary mb-4">
                    Clarity
                  </h3>
                  <p className="text-neutral-dark leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.
                  </p>
                </div>
                <div className="relative aspect-[4/3] rounded-soft overflow-hidden order-1 md:order-2">
                  <Image
                    src="/Images/Headshot_Bridge.jpg"
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="relative aspect-[4/3] rounded-soft overflow-hidden">
                  <Image
                    src="/Images/Headshot Pylon.jpg"
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-heading font-bold text-primary mb-4">
                    Confidence
                  </h3>
                  <p className="text-neutral-dark leading-relaxed">
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="order-2 md:order-1">
                  <h3 className="text-2xl font-heading font-bold text-primary mb-4">
                    Humanity
                  </h3>
                  <p className="text-neutral-dark leading-relaxed">
                    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                  </p>
                </div>
                <div className="relative aspect-[4/3] rounded-soft overflow-hidden order-1 md:order-2">
                  <Image
                    src="/Images/Headshot_Toilet.jpg"
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
