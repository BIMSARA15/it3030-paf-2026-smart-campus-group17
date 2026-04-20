export const StatusBadge = ({ status, size = 'md' }) => {
  const styles = {
    PENDING: 'bg-amber-100 text-amber-700',
    APPROVED: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-gray-100 text-gray-700'
  };

  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`rounded-full font-medium ${padding} ${styles[status] || styles.CANCELLED}`}>
      {status}
    </span>
  );
};