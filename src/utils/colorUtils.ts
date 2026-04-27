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
    color: '#8e8775',
    bgCell: 'transparent',
    dot: '#5a5448',
  },
  matin: {
    label: 'Matin',
    labelShort: 'M',
    color: '#8aaee0',
    bgCell: 'rgba(140,170,220,0.16)',
    dot: '#8aaee0',
  },
  apres_midi: {
    label: 'Après-midi',
    labelShort: 'AM',
    color: '#b89de8',
    bgCell: 'rgba(184,157,232,0.16)',
    dot: '#b89de8',
  },
  jour_supp: {
    label: 'Jour supp.',
    labelShort: 'JS',
    color: '#d68a3c',
    bgCell: 'rgba(214,138,60,0.16)',
    dot: '#d68a3c',
  },
  conge_paye: {
    label: 'Congé payé',
    labelShort: 'CP',
    color: '#6b8a5a',
    bgCell: 'rgba(107,138,90,0.16)',
    dot: '#6b8a5a',
  },
  conge_sans_solde: {
    label: 'Congé s. solde',
    labelShort: 'CSS',
    color: '#c87067',
    bgCell: 'rgba(200,112,103,0.14)',
    dot: '#c87067',
  },
  recuperation: {
    label: 'Récupération',
    labelShort: 'RÉC',
    color: '#82b4a0',
    bgCell: 'rgba(130,180,160,0.16)',
    dot: '#82b4a0',
  },
  absence: {
    label: 'Absence / Maladie',
    labelShort: 'ABS',
    color: '#c87067',
    bgCell: 'rgba(200,112,103,0.12)',
    dot: '#c87067',
  },
}

export function getStatusStyle(status: DayStatus): StatusStyle {
  return STATUS_STYLES[status]
}

export function getStatusColor(status: DayStatus): string {
  return STATUS_STYLES[status].color
}
