import type { DayStatus } from '@/types/firestore'

export interface StatusStyle {
  label: string
  labelShort: string
  color: string
  bgCell: string
  borderColor: string
  tagBg: string
  tagColor: string
  dot: string
}

export const STATUS_STYLES: Record<DayStatus, StatusStyle> = {
  vide: {
    label: 'Vide',
    labelShort: '—',
    color: '#8e8775',
    bgCell: 'transparent',
    borderColor: 'transparent',
    tagBg: 'transparent',
    tagColor: '#8e8775',
    dot: '#5a5448',
  },
  matin: {
    label: 'Matin',
    labelShort: 'M',
    color: '#8aaee0',
    bgCell: 'rgba(140,170,220,0.18)',
    borderColor: 'rgba(140,170,220,0.25)',
    tagBg: 'rgba(140,170,220,0.35)',
    tagColor: '#d8e4f7',
    dot: '#8aaee0',
  },
  apres_midi: {
    label: 'Après-midi',
    labelShort: 'AM',
    color: '#b89de8',
    bgCell: 'rgba(170,150,210,0.18)',
    borderColor: 'rgba(170,150,210,0.25)',
    tagBg: 'rgba(170,150,210,0.35)',
    tagColor: '#ded3f3',
    dot: '#b89de8',
  },
  jour_supp: {
    label: 'Jour supp.',
    labelShort: 'JS',
    color: '#d68a3c',
    bgCell: 'rgba(214,138,60,0.22)',
    borderColor: 'rgba(214,138,60,0.40)',
    tagBg: 'rgba(214,138,60,0.85)',
    tagColor: '#2a1a05',
    dot: '#d68a3c',
  },
  conge_paye: {
    label: 'Congé payé',
    labelShort: 'CP',
    color: '#82b4a0',
    bgCell: 'rgba(130,180,160,0.18)',
    borderColor: 'rgba(130,180,160,0.25)',
    tagBg: 'rgba(130,180,160,0.35)',
    tagColor: '#c8e6da',
    dot: '#82b4a0',
  },
  conge_sans_solde: {
    label: 'Congé s. solde',
    labelShort: 'CSS',
    color: '#c87067',
    bgCell: 'rgba(220,140,130,0.18)',
    borderColor: 'rgba(220,140,130,0.30)',
    tagBg: 'rgba(220,140,130,0.35)',
    tagColor: '#f4cac3',
    dot: '#c87067',
  },
  recuperation: {
    label: 'Récupération',
    labelShort: 'RÉC',
    color: '#82b4a0',
    bgCell: 'rgba(130,180,160,0.18)',
    borderColor: 'rgba(130,180,160,0.25)',
    tagBg: 'rgba(130,180,160,0.35)',
    tagColor: '#c8e6da',
    dot: '#82b4a0',
  },
  absence: {
    label: 'Absence',
    labelShort: 'ABS',
    color: '#c87067',
    bgCell: 'rgba(220,140,130,0.18)',
    borderColor: 'rgba(220,140,130,0.30)',
    tagBg: 'rgba(220,140,130,0.35)',
    tagColor: '#f4cac3',
    dot: '#c87067',
  },
}

export function getStatusStyle(status: DayStatus): StatusStyle {
  return STATUS_STYLES[status]
}

export function getStatusColor(status: DayStatus): string {
  return STATUS_STYLES[status].color
}
