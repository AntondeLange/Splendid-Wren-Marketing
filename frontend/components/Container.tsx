interface ContainerProps {
  children: React.ReactNode
  className?: string
}

export default function Container({ children, className = '' }: ContainerProps): JSX.Element {
  return (
    <div className={`max-w-7xl mx-auto px-6 ${className}`}>
      {children}
    </div>
  )
}

