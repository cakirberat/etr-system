const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5030"

export type LoginResponse = {
  token: string
  username: string
  expiresAt: string
}

export type DataRecord = Record<string, unknown>

export type PipelineResult = {
  rows: DataRecord[]
  removed: number
  flagged: number
  assigned: number
  transformed?: number
  remaining: number
  total: number
}

function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message ?? "Giriş başarısız. Bilgilerinizi kontrol edin.")
  }

  return res.json()
}

export async function fetchDataset(): Promise<DataRecord[]> {
  const res = await fetch(`${API_BASE}/api/data`, {
    headers: { ...authHeaders() },
  })

  if (!res.ok) throw new Error("Veri kümesi alınamadı.")
  return res.json()
}

export async function uploadFile(file: File): Promise<{ message: string; count: number }> {
  const form = new FormData()
  form.append("file", file)

  const res = await fetch(`${API_BASE}/api/data/upload`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: form,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message ?? "Dosya yüklenemedi.")
  }

  return res.json()
}

export async function uploadJson(records: DataRecord[]): Promise<{ message: string; count: number }> {
  const res = await fetch(`${API_BASE}/api/data/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(records),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message ?? "Veri gönderilemedi.")
  }

  return res.json()
}

export async function applyPipelineApi(rules: unknown[]): Promise<PipelineResult> {
  const res = await fetch(`${API_BASE}/api/data/pipeline`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ rules }),
  })

  if (!res.ok) throw new Error("Kural motoru çalıştırılamadı.")
  return res.json()
}

export function logout() {
  localStorage.removeItem("token")
  localStorage.removeItem("username")
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  return Boolean(localStorage.getItem("token"))
}
