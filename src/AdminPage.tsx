import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  adminLoginHint,
  canAttemptAdminLogin,
  closeAdminSession,
  isAdminAuthenticated,
  openAdminSession,
  verifyAdminPassword,
} from "./adminAuth";
import {
  STORAGE_KEY,
  clearAllResponses,
  listResponses,
  removeResponse,
  type SurveyResponse,
} from "./responsesStorage";
import {
  SATISFACTION_LEVELS,
  normalizeSatisfactionValue,
  satisfactionLabel,
  satisfactionOrdinal,
  type SatisfactionValue,
} from "./surveyConstants";

const dateFmt = new Intl.DateTimeFormat("ja-JP", {
  dateStyle: "medium",
  timeStyle: "short",
});

const scoreFmt = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

type SatisfactionDistribution = Record<SatisfactionValue, number>;

function buildSatisfactionStats(items: SurveyResponse[]) {
  const distribution = Object.fromEntries(
    SATISFACTION_LEVELS.map((l) => [l.value, 0]),
  ) as SatisfactionDistribution;
  const scores: number[] = [];
  for (const r of items) {
    const key = normalizeSatisfactionValue(r?.satisfaction);
    if (!key || distribution[key] === undefined) continue;
    distribution[key] += 1;
    const ord = satisfactionOrdinal(key);
    if (Number.isFinite(ord)) scores.push(ord);
  }
  const maxCount = Math.max(0, ...Object.values(distribution));
  const scoredN = scores.length;
  const average =
    scoredN > 0 ? scores.reduce((a, b) => a + b, 0) / scoredN : null;
  return {
    totalCount: items.length,
    average,
    distribution,
    maxCount,
  };
}

function formatSubmittedAt(iso: string): string {
  try {
    return dateFmt.format(new Date(iso));
  } catch {
    return iso;
  }
}

export function AdminPage() {
  const [authed, setAuthed] = useState(() => isAdminAuthenticated());
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [items, setItems] = useState<SurveyResponse[]>(() => listResponses());

  const stats = useMemo(() => buildSatisfactionStats(items), [items]);
  const loginHint = useMemo(() => adminLoginHint(), []);

  const chartDescription = useMemo(() => {
    if (items.length === 0) return "回答はまだありません。";
    return SATISFACTION_LEVELS.map(
      (l) => `${l.label} ${stats.distribution[l.value]}件`,
    ).join("。");
  }, [items, stats]);

  const refresh = useCallback(() => {
    setItems(listResponses());
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === null) refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  function handleDeleteOne(id: string) {
    removeResponse(id);
    refresh();
  }

  function handleClearAll() {
    if (
      !window.confirm("すべての回答を削除しますか？この操作は取り消せません。")
    )
      return;
    clearAllResponses();
    refresh();
  }

  function handleLogout() {
    closeAdminSession();
    setAuthed(false);
    setPassword("");
    setLoginError("");
  }

  function handleLoginSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoginError("");
    if (!canAttemptAdminLogin()) {
      setLoginError("現在の設定ではログインできません。");
      return;
    }
    if (!verifyAdminPassword(password)) {
      setLoginError("パスワードが正しくありません。");
      return;
    }
    openAdminSession();
    setAuthed(true);
    setPassword("");
  }

  if (!authed) {
    return (
      <main className="survey admin">
        <div className="survey-shell admin-shell">
          <header className="survey-header admin-header">
            <p className="survey-badge">管理</p>
            <h1>ログイン</h1>
            <p className="survey-lead">
              パスワードを入力して管理画面に入ります。タブを閉じると再度ログインが必要です。
              <br />
              開発中のためパスワードは1234です
            </p>
          </header>

          <form className="survey-form" onSubmit={handleLoginSubmit}>
            {loginHint ? <p className="admin-login-hint">{loginHint}</p> : null}
            {!canAttemptAdminLogin() ? (
              <p className="admin-login-error" role="alert">
                環境変数 VITE_ADMIN_PASSWORD
                が未設定のため、本番ビルドではログインできません。
              </p>
            ) : null}
            {loginError ? (
              <p className="admin-login-error" role="alert">
                {loginError}
              </p>
            ) : null}
            <fieldset className="field">
              <label htmlFor="admin-password">パスワード</label>
              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!canAttemptAdminLogin()}
                required
              />
            </fieldset>
            <div className="survey-actions">
              <button
                type="submit"
                className="survey-submit"
                disabled={!canAttemptAdminLogin()}
              >
                ログイン
              </button>
            </div>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="survey admin">
      <div className="survey-shell admin-shell admin-shell--bare">
        <div className="admin-panels" aria-label="管理ダッシュボード">
          <div className="admin-stats-top">
            <article className="admin-panel-card admin-panel-card--stat">
              <h2 className="admin-panel-heading">満足度平均</h2>
              <p className="admin-summary-value admin-summary-value--in-card">
                {stats.average != null ? scoreFmt.format(stats.average) : "—"}
              </p>
              {stats.average != null ? (
                <p className="admin-summary-unit">点</p>
              ) : stats.totalCount > 0 ? (
                <p className="admin-summary-unit">（満足度の有効データなし）</p>
              ) : null}
            </article>

            <article className="admin-panel-card admin-panel-card--stat">
              <h2 className="admin-panel-heading">回答数</h2>
              <p className="admin-summary-value admin-summary-value--in-card">
                {stats.totalCount}
              </p>
              <p className="admin-summary-unit">件</p>
            </article>
          </div>

          <article className="admin-panel-card admin-panel-card--stat">
            <h2 className="admin-panel-heading">満足度の分布</h2>
            <div
              className="admin-chart"
              role="img"
              aria-label={`満足度の内訳。${chartDescription}`}
            >
              <div className="admin-chart-bars">
                {SATISFACTION_LEVELS.map(({ value, label }) => {
                  const count = stats.distribution[value];
                  const pct =
                    stats.maxCount > 0 ? (count / stats.maxCount) * 100 : 0;
                  return (
                    <div key={value} className="admin-chart-row">
                      <span className="admin-chart-label">{label}</span>
                      <div className="admin-chart-track">
                        <div
                          className="admin-chart-bar"
                          style={{ width: `${pct}%` }}
                          title={`${label}：${count}件`}
                        />
                      </div>
                      <span className="admin-chart-count" aria-hidden="true">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="admin-chart-axis-label">
                とても不満 → とても満足の順
              </p>
            </div>
          </article>

          <article className="admin-panel-card admin-panel-card--list">
            <div className="admin-panel-list-head">
              <h2 className="admin-panel-heading">回答一覧</h2>
              <div className="admin-panel-list-actions">
                <button
                  type="button"
                  className="admin-btn admin-btn--danger"
                  onClick={handleClearAll}
                  disabled={items.length === 0}
                >
                  全削除
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost"
                  onClick={handleLogout}
                >
                  ログアウト
                </button>
              </div>
            </div>
            {items.length === 0 ? (
              <p className="admin-empty admin-empty--in-card">
                まだ回答がありません。
              </p>
            ) : (
              <ul className="admin-response-cards">
                {items.map((r) => (
                  <li key={r.id} className="admin-response-card">
                    <div className="admin-response-card__main">
                      <p className="admin-response-card__name">
                        {r.name?.trim() ? r.name : "—"}
                      </p>
                      <p className="admin-response-card__email">
                        {r.email?.trim() ? (
                          <a href={`mailto:${r.email}`}>{r.email}</a>
                        ) : (
                          "—"
                        )}
                      </p>
                      <p className="admin-response-card__time">
                        <time dateTime={r.submittedAt}>
                          {formatSubmittedAt(r.submittedAt)}
                        </time>
                      </p>
                      <p className="admin-response-card__satisfaction">
                        {satisfactionLabel(r.satisfaction)}
                      </p>
                    </div>
                    <div className="admin-response-card__actions">
                      <button
                        type="button"
                        className="admin-btn admin-btn--ghost"
                        aria-label="この回答を削除"
                        onClick={() => handleDeleteOne(r.id)}
                      >
                        削除
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </div>
      </div>
    </main>
  );
}
