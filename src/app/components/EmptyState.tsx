import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-[#EDE9FF] flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-[#7C6AF7]" strokeWidth={1.5} />
        </div>
      )}
      <h3 className="text-[18px] font-semibold text-[#1A1A2E] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
        {title}
      </h3>
      {description && (
        <p className="text-[13px] text-[#8A8A9A] max-w-md mb-6" style={{ fontFamily: 'var(--font-body)' }}>
          {description}
        </p>
      )}
      {action}
    </motion.div>
  );
}
