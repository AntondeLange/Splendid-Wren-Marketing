interface SectionProps {
  children: React.ReactNode
  className?: string
  id?: string
}

export default function Section({ children, className = '', id }: SectionProps): JSX.Element {
  return (
    <section id={id} className={`py-16 md:py-24 transition-all duration-500 ${className}`}>
      {children}
    </section>
  )
}

