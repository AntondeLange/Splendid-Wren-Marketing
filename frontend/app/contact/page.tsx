'use client'

import { useState, FormEvent } from 'react'
import Container from '@/components/Container'
import Section from '@/components/Section'
import Button from '@/components/Button'

export default function Contact(): JSX.Element {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    // Form submission logic would go here
    console.log('Form submitted:', formData)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <>
      {/* Hero Section */}
      <Section className="bg-white">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-primary mb-6 text-balance">
              Let&apos;s Connect
            </h1>
            <p className="text-xl text-neutral-dark leading-relaxed text-balance">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. We&apos;d love to hear from you and learn about your business.
            </p>
          </div>
        </Container>
      </Section>

      {/* Contact Form */}
      <Section>
        <Container>
          <div className="max-w-2xl mx-auto">
            <div className="bg-white p-8 md:p-12 rounded-soft border border-neutral-light">
              <form onSubmit={handleSubmit} className="space-y-6" aria-label="Contact form">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-primary mb-2"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-neutral-medium rounded-soft focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-primary mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-neutral-medium rounded-soft focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-primary mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-neutral-medium rounded-soft focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-vertical"
                    placeholder="Tell us about your business and how we can help..."
                  />
                </div>

                <div className="pt-4">
                  <Button type="submit" variant="primary" className="w-full sm:w-auto">
                    Send Message
                  </Button>
                </div>
              </form>
            </div>

            <div className="mt-12 text-center">
              <p className="text-neutral-dark">
                Or reach out directly via email at{' '}
                <a
                  href="mailto:hello@splendidwren.com"
                  className="text-primary hover:underline font-medium"
                >
                  hello@splendidwren.com
                </a>
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
