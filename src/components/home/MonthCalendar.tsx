import { useState, useEffect } from 'react'
import { useCalendarMonth } from '@/hooks/useCalendarMonth'
import { useAppointmentsMonth } from '@/hooks/useAppointments'
import { usePillReminders } from '@/hooks/usePillReminders'
import { useAppointmentReminders } from '@/hooks/useAppointmentReminders'
import { DayDrawer } from '@/components/day/DayDrawer'
import { STATUS_STYLES, APPT_BLOCK_COLORS } from '@/utils/colorUtils'
import { getDaysInMonth, getFirstDayOfMonth, toDateStr, isToday } from '@/utils/dateUtils'

const DAYS_HEADER = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim']

interface MonthCalendarProps {
  year: number
  month: number
}

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 640)
  useEffect(() => {
    const h = () => setMobile(window.innerWidth < 640)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return mobile
}

export function MonthCalendar({ year, month }: MonthCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const isMobile = useIsMobile()
  const { dayMap, holidaySet, isLoading } = useCalendarMonth(year, month)
  const { appointments } = useAppointmentsMonth(year, month)

  usePillReminders(dayMap)
  useAppointmentReminders(appointments)

  // Map date → RDV du jour (trié par heure)
  const apptByDate = new Map<string, typeof appointments>()
  for (const a of appointments) {
    const list = apptByDate.get(a.date) ?? []
    list.push(a)
    apptByDate.set(a.date, list)
  }

  const daysInMonth = getDaysInMonth(year, month)
  const firstDow = getFirstDayOfMonth(year, month) // 0=Dim
  const offset = firstDow === 0 ? 6 : firstDow - 1  // Lun=0

  type Cell = { day: number; date: string } | null
  const cells: Cell[] = [
    ...Array<Cell>(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1
      return { day, date: toDateStr(year, month, day) }
    }),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const selectedEnriched = selectedDate ? (dayMap.get(selectedDate) ?? null) : null
  const selectedIsFerie = selectedDate ? holidaySet.has(selectedDate) : false

  const usedStatuses = Array.from(new Set(
    Array.from(dayMap.values()).map(d => d.status).filter(s => s !== 'vide')
  ))

  return (
    <>
      <div style={{
        background: 'var(--paper-2)',
        border: '1px solid var(--rule)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px 12px',
          borderBottom: '1px solid var(--rule)',
        }}>
          <h3 style={{
            margin: 0,
            fontFamily: 'Fraunces, serif',
            fontWeight: 600,
            fontSize: '1.1rem',
            letterSpacing: '-0.01em',
            color: 'var(--ink)',
          }}>
            Calendrier
          </h3>
          {isLoading && (
            <span style={{ fontSize: '0.65rem', color: 'var(--ink-3)', fontFamily: 'JetBrains Mono, monospace' }}>
              Chargement…
            </span>
          )}
        </div>

        <div style={{ padding: isMobile ? '6px' : '12px' }}>
          {/* En-têtes jours */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: isMobile ? '3px' : '6px' }}>
            {DAYS_HEADER.map((d, i) => (
              <div key={i} style={{
                textAlign: 'center',
                fontSize: '0.6rem',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 500,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: i >= 5 ? 'var(--ink-3)' : 'var(--ink-3)',
                padding: '3px 0 6px',
              }}>
                {d}
              </div>
            ))}
          </div>

          {/* Grille */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: isMobile ? '2px' : '4px' }}>
            {cells.map((cell, i) => {
              if (!cell) return <div key={i} style={{ minHeight: isMobile ? 52 : 80 }} />

              const { day, date } = cell
              const enriched = dayMap.get(date)
              const status = enriched?.status ?? 'vide'
              const style = STATUS_STYLES[status]
              const isHoliday = holidaySet.has(date)
              const isWkd = (i % 7) >= 5
              const todayCell = isToday(date)
              const hasStatus = status !== 'vide'
              const dayAppts = (apptByDate.get(date) ?? []).slice().sort((a, b) => a.time.localeCompare(b.time))

              const bgColor = isHoliday && !hasStatus
                ? 'rgba(214,138,60,0.14)'
                : hasStatus
                  ? style.bgCell
                  : 'var(--paper)'

              const borderStyle = todayCell
                ? '2px solid var(--amber)'
                : isHoliday && !hasStatus
                  ? '1px solid rgba(214,138,60,0.35)'
                  : hasStatus
                    ? `1px solid ${style.borderColor}`
                    : '1px solid var(--rule)'

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedDate(date)}
                  style={{
                    minHeight: isMobile ? 52 : 80,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'stretch',
                    borderRadius: isMobile ? 8 : 12,
                    border: borderStyle,
                    background: bgColor,
                    cursor: 'pointer',
                    padding: isMobile ? '4px 3px' : '5px 6px',
                    position: 'relative',
                    transition: 'transform 0.12s ease, box-shadow 0.12s ease',
                    outline: 'none',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'
                    ;(e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px -4px rgba(0,0,0,0.3)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = ''
                    ;(e.currentTarget as HTMLElement).style.boxShadow = ''
                  }}
                >
                  {/* Ligne haut : numéro + badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                    <span style={{
                      fontFamily: 'Fraunces, serif',
                      fontWeight: 600,
                      fontSize: isMobile ? '0.7rem' : '0.85rem',
                      lineHeight: 1,
                      color: todayCell
                        ? 'var(--amber)'
                        : isWkd || isHoliday
                          ? 'var(--ink-3)'
                          : 'var(--ink)',
                    }}>
                      {day}
                    </span>

                    {/* Badges : statut + férié (empilés si les deux) */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                      {hasStatus && (
                        <span style={{
                          fontSize: isMobile ? '0.44rem' : '0.52rem',
                          fontFamily: 'JetBrains Mono, monospace',
                          fontWeight: 600,
                          letterSpacing: '0.02em',
                          padding: isMobile ? '1px 3px' : '1px 4px',
                          borderRadius: 999,
                          background: style.tagBg,
                          color: style.tagColor,
                          lineHeight: 1.6,
                          flexShrink: 0,
                        }}>
                          {style.labelShort}
                        </span>
                      )}
                      {isHoliday && (
                        <span style={{
                          fontSize: isMobile ? '0.40rem' : '0.46rem',
                          fontFamily: 'JetBrains Mono, monospace',
                          fontWeight: 700,
                          padding: isMobile ? '1px 2px' : '1px 3px',
                          borderRadius: 999,
                          background: hasStatus ? 'rgba(214,138,60,0.22)' : 'var(--amber)',
                          color: hasStatus ? 'var(--amber)' : '#2a1a05',
                          lineHeight: 1.6,
                          flexShrink: 0,
                        }}>
                          F
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bas de cellule : point weekend/férié + blocs RDV */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 3 }}>
                    {(isWkd || isHoliday) && !hasStatus && dayAppts.length === 0 && (
                      <div style={{
                        width: 4, height: 4, borderRadius: '50%',
                        background: isHoliday ? 'rgba(214,138,60,0.5)' : 'var(--rule)',
                        alignSelf: 'flex-end',
                      }} />
                    )}
                    {dayAppts.slice(0, isMobile ? 1 : 2).map(appt => {
                      const apptColor = APPT_BLOCK_COLORS[status]
                      return (
                        <div key={appt.id} style={{
                          fontSize: isMobile ? '0.54rem' : '0.62rem',
                          fontFamily: 'JetBrains Mono, monospace',
                          fontWeight: 600,
                          lineHeight: 1.4,
                          padding: isMobile ? '1px 3px' : '2px 5px',
                          borderRadius: isMobile ? 3 : 4,
                          background: apptColor.bg,
                          color: apptColor.text,
                          border: `1px solid ${apptColor.border}`,
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                        }}>
                          {isMobile ? appt.time : `${appt.time} ${appt.title}`}
                        </div>
                      )
                    })}
                    {dayAppts.length > (isMobile ? 1 : 2) && (
                      <div style={{
                        fontSize: '0.45rem',
                        color: APPT_BLOCK_COLORS[status].text,
                        fontFamily: 'JetBrains Mono, monospace',
                        textAlign: 'right',
                      }}>
                        +{dayAppts.length - (isMobile ? 1 : 2)}
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Légende */}
          {usedStatuses.length > 0 && (
            <div style={{
              marginTop: '10px', paddingTop: '10px',
              borderTop: '1px solid var(--rule)',
              display: 'flex', flexWrap: 'wrap', gap: '6px 12px',
            }}>
              {usedStatuses.map(s => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: STATUS_STYLES[s].dot,
                    flexShrink: 0,
                  }} />
                  <span style={{
                    fontSize: '0.62rem',
                    color: 'var(--ink-3)',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}>
                    {STATUS_STYLES[s].label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <DayDrawer
        date={selectedDate}
        year={year}
        month={month}
        existingDay={selectedEnriched}
        isFerie={selectedIsFerie}
        onClose={() => setSelectedDate(null)}
      />
    </>
  )
}
