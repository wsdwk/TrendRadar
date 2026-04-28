"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react"

type RunInfo = {
  id: number
  status: "queued" | "in_progress" | "completed"
  conclusion: string | null
  url: string
  startedAt: string
  updatedAt: string
  event: string
}

type StatusResp = {
  ok: boolean
  configured?: boolean
  error?: string
  latest?: RunInfo | null
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
  | { kind: "running"; sinceMs: number; runUrl?: string }
  | { kind: "done"; ok: boolean; runUrl?: string }
  | { kind: "error"; msg: string }

function formatElapsed(ms: number) {
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m${s % 60}s`
}

export function CrawlButton() {
  const router = useRouter()
  const [state, setState] = useState<UIState>({ kind: "idle" })
  const [, setTick] = useState(0)
  // 记录"本次触发时间戳",用来识别是不是这一次的 run
  const triggerAtRef = useRef<number | null>(null)

  // 进入页面时拉一次状态——只在已经有 running 时才接管 UI
  useEffect(() => {
    let alive = true
    fetch("/api/crawl/status")
      .then((r) => r.json())
      .then((d: StatusResp) => {
        if (!alive) return
        console.log("[v0] crawl status init:", d)
        if (d.running) {
          triggerAtRef.current = new Date(d.running.startedAt).getTime()
          setState({
            kind: "running",
            sinceMs: triggerAtRef.current,
            runUrl: d.running.url,
          })
        }
      })
      .catch((e) => console.log("[v0] crawl status init failed:", e))
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
        console.log("[v0] crawl status poll:", d)

        const triggerAt = triggerAtRef.current ?? 0

        // 1) 后端报告有 running 任务 → 显示 running
        if (d.running) {
          setState({
            kind: "running",
            sinceMs: new Date(d.running.startedAt).getTime(),
            runUrl: d.running.url,
          })
          setTick((t) => t + 1)
          return
        }

        // 2) 没有 running,看 latest 是否是这次触发的 run
        // 只接受 startedAt >= triggerAt - 30s 的 run(留一点容差)
        const latest = d.latest
        if (
          latest &&
          latest.status === "completed" &&
          new Date(latest.startedAt).getTime() >= triggerAt - 30000
        ) {
          console.log("[v0] crawl finished:", latest)
          setState({
            kind: "done",
            ok: latest.conclusion === "success",
            runUrl: latest.url,
          })
          router.refresh()
          setTimeout(() => setState({ kind: "idle" }), 6000)
          return
        }

        // 3) 否则继续等(GitHub API 还没把这次 run 暴露出来)
        setTick((t) => t + 1)
      } catch (e) {
        console.log("[v0] crawl status poll failed:", e)
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
    console.log("[v0] crawl: trigger clicked")
    setState({ kind: "triggering" })
    triggerAtRef.current = Date.now()
    try {
      const r = await fetch("/api/crawl", { method: "POST" })
      const d = await r.json()
      console.log("[v0] crawl: POST response", r.status, d)
      if (!r.ok || !d.ok) {
        setState({ kind: "error", msg: d.error || `触发失败 (HTTP ${r.status})` })
        setTimeout(() => setState({ kind: "idle" }), 6000)
        return
      }
      setState({ kind: "running", sinceMs: Date.now() })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "网络错误"
      console.log("[v0] crawl: POST exception", e)
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
    const inner = (
      <>
        <Loader2 className="h-4 w-4 animate-spin" />
        抓取中 · {elapsed}
      </>
    )
    const cls = `${baseCls} border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-400`
    if (state.runUrl) {
      return (
        <a href={state.runUrl} target="_blank" rel="noreferrer" className={cls} title="点击查看 GitHub Actions 详情">
          {inner}
        </a>
      )
    }
    return <button disabled className={cls}>{inner}</button>
  }

  if (state.kind === "done") {
    const cls = `${baseCls} ${
      state.ok
        ? "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400"
        : "border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400"
    }`
    const inner = state.ok ? (
      <>
        <CheckCircle2 className="h-4 w-4" />
        已完成
      </>
    ) : (
      <>
        <AlertCircle className="h-4 w-4" />
        执行失败
      </>
    )
    if (state.runUrl) {
      return (
        <a href={state.runUrl} target="_blank" rel="noreferrer" className={cls} title="点击查看 GitHub Actions 详情">
          {inner}
        </a>
      )
    }
    return <button disabled className={cls}>{inner}</button>
  }

  if (state.kind === "error") {
    return (
      <button
        onClick={trigger}
        title={state.msg}
        className={`${baseCls} border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400`}
      >
        <AlertCircle className="h-4 w-4" />
        触发失败,重试
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
