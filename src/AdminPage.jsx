import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  STORAGE_KEY,
  clearAllResponses,
  listResponses,
  removeResponse,
} from './responsesStorage'
import { SATISFACTION_LEVELS, satisfactionLabel } from './surveyConstants'

const dateFmt = new Intl.DateTimeFormat('ja-JP', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const scoreFmt = new Intl.NumberFormat('ja-JP', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

function buildSatisfactionStats(items) {
  const distribution = Object.fromEntries(
    SATISFACTION_LEVELS.map((l) => [l.value, 0]),
  )
  const scores = []
  for (const r of items) {
    const raw = r?.satisfaction
    if (raw == null || raw === '') continue
    const key = String(raw)
    if (distribution[key] === undefined) continue
    distribution[key] += 1
    scores.push(Number(key))
  }
  const maxCount = Math.max(0, ...Object.values(distribution))
  const scoredN = scores.length
  const average =
    scoredN > 0
      ? scores.reduce((a, b) => a + b, 0) / scoredN
      : null
  return {
    totalCount: items.length,
    average,
    distribution,
    maxCount,
  }
}

function formatSubmittedAt(iso) {
  try {
    return dateFmt.format(new Date(iso))
  } catch {
    return iso
  }
}

export function AdminPage() {
  const [items, setItems] = useState(() => listResponses())

  const stats = useMemo(() => buildSatisfactionStats(items), [items])

  const chartDescription = useMemo(() => {
    if (items.length === 0) return '回答はまだありません。'
    return SATISFACTION_LEVELS.map(
      (l) => `${l.label.replace(/^\d+\s*/, '')} ${stats.distribution[l.value]}件`,
    ).join('。')
  }, [items, stats])

  const refresh = useCallback(() => {
    setItems(listResponses())
  }, [])

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY || e.key === null) refresh()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [refresh])

  function handleDeleteOne(id) {
    if (!window.confirm('この回答を削除しますか？')) return
    removeResponse(id)
    refresh()
  }

  function handleClearAll() {
    if (!window.confirm('すべての回答を削除しますか？この操作は取り消せません。'))
      return
    clearAllResponses()
    refresh()
  }

  return (
    <main className="survey admin">
      <div className="survey-shell admin-shell">
        <header className="survey-header admin-header">
          <p className="survey-badge">管理</p>
          <h1>回答一覧</h1>
          <p className="survey-lead">
            ブラウザに保存された回答を表示・削除できます。
          </p>
        </header>

        <section
          className="admin-dashboard"
          aria-labelledby="admin-dashboard-heading"
        >
          <h2 id="admin-dashboard-heading" className="admin-dashboard-heading">
            集計サマリー
          </h2>
          <div className="admin-summary-cards">
            <article className="admin-summary-card">
              <p className="admin-summary-label">回答数</p>
              <p className="admin-summary-value">{stats.totalCount}</p>
              <p className="admin-summary-unit">件</p>
            </article>
            <article className="admin-summary-card">
              <p className="admin-summary-label">満足度の平均</p>
              <p className="admin-summary-value">
                {stats.average != null ? scoreFmt.format(stats.average) : '—'}
              </p>
              {stats.average != null ? (
                <p className="admin-summary-unit">/ 5.0</p>
              ) : stats.totalCount > 0 ? (
                <p className="admin-summary-unit">
                  （満足度の有効データなし）
                </p>
              ) : null}
            </article>
          </div>

          <div className="admin-chart-panel">
            <h3 className="admin-chart-heading">満足度の分布</h3>
            <div
              className="admin-chart"
              role="img"
              aria-label={`満足度の内訳。${chartDescription}`}
            >
              <div className="admin-chart-bars">
                {SATISFACTION_LEVELS.map(({ value, label }) => {
                  const count = stats.distribution[value]
                  const pct =
                    stats.maxCount > 0 ? (count / stats.maxCount) * 100 : 0
                  return (
                    <div key={value} className="admin-chart-col">
                      <div className="admin-chart-track">
                        <div
                          className="admin-chart-bar"
                          style={{ height: `${pct}%` }}
                          title={`${label}：${count}件`}
                        />
                      </div>
                      <span className="admin-chart-score">{value}</span>
                      <span className="admin-chart-count" aria-hidden="true">
                        {count}
                      </span>
                    </div>
                  )
                })}
              </div>
              <p className="admin-chart-axis-label">満足度（1〜5）</p>
            </div>
          </div>
        </section>

        <div className="admin-toolbar">
          <button
            type="button"
            className="admin-btn admin-btn--danger"
            onClick={handleClearAll}
            disabled={items.length === 0}
          >
            すべて削除
          </button>
        </div>

        {items.length === 0 ? (
          <p className="admin-empty">まだ回答がありません。</p>
        ) : (
          <ul className="admin-list">
            {items.map((r) => (
              <li key={r.id} className="admin-card">
                <div className="admin-card-head">
                  <time className="admin-time" dateTime={r.submittedAt}>
                    {formatSubmittedAt(r.submittedAt)}
                  </time>
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost"
                    onClick={() => handleDeleteOne(r.id)}
                  >
                    削除
                  </button>
                </div>
                <dl className="admin-dl">
                  <div>
                    <dt>お名前</dt>
                    <dd>{r.name}</dd>
                  </div>
                  <div>
                    <dt>メール</dt>
                    <dd>
                      <a href={`mailto:${r.email}`}>{r.email}</a>
                    </dd>
                  </div>
                  <div>
                    <dt>満足度</dt>
                    <dd>{satisfactionLabel(r.satisfaction)}</dd>
                  </div>
                  {r.comments ? (
                    <div className="admin-comments">
                      <dt>自由記述</dt>
                      <dd>{r.comments}</dd>
                    </div>
                  ) : null}
                </dl>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
