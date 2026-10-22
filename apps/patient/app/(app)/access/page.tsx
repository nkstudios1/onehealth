"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle, Clock, ShieldCheck, XCircle, ArrowClockwise } from "@phosphor-icons/react"
import { accessApi } from "@/lib/api/access"
import type { AccessRequestSummary, PatientSession } from "@/lib/api/access-types"

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
}

export default function AccessPage() {
  const [requests, setRequests] = useState<AccessRequestSummary[]>([])
  const [sessions, setSessions] = useState<PatientSession[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  const load = useCallback(async (quiet = false) => {
    if (quiet) setRefreshing(true)
    else setLoading(true)
    setError("")
    try {
      const [nextRequests, nextSessions] = await Promise.all([
        accessApi.pendingRequests(),
        accessApi.sessionHistory(),
      ])
      setRequests(nextRequests)
      setSessions(nextSessions)
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't load access information. Please try again.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  async function decide(id: string, action: "approve" | "deny") {
    setBusyId(id)
    setError("")
    setNotice("")
    try {
      if (action === "approve") await accessApi.approve(id)
      else await accessApi.deny(id)
      setNotice(action === "approve" ? "Access approved. The session is now recorded." : "Access request denied.")
      await load(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't complete that action. Please try again.")
    } finally {
      setBusyId(null)
    }
  }

  async function revoke(id: string) {
    if (!window.confirm("End this provider's access now? They will no longer be able to use this session.")) return
    setBusyId(id)
    setError("")
    setNotice("")
    try {
      await accessApi.revoke(id)
      setNotice("Access has been revoked.")
      await load(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't revoke access. Please try again.")
    } finally {
      setBusyId(null)
    }
  }

  const activeSessions = sessions.filter((session) => session.status === "active")

  return (
    <main className="mx-auto w-full max-w-[950px] px-5 py-7 lg:px-[22px] lg:py-8">
      <Link href="/home" className="inline-flex items-center gap-2 text-sm font-medium text-ink-subtle hover:text-ink"><ArrowLeft size={18} /> Back to home</Link>
      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Share &amp; manage access</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-subtle">Review requests to access your health records and manage providers who currently have access.</p>
        </div>
        <button type="button" onClick={() => void load(true)} disabled={loading || refreshing} className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm font-medium hover:bg-field disabled:opacity-50">
          <ArrowClockwise size={18} className={refreshing ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {error ? <div role="alert" className="mt-5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {notice ? <div role="status" className="mt-5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div> : null}

      <section className="mt-7 rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-brand-weak text-brand"><Clock size={22} /></span>
          <div><h2 className="text-lg font-bold">Requests awaiting your decision</h2><p className="mt-0.5 text-sm text-ink-subtle">A scan alone does not give a provider access. You decide whether to approve.</p></div>
        </div>
        {loading ? <p className="py-8 text-sm text-ink-subtle">Loading access requests…</p> : requests.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-line px-4 py-8 text-center">
            <CheckCircle size={28} className="mx-auto text-brand" />
            <p className="mt-2 font-semibold">You're all caught up</p>
            <p className="mt-1 text-sm text-ink-subtle">New provider requests will appear here when they need your approval.</p>
          </div>
        ) : <div className="mt-5 space-y-3">
          {requests.map((request) => <article key={request.requestId} className="rounded-xl border border-line p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h3 className="font-semibold">{request.organisationName}</h3><p className="mt-1 text-sm text-ink-subtle">Requested {formatDate(request.requestedAt)}</p><p className="mt-1 text-xs text-ink-subtle">Request expires {formatDate(request.expiresAt)}</p></div>
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">Needs decision</span>
            </div>
            {request.frontDeskNumbers?.length ? <p className="mt-3 text-sm">Official front desk: <strong>{request.frontDeskNumbers.join(", ")}</strong></p> : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" disabled={busyId === request.requestId} onClick={() => void decide(request.requestId, "approve")} className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-on-brand disabled:opacity-50"><CheckCircle size={18} /> {busyId === request.requestId ? "Working…" : "Approve access"}</button>
              <button type="button" disabled={busyId === request.requestId} onClick={() => void decide(request.requestId, "deny")} className="inline-flex h-10 items-center gap-2 rounded-lg border border-line px-4 text-sm font-semibold hover:bg-field disabled:opacity-50"><XCircle size={18} /> Deny</button>
            </div>
          </article>)}
        </div>}
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-brand-weak text-brand"><ShieldCheck size={22} /></span>
          <div><h2 className="text-lg font-bold">Provider access history</h2><p className="mt-0.5 text-sm text-ink-subtle">Revoke active sessions whenever you choose.</p></div>
        </div>
        {loading ? <p className="py-8 text-sm text-ink-subtle">Loading sessions…</p> : sessions.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-line px-4 py-8 text-center"><ShieldCheck size={28} className="mx-auto text-ink-subtle" /><p className="mt-2 font-semibold">No provider sessions yet</p><p className="mt-1 text-sm text-ink-subtle">Approved access sessions will be listed here.</p></div>
        ) : <div className="mt-5 divide-y divide-line">
          {sessions.map((session) => <article key={session.id} className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
            <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{session.organisationName}</h3><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${session.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-chip text-ink-subtle"}`}>{session.status}</span></div><p className="mt-1 text-sm text-ink-subtle">{session.method} · {session.accessLevel}</p><p className="mt-1 text-xs text-ink-subtle">Started {formatDate(session.startedAt)}{session.endedAt ? ` · Ended ${formatDate(session.endedAt)}` : ""}</p></div>
            {session.status === "active" ? <button type="button" disabled={busyId === session.id} onClick={() => void revoke(session.id)} className="h-9 rounded-lg border border-red-200 px-3 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">{busyId === session.id ? "Revoking…" : "Revoke access"}</button> : null}
          </article>)}
        </div>}
        <p className="mt-5 text-xs leading-5 text-ink-subtle">Your records remain private by default. Providers can only view records you've made public, and this page lets you end an active session.</p>
      </section>
    </main>
  )
}
