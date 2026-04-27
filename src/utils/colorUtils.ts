import type { DayStatus } from '@/types/firestore'

export interface StatusStyle {
  label: string
  labelShort: string
  color: string
  bgCell: string
  dot: string
}

export const STATUS_STYLES: Record<DayStatus, StatusStyle> = {
  vide: {
    label: 'Vide',
    labelShort: '—',
    color: '#52525B',
    bgCell: 'transparent',
    dot: '#3F3F46',
  },
  matin: {
    label: 'Matin',
    labelShort: 'M',
    color: '#3B82F6',
    bgCell: 'rgba(59,130,246,0.12)',
    dot: '#3B82F6',
  },
  apres_midi: {
    label: 'Après-midi',
    labelShort: 'AM',
    color: '#8B5CF6',
    bgCell: 'rgba(139,92,246,0.12)',
    dot: '#8B5CF6',
  },
  jour_supp: {
    label: 'Jour supp.',
    labelShort: 'JS',
    color: '#F59E0B',
    bgCell: 'rgba(245,158,11,0.12)',
    dot: '#F59E0B',
  },
  conge_paye: {
    label: 'Congé payé',
    labelShort: 'CP',
    color: '#22C55E',
    bgCell: 'rgba(34,197,94,0.12)',
    dot: '#22C55E',
  },
  conge_sans_solde: {
    label: 'Congé s. solde',
    labelShort: 'CSS',
    color: '#EF4444',
    bgCell: 'rgba(239,68,68,0.12)',
    dot: '#EF4444',
  },
  recuperation: {
    label: 'Récupération',
    labelShort: 'RÉC',
    color: '#06B6D4',
    bgCell: 'rgba(6,182,212,0.12)',
    dot: '#06B6D4',
  },
  absence: {
    label: 'Absence / Maladie',
    labelShort: 'ABS',
    color: '#F97316',
    bgCell: 'rgba(249,115,22,0.12)',
    dot: '#F97316',
  },
}

export function getStatusStyle(status: DayStatus): StatusStyle {
  return STATUS_STYLES[status]
}

export function getStatusColor(status: DayStatus): string {
  return STATUS_STYLES[status].color
}
