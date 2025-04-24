import * as React from "react"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        style={{
          backgroundColor: 'white',
          color: '#111827',
          border: '1px solid #d1d5db',
          borderRadius: '0.375rem',
          padding: '0.5rem 0.75rem',
          fontSize: '1rem',
          lineHeight: '1.5rem',
          width: '100%',
          height: '2.25rem',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          transition: 'all 0.2s',
        }}
        className={className}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
