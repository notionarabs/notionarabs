import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, Layout, FileText, Crown, CreditCard, ArrowLeft } from 'lucide-react';

const colorMap = {
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    text: 'text-purple-600 dark:text-purple-400',
    ping: 'bg-purple-400',
    dot: 'bg-purple-500',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-600 dark:text-blue-400',
    ping: 'bg-blue-400',
    dot: 'bg-blue-500',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-600 dark:text-green-400',
    ping: 'bg-green-400',
    dot: 'bg-green-500',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    text: 'text-orange-600 dark:text-orange-400',
    ping: 'bg-orange-400',
    dot: 'bg-orange-500',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    ping: 'bg-emerald-400',
    dot: 'bg-emerald-500',
  }
};

export default function StatsCards({ stats }) {
  const cards = [
    {
      title: 'إدارة المستخدمين',
      count: stats?.totalUsers || 0,
      label: 'إجمالي المستخدمين',
      href: '#users-list',
      icon: Crown,
      color: 'orange',
      gradient: 'from-orange-500 to-red-600',
      isHero: true,
    },
    {
      title: 'طلبات المبدعين',
      count: stats?.pendingApplications || 0,
      label: 'طلب قيد المراجعة',
      href: '/admin/creator-applications',
      icon: Users,
      color: 'purple',
      gradient: 'from-purple-500 to-indigo-600',
    },
    {
      title: 'إدارة القوالب',
      count: stats?.pendingTemplates || 0,
      label: 'قالب قيد المراجعة',
      href: '/admin/templates',
      icon: Layout,
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-600',
    },
    {
      title: 'إدارة المقالات',
      count: stats?.pendingBlogs || 0,
      label: 'مقال قيد المراجعة',
      href: '/admin/blogs',
      icon: FileText,
      color: 'green',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'إدارة المدفوعات',
      count: stats?.pendingPayouts || 0,
      label: 'طلب سحب معلق',
      href: '/admin/payouts',
      icon: CreditCard,
      color: 'emerald',
      gradient: 'from-emerald-500 to-green-600',
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-12">
      {cards.map((card, index) => {
        const colors = colorMap[card.color] || colorMap.orange;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={card.isHero ? 'col-span-1 md:col-span-2' : 'col-span-1'}
          >
            <Link href={card.href} className="group block h-full">
              <div className="h-full bg-white/50 dark:bg-white/5 backdrop-blur-2xl rounded-[2rem] p-8 border-none shadow-soft hover:shadow-glow transition-all duration-500 relative overflow-hidden">
                {/* Card Background Gradient Pattern */}
                <div className={`absolute -right-4 -bottom-4 w-32 h-32 bg-gradient-to-br ${card.gradient} opacity-[0.05] group-hover:opacity-[0.15] transition-opacity duration-500 rounded-full blur-2xl`} />

                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${colors.bg} group-hover:scale-110 transition-transform duration-300`}>
                    <card.icon className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  {card.count > 0 && (
                    <span className="flex h-2 w-2 relative">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colors.ping} opacity-75`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${colors.dot}`}></span>
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium text-accent-500 dark:text-dark-text-tertiary mb-1">
                    {card.title}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-accent-500 dark:text-dark-text-primary">
                      {card.count}
                    </span>
                    <span className="text-xs text-accent-600 dark:text-dark-text-secondary font-medium">
                      {card.label}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center text-xs font-semibold text-accent-500 dark:text-dark-text-tertiary group-hover:text-primary-500 dark:group-hover:text-orange-500 transition-colors">
                  إدارة القسم
                  <ArrowLeft className="w-3 h-3 mr-1 transform rotate-180 group-hover:translate-x-[-4px] transition-transform" />
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
