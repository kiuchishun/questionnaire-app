import { useState } from 'react'
import './App.css'

const SATISFACTION_LEVELS = [
  { value: '1', label: '1 とても不満' },
  { value: '2', label: '2 不満' },
  { value: '3', label: '3 ふつう' },
  { value: '4', label: '4 満足' },
  { value: '5', label: '5 とても満足' },
]

function App() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [satisfaction, setSatisfaction] = useState('')
  const [comments, setComments] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <main className="survey">
        <div className="survey-shell survey-shell--thanks" role="status">
          <h1>回答ありがとうございました</h1>
          <p>いただいた内容は今後のイベント改善に活用します。</p>
        </div>
      </main>
    )
  }

  return (
    <main className="survey">
      <div className="survey-shell">
        <header className="survey-header">
          <p className="survey-badge">アンケート</p>
          <h1>イベントアンケート</h1>
          <p className="survey-lead">
            ご参加ありがとうございました。所要時間は約1分です。
          </p>
        </header>

        <form className="survey-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="name">お名前</label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="山田 太郎"
          />
        </div>

        <div className="field">
          <label htmlFor="email">メールアドレス</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
        </div>

        <fieldset className="field field-satisfaction">
          <legend>満足度（5段階）</legend>
          <div className="satisfaction-options">
            {SATISFACTION_LEVELS.map(({ value, label }) => (
              <label key={value} className="satisfaction-option">
                <input
                  type="radio"
                  name="satisfaction"
                  value={value}
                  checked={satisfaction === value}
                  onChange={() => setSatisfaction(value)}
                  required
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="field">
          <label htmlFor="comments">自由記述</label>
          <textarea
            id="comments"
            name="comments"
            rows={5}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="ご感想・ご要望があればお書きください（任意）"
          />
        </div>

        <div className="survey-actions">
          <button type="submit" className="survey-submit">
            送信する
          </button>
        </div>
      </form>
      </div>
    </main>
  )
}

export default App
