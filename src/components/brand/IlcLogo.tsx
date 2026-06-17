import Image from 'next/image';
import { cn } from '@/lib/utils';

interface IlcLogoProps {
  size?: number;
  className?: string;
  priority?: boolean;
}

export function IlcLogo({ size = 36, className, priority = false }: IlcLogoProps) {
  return (
    <Image
      src="/ilc-lgo.svg"
      alt="ILC"
      width={size}
      height={size}
      priority={priority}
      className={cn('shrink-0 object-contain', className)}
    />
  );
}
