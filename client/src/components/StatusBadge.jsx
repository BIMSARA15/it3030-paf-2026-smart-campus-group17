export const StatusBadge = ({ status, size = 'md' }) => {
  const styles = {
    PENDING: 'bg-amber-100 text-amber-700',
    PENDING_LECTURER: 'bg-orange-100 text-orange-700',
    APPROVED: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-gray-100 text-gray-700',
    BOOKING_CREATED: 'bg-blue-100 text-blue-700',
    DECLINED: 'bg-rose-100 text-rose-700',
  };

  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`rounded-full font-medium ${padding} ${styles[status] || styles.CANCELLED}`}>
      {status.replaceAll('_', ' ')}
    </span>
  );
};
