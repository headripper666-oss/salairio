import { motion } from 'framer-motion'
import { Construction } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'

interface PlaceholderPageProps {
  badge: string
  title: string
  description: string
}

export function PlaceholderPage({ badge, title, description }: PlaceholderPageProps) {
  return (
    <div>
      <PageHeader title={title} />
      <motion.div
        className="placeholder-page"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      >
        <Construction size={32} style={{ color: '#3F3F46' }} />
        <span className="placeholder-badge">{badge}</span>
        <p className="placeholder-title">{title}</p>
        <p className="placeholder-desc">{description}</p>
      </motion.div>
    </div>
  )
}
