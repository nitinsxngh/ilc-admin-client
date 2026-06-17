import { cn, getInitials } from '@/lib/utils';

interface CounsellorAvatarProps {
  firstName: string;
  lastName?: string;
  imageUrl?: string;
  className?: string;
  textClassName?: string;
}

export function CounsellorAvatar({
  firstName,
  lastName,
  imageUrl,
  className,
  textClassName,
}: CounsellorAvatarProps) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={`${firstName} ${lastName || ''}`.trim()}
        className={cn('shrink-0 rounded-xl object-cover', className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 font-bold text-white',
        className
      )}
    >
      <span className={textClassName}>{getInitials(firstName, lastName)}</span>
    </div>
  );
}
