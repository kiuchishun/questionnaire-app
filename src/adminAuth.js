const SESSION_KEY = 'questionnaire-admin-auth'

function trimEnvPassword() {
  const v = import.meta.env.VITE_ADMIN_PASSWORD
  return typeof v === 'string' ? v.trim() : ''
}

/** 検証に使う期待パスワード。本番で未設定のときは null。 */
export function resolveAdminPassword() {
  const fromEnv = trimEnvPassword()
  if (fromEnv) return fromEnv
  if (import.meta.env.DEV) return 'admin'
  return null
}

export function canAttemptAdminLogin() {
  return resolveAdminPassword() != null
}

export function isAdminAuthenticated() {
  return sessionStorage.getItem(SESSION_KEY) === '1'
}

export function openAdminSession() {
  sessionStorage.setItem(SESSION_KEY, '1')
}

export function closeAdminSession() {
  sessionStorage.removeItem(SESSION_KEY)
}

export function verifyAdminPassword(input) {
  const expected = resolveAdminPassword()
  if (expected == null) return false
  return input === expected
}

/** ログイン画面に表示する案内（未設定時など） */
export function adminLoginHint() {
  if (trimEnvPassword()) return null
  if (import.meta.env.DEV) {
    return '開発中: .env に VITE_ADMIN_PASSWORD がないため、パスワードは「admin」です。'
  }
  return '本番ではビルド時に環境変数 VITE_ADMIN_PASSWORD を設定してください。'
}
