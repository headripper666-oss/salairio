import { useState } from 'react'
import { CalendarRange } from 'lucide-react'
import { useCalendarMonth } from '@/hooks/useCalendarMonth'
import { DayDrawer } from '@/components/day/DayDrawer'
import { STATUS_STYLES } from '@/utils/colorUtils'
import { getDaysInMonth, getFirstDayOfMonth, toDateStr, isToday } from '@/utils/dateUtils'

const DAYS_HEADER = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

interface MonthCalendarProps {
  year: number
  month: number
}

export function MonthCalendar({ year, month }: MonthCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const { dayMap, holidaySet, isLoading } = useCalendarMonth(year, month)

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

  return (
    <>
      <div className="card">
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '0.875rem 1rem 0.75rem',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          <CalendarRange size={15} style={{ color: '#52525B' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#A1A1AA' }}>
            Calendrier
          </span>
          {isLoading && (
            <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: '#52525B' }}>
              Chargement…
            </span>
          )}
        </div>

        <div style={{ padding: '0.875rem' }}>
          {/* En-têtes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '0.5rem' }}>
            {DAYS_HEADER.map((d, i) => (
              <div
                key={i}
                style={{
                  textAlign: 'center', fontSize: '0.62rem', fontWeight: 700,
                  letterSpacing: '0.04em',
                  color: i >= 5 ? '#52525B' : '#3F3F46',
                  padding: '2px 0',
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Grille */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
            {cells.map((cell, i) => {
              if (!cell) return <div key={i} />

              const { day, date } = cell
              const enriched = dayMap.get(date)
              const status = enriched?.status ?? 'vide'
              const style = STATUS_STYLES[status]
              const isHoliday = holidaySet.has(date)
              const isWkd = (i % 7) >= 5
              const todayCell = isToday(date)

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedDate(date)}
                  style={{
                    aspectRatio: '1',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 7,
                    border: todayCell
                      ? '1.5px solid rgba(240,160,32,0.55)'
                      : status !== 'vide'
                        ? `1px solid ${style.color}44`
                        : '1px solid transparent',
                    background: todayCell
                      ? 'rgba(240,160,32,0.1)'
                      : status !== 'vide'
                        ? style.bgCell
                        : 'transparent',
                    cursor: 'pointer',
                    padding: 0,
                    position: 'relative',
                    transition: 'background 0.12s, border-color 0.12s',
                  }}
                >
                  <span style={{
                    fontSize: '0.78rem',
                    fontWeight: todayCell ? 700 : 400,
                    color: todayCell
                      ? '#F0A020'
                      : status !== 'vide'
                        ? style.color
                        : isWkd || isHoliday
                          ? '#52525B'
                          : '#71717A',
                  }}>
                    {day}
                  </span>

                  {/* Indicateur statut */}
                  {status !== 'vide' && (
                    <span style={{
                      position: 'absolute', bottom: 3,
                      width: 4, height: 4, borderRadius: '50%',
                      background: style.dot,
                    }} />
                  )}

                  {/* Indicateur férié (sans statut) */}
                  {isHoliday && status === 'vide' && (
                    <span style={{
                      position: 'absolute', bottom: 3,
                      width: 4, height: 4, borderRadius: '50%',
                      background: '#F59E0B44',
                      border: '1px solid #F59E0B88',
                    }} />
                  )}
                </button>
              )
            })}
          </div>

          {/* Légende */}
          <div style={{
            marginTop: '0.75rem', paddingTop: '0.75rem',
            borderTop: '1px solid rgba(255,255,255,0.04)',
            display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1rem',
          }}>
            {(['matin', 'apres_midi', 'jour_supp', 'recuperation', 'conge_paye', 'conge_sans_solde', 'absence'] as const)
              .filter(s => Array.from(dayMap.values()).some(d => d.status === s))
              .map(s => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: STATUS_STYLES[s].dot,
                    flexShrink: 0,
                  }} />
                  <span style={{ fontSize: '0.65rem', color: '#52525B' }}>
                    {STATUS_STYLES[s].label}
                  </span>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      <DayDrawer
        date={selectedDate}
        existingDay={selectedEnriched}
        isFerie={selectedIsFerie}
        onClose={() => setSelectedDate(null)}
      />
    </>
  )
}
