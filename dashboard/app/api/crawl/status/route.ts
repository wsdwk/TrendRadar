import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const OWNER = process.env.GITHUB_REPO_OWNER || "wsdwk"
const REPO = process.env.GITHUB_REPO_NAME || "TrendRadar"
const WORKFLOW = process.env.GITHUB_WORKFLOW_FILE || "crawler.yml"

type RunStatus = "queued" | "in_progress" | "completed" | "unknown"

export async function GET() {
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    return NextResponse.json({
      ok: false,
      configured: false,
      error: "缺少 GITHUB_TOKEN 环境变量",
    })
  }

  const url = `https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW}/runs?per_page=3`

  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  })

  if (!res.ok) {
    const text = await res.text()
    return NextResponse.json(
      {
        ok: false,
        configured: true,
        error: `GitHub API ${res.status}: ${text.slice(0, 200)}`,
      },
      { status: res.status },
    )
  }

  const data = (await res.json()) as {
    workflow_runs: Array<{
      id: number
      status: RunStatus
      conclusion: string | null
      html_url: string
      created_at: string
      updated_at: string
      run_started_at: string
      event: string
    }>
  }

  const latest = data.workflow_runs?.[0]
  const running = data.workflow_runs?.find((r) => r.status !== "completed")

  return NextResponse.json({
    ok: true,
    configured: true,
    latest: latest
      ? {
          id: latest.id,
          status: latest.status,
          conclusion: latest.conclusion,
          url: latest.html_url,
          startedAt: latest.run_started_at,
          updatedAt: latest.updated_at,
          event: latest.event,
        }
      : null,
    running: running
      ? {
          id: running.id,
          status: running.status,
          startedAt: running.run_started_at,
          url: running.html_url,
        }
      : null,
  })
}
