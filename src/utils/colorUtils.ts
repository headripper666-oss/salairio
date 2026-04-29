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
    tagBg: 'rgba(100,145,200,0.75)',
    tagColor: '#e8f0fc',
    dot: '#8aaee0',
  },
  apres_midi: {
    label: 'Après-midi',
    labelShort: 'AM',
    color: '#b89de8',
    bgCell: 'rgba(170,150,210,0.18)',
    borderColor: 'rgba(170,150,210,0.25)',
    tagBg: 'rgba(140,110,200,0.72)',
    tagColor: '#f0eafc',
    dot: '#b89de8',
  },
  jour_supp: {
    label: 'Jour supp.',
    labelShort: 'JS',
    color: '#d68a3c',
    bgCell: 'rgba(214,138,60,0.22)',
    borderColor: 'rgba(214,138,60,0.40)',
    tagBg: 'rgba(214,138,60,0.88)',
    tagColor: '#2a1a05',
    dot: '#d68a3c',
  },
  conge_paye: {
    label: 'Congé payé',
    labelShort: 'CP',
    color: '#82b4a0',
    bgCell: 'rgba(130,180,160,0.18)',
    borderColor: 'rgba(130,180,160,0.25)',
    tagBg: 'rgba(80,150,120,0.75)',
    tagColor: '#e6f4ef',
    dot: '#82b4a0',
  },
  conge_sans_solde: {
    label: 'Congé s. solde',
    labelShort: 'CSS',
    color: '#c87067',
    bgCell: 'rgba(220,140,130,0.18)',
    borderColor: 'rgba(220,140,130,0.30)',
    tagBg: 'rgba(190,90,80,0.75)',
    tagColor: '#fcecea',
    dot: '#c87067',
  },
  recuperation: {
    label: 'Récupération',
    labelShort: 'RÉC',
    color: '#82b4a0',
    bgCell: 'rgba(130,180,160,0.18)',
    borderColor: 'rgba(130,180,160,0.25)',
    tagBg: 'rgba(80,150,120,0.75)',
    tagColor: '#e6f4ef',
    dot: '#82b4a0',
  },
  absence: {
    label: 'Absence',
    labelShort: 'ABS',
    color: '#c87067',
    bgCell: 'rgba(220,140,130,0.18)',
    borderColor: 'rgba(220,140,130,0.30)',
    tagBg: 'rgba(190,90,80,0.75)',
    tagColor: '#fcecea',
    dot: '#c87067',
  },
}

export function getStatusStyle(status: DayStatus): StatusStyle {
  return STATUS_STYLES[status]
}

export function getStatusColor(status: DayStatus): string {
  return STATUS_STYLES[status].color
}

// Couleur du bloc RDV dans la cellule, choisie pour contraster avec bgCell de chaque statut
// Palette : amber (#d68a3c) sur fond bleu/violet, vert sauge sur fond amber, rose sur fond vert, amber sur vide
export const APPT_BLOCK_COLORS: Record<DayStatus, { bg: string; border: string; text: string }> = {
  vide:             { bg: 'rgba(91,155,213,0.15)',  border: 'rgba(91,155,213,0.4)',  text: '#3a7cb8' },
  matin:            { bg: 'rgba(214,138,60,0.20)',  border: 'rgba(214,138,60,0.5)',  text: '#a85f10' },
  apres_midi:       { bg: 'rgba(214,138,60,0.20)',  border: 'rgba(214,138,60,0.5)',  text: '#a85f10' },
  jour_supp:        { bg: 'rgba(130,180,160,0.25)', border: 'rgba(130,180,160,0.5)', text: '#3a7060' },
  conge_paye:       { bg: 'rgba(200,112,103,0.20)', border: 'rgba(200,112,103,0.4)', text: '#8b3530' },
  conge_sans_solde: { bg: 'rgba(91,155,213,0.18)',  border: 'rgba(91,155,213,0.4)',  text: '#3a7cb8' },
  recuperation:     { bg: 'rgba(200,112,103,0.20)', border: 'rgba(200,112,103,0.4)', text: '#8b3530' },
  absence:          { bg: 'rgba(91,155,213,0.18)',  border: 'rgba(91,155,213,0.4)',  text: '#3a7cb8' },
}
