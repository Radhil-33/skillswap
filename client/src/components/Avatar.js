const getApiOrigin = () => {
  if (process.env.REACT_APP_API_ORIGIN) return process.env.REACT_APP_API_ORIGIN;
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:5000';
  }
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
};

export default function Avatar({ src, name, size = 'md', className = '' }) {
  const sizes = {
    xs: 'w-8 h-8 text-xs',
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-20 h-20 text-2xl',
    '2xl': 'w-24 h-24 text-3xl',
  };

  const letter = name?.charAt(0)?.toUpperCase() || '?';
  const hasImage = src && src.length > 0;
  const imgUrl = hasImage && src.startsWith('/') ? `${getApiOrigin()}${src}` : src;

  return hasImage ? (
    <img
      src={imgUrl}
      alt={name || 'avatar'}
      className={`${sizes[size]} rounded-full object-cover ${className}`}
    />
  ) : (
    <div
      className={`${sizes[size]} rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center ${className}`}
    >
      {letter}
    </div>
  );
}
