import { useState } from "react";
import type { FormEvent } from "react";
import {
  SATISFACTION_LEVELS,
  isLowSatisfaction,
  normalizeSatisfactionValue,
  satisfactionLabel,
  type SatisfactionValue,
} from "./surveyConstants";
import { addResponse } from "./responsesStorage";

type Phase = "form" | "confirm";

export function SurveyPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [satisfaction, setSatisfaction] = useState<SatisfactionValue | "">("");
  const [improvementNotes, setImprovementNotes] = useState("");
  const [comments, setComments] = useState("");
  const [phase, setPhase] = useState<Phase>("form");
  const [submitted, setSubmitted] = useState(false);

  function setSatisfactionValue(value: SatisfactionValue) {
    setSatisfaction(value);
    if (!isLowSatisfaction(value)) setImprovementNotes("");
  }

  function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!e.currentTarget.reportValidity()) return;
    setPhase("confirm");
  }

  function handleConfirmSend() {
    if (
      !name.trim() ||
      !email.trim() ||
      !normalizeSatisfactionValue(satisfaction)
    ) {
      setPhase("form");
      return;
    }
    const payload = { name, email, satisfaction, comments } as const;
    if (isLowSatisfaction(satisfaction)) {
      addResponse({ ...payload, improvementNotes });
    } else {
      addResponse(payload);
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main className="survey">
        <div className="survey-shell survey-shell--thanks" role="status">
          <h1>回答ありがとうございました</h1>
          <p>いただいた内容は今後のイベント改善に活用します。</p>
        </div>
      </main>
    );
  }

  if (phase === "confirm") {
    return (
      <main className="survey">
        <div className="survey-shell">
          <header className="survey-header">
            <p className="survey-badge">確認</p>
            <h1>送信内容の確認</h1>
            <p className="survey-lead">
              内容をご確認のうえ、問題なければ「送信する」を押してください。
            </p>
          </header>

          <div className="survey-confirm">
            <dl className="survey-confirm-dl">
              <div>
                <dt>お名前</dt>
                <dd>{name}</dd>
              </div>
              <div>
                <dt>メールアドレス</dt>
                <dd>{email}</dd>
              </div>
              <div>
                <dt>満足度</dt>
                <dd>{satisfactionLabel(satisfaction)}</dd>
              </div>
              {isLowSatisfaction(satisfaction) ? (
                <div>
                  <dt>改善してほしい点</dt>
                  <dd>
                    {improvementNotes.trim() ? improvementNotes : "（未入力）"}
                  </dd>
                </div>
              ) : null}
              {comments.trim() ? (
                <div>
                  <dt>自由記述</dt>
                  <dd className="survey-confirm-pre">{comments}</dd>
                </div>
              ) : (
                <div>
                  <dt>ご意見、ご感想(自由記述)</dt>
                  <dd className="survey-confirm-muted">（未入力）</dd>
                </div>
              )}
            </dl>

            <div className="survey-actions survey-actions--split">
              <button
                type="button"
                className="survey-btn survey-btn--secondary"
                onClick={() => setPhase("form")}
              >
                戻って修正する
              </button>
              <button
                type="button"
                className="survey-submit"
                onClick={handleConfirmSend}
              >
                送信する
              </button>
            </div>
          </div>
        </div>
      </main>
    );
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
          <p className="survey-required-note">
            <abbr className="field-required" title="必須項目">
              *
            </abbr>
            は必須項目です。
          </p>
        </header>

        <form className="survey-form" onSubmit={handleFormSubmit}>
          <div className="field">
            <label htmlFor="name">
              お名前
              <abbr className="field-required" title="必須">
                *
              </abbr>
            </label>
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
            <label htmlFor="email">
              メールアドレス
              <abbr className="field-required" title="必須">
                *
              </abbr>
            </label>
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

          <div className="field field-satisfaction">
            <div id="satisfaction-legend" className="satisfaction-heading">
              満足度
              <abbr className="field-required" title="必須">
                *
              </abbr>
            </div>
            <input
              type="hidden"
              name="satisfaction"
              value={satisfaction}
              required
              aria-hidden="true"
            />
            <div
              className="satisfaction-options"
              role="radiogroup"
              aria-labelledby="satisfaction-legend"
              aria-required="true"
            >
              {SATISFACTION_LEVELS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={satisfaction === value}
                  className={
                    satisfaction === value
                      ? "satisfaction-option satisfaction-option--selected"
                      : "satisfaction-option"
                  }
                  onClick={() => setSatisfactionValue(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {isLowSatisfaction(satisfaction) ? (
            <div className="field">
              <label htmlFor="improvementNotes">改善してほしい点</label>
              <textarea
                id="improvementNotes"
                name="improvementNotes"
                rows={4}
                value={improvementNotes}
                onChange={(e) => setImprovementNotes(e.target.value)}
                placeholder="改善してほしい点があればお書きください（任意）"
              />
            </div>
          ) : null}

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
              確認画面へ
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
