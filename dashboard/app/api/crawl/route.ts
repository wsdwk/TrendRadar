import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const OWNER = process.env.GITHUB_REPO_OWNER || "wsdwk"
const REPO = process.env.GITHUB_REPO_NAME || "TrendRadar"
const WORKFLOW = process.env.GITHUB_WORKFLOW_FILE || "crawler.yml"
const REF = process.env.GITHUB_REF_NAME || "master"

// 简单的内存级节流：60 秒内只允许触发一次
let lastTriggerAt = 0
const COOLDOWN_MS = 60_000

export async function POST() {
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    return NextResponse.json(
      {
        ok: false,
        error: "缺少 GITHUB_TOKEN 环境变量。请在 Vercel 项目里添加一个有 actions:write 权限的 PAT。",
      },
      { status: 500 },
    )
  }

  const now = Date.now()
  const remaining = lastTriggerAt + COOLDOWN_MS - now
  if (remaining > 0) {
    return NextResponse.json(
      {
        ok: false,
        error: `请稍候 ${Math.ceil(remaining / 1000)} 秒后再试`,
        cooldown: remaining,
      },
      { status: 429 },
    )
  }

  const url = `https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW}/dispatches`

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ref: REF }),
  })

  if (!res.ok) {
    const text = await res.text()
    return NextResponse.json(
      {
        ok: false,
        error: `GitHub API 返回 ${res.status}: ${text.slice(0, 300)}`,
      },
      { status: res.status },
    )
  }

  lastTriggerAt = now
  return NextResponse.json({
    ok: true,
    message: "已触发抓取，请稍候 1-2 分钟",
    triggeredAt: new Date(now).toISOString(),
  })
}
