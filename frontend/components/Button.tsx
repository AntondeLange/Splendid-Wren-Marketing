import Link from 'next/link'

interface ButtonProps {
  children: React.ReactNode
  href?: string
  variant?: 'primary' | 'secondary' | 'outline'
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit'
}

export default function Button({
  children,
  href,
  variant = 'primary',
  className = '',
  onClick,
  type = 'button',
}: ButtonProps): JSX.Element {
  const baseStyles = 'inline-block px-8 py-3 rounded-soft font-medium text-center transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transform hover:scale-105 active:scale-95'

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark',
    secondary: 'bg-accent-orange text-white hover:bg-opacity-90',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
  }

  const combinedClassName = `${baseStyles} ${variants[variant]} ${className}`

  if (href) {
    return (
      <Link href={href} className={combinedClassName}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} className={combinedClassName} onClick={onClick}>
      {children}
    </button>
  )
}

