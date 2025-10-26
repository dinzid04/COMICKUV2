import { forwardRef } from 'react';
import { Loader } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: 'small' | 'medium' | 'large';
}

const sizeClasses = {
  small: 'w-4 h-4',
  medium: 'w-6 h-6',
  large: 'w-8 h-8',
};

const Spinner = forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, size = 'medium', ...props }, ref) => {
    return (
      <Loader
        ref={ref}
        className={cn('animate-spin text-primary', sizeClasses[size], className)}
        {...props}
      />
    );
  }
);

Spinner.displayName = 'Spinner';

export { Spinner };
