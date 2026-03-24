import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-bold font-mono tracking-wider transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:  'bg-yellow-400 hover:bg-yellow-300 text-black',
        blue:     'bg-blue-600 hover:bg-blue-700 text-white',
        outline:  'border border-gray-600 hover:border-gray-400 text-gray-400 hover:text-white bg-transparent',
        ghost:    'text-gray-400 hover:text-white hover:bg-white/10',
        danger:   'bg-red-700 hover:bg-red-600 text-white',
      },
      size: {
        sm: 'py-1 px-3 text-xs rounded',
        md: 'py-2 px-4 text-sm rounded-lg',
        lg: 'py-3 px-6 text-lg rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
