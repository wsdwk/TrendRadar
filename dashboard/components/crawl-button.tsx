"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react"

type StatusResp = {
  ok: boolean
  configured?: boolean
  error?: string
  latest?: {
    id: number
    status: "queued" | "in_progress" | "completed"
    conclusion: string | null
    url: string
    startedAt: string
    updatedAt: string
    event: string
  } | null
  running?: {
    id: number
    status: "queued" | "in_progress"
    startedAt: string
    url: string
  } | null
}

type UIState =
  | { kind: "idle" }
  | { kind: "triggering" }
  | { kind: "running"; sinceMs: number }
  | { kind: "done"; ok: boolean; sinceMs: number }
  | { kind: "error"; msg: string }

function formatElapsed(ms: number) {
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m${s % 60}s`
}

export function CrawlButton() {
  const router = useRouter()
  const [state, setState] = useState<UIState>({ kind: "idle" })
  const [tick, setTick] = useState(0)

  // 进入页面时拉一次状态，看是否有正在跑的任务
  useEffect(() => {
    let alive = true
    fetch("/api/crawl/status")
      .then((r) => r.json())
      .then((d: StatusResp) => {
        if (!alive) return
        if (d.running) {
          setState({
            kind: "running",
            sinceMs: new Date(d.running.startedAt).getTime(),
          })
        }
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  // 运行中每 5 秒轮询一次状态
  useEffect(() => {
    if (state.kind !== "running" && state.kind !== "triggering") return
    const id = setInterval(async () => {
      try {
        const r = await fetch("/api/crawl/status", { cache: "no-store" })
        const d: StatusResp = await r.json()
        if (d.running) {
          setState({
            kind: "running",
            sinceMs: new Date(d.running.startedAt).getTime(),
          })
        } else if (d.latest && d.latest.status === "completed") {
          // 没有 running 且最新一条已完成，认为收工
          setState({
            kind: "done",
            ok: d.latest.conclusion === "success",
            sinceMs: Date.now(),
          })
          // 刷新当前页面拉新数据
          router.refresh()
          // 5 秒后回到 idle
          setTimeout(() => setState({ kind: "idle" }), 5000)
        }
        setTick((t) => t + 1)
      } catch {
        /* swallow */
      }
    }, 5000)
    return () => clearInterval(id)
  }, [state.kind, router])

  // 计时刷新 UI
  useEffect(() => {
    if (state.kind !== "running") return
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [state.kind])

  async function trigger() {
    setState({ kind: "triggering" })
    try {
      const r = await fetch("/api/crawl", { method: "POST" })
      const d = await r.json()
      if (!r.ok || !d.ok) {
        setState({ kind: "error", msg: d.error || "触发失败" })
        setTimeout(() => setState({ kind: "idle" }), 6000)
        return
      }
      setState({ kind: "running", sinceMs: Date.now() })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "网络错误"
      setState({ kind: "error", msg })
      setTimeout(() => setState({ kind: "idle" }), 6000)
    }
  }

  // 渲染
  const baseCls =
    "inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors"

  if (state.kind === "triggering") {
    return (
      <button
        disabled
        className={`${baseCls} border-border bg-card text-muted-foreground`}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        正在触发...
      </button>
    )
  }

  if (state.kind === "running") {
    const elapsed = formatElapsed(Date.now() - state.sinceMs)
    // 显式引用 tick 防止编译器优化掉
    void tick
    return (
      <button
        disabled
        className={`${baseCls} border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-400`}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        抓取中 · {elapsed}
      </button>
    )
  }

  if (state.kind === "done") {
    return (
      <button
        disabled
        className={`${baseCls} ${
          state.ok
            ? "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400"
            : "border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400"
        }`}
      >
        {state.ok ? (
          <>
            <CheckCircle2 className="h-4 w-4" />
            已完成
          </>
        ) : (
          <>
            <AlertCircle className="h-4 w-4" />
            执行失败
          </>
        )}
      </button>
    )
  }

  if (state.kind === "error") {
    return (
      <button
        onClick={trigger}
        title={state.msg}
        className={`${baseCls} border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400`}
      >
        <AlertCircle className="h-4 w-4" />
        触发失败，重试
      </button>
    )
  }

  return (
    <button
      onClick={trigger}
      className={`${baseCls} border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground`}
    >
      <RefreshCw className="h-4 w-4" />
      立即抓取
    </button>
  )
}
