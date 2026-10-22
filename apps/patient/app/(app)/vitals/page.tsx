"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ActivityIcon, ArrowClockwise, ArrowLeft, CalendarBlank, Eye, LockKey, Plus } from "@phosphor-icons/react"
import { accessApi } from "@/lib/api/access"
import type { PatientRecord } from "@/lib/api/access-types"

function formatDate(value: string | null) {
  if (!value) return "Date not specified"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
}

export default function VitalsPage() {
  const [records, setRecords] = useState<PatientRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")

  const load = useCallback(async (quiet = false) => {
    if (quiet) setRefreshing(true)
    else setLoading(true)
    setError("")
    try {
      const allRecords = await accessApi.getRecords()
      setRecords(allRecords.filter((record) => record.category === "vitals"))
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't load your vitals.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  return (
    <main className="mx-auto w-full max-w-[950px] px-5 py-7 lg:px-[22px] lg:py-8">
      <Link href="/home" className="inline-flex items-center gap-2 text-sm font-medium text-ink-subtle hover:text-ink">
        <ArrowLeft size={18} /> Back to home
      </Link>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-weak text-brand"><ActivityIcon size={25} /></span>
            <div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">My vitals</h1>
              <p className="mt-1 text-sm text-ink-subtle">Measurements you've saved to your health records.</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => void load(true)} disabled={loading || refreshing} className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm font-medium hover:bg-field disabled:opacity-50">
            <ArrowClockwise size={18} className={refreshing ? "animate-spin" : ""} /> Refresh
          </button>
          <Link href="/records" className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-on-brand">
            <Plus size={18} /> Add vital
          </Link>
        </div>
      </div>

      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <article className="rounded-xl border border-line bg-surface p-4">
          <p className="text-xs font-medium text-ink-subtle">Saved measurements</p>
          <p className="mt-2 text-2xl font-bold">{loading ? "—" : records.length}</p>
        </article>
        <article className="rounded-xl border border-line bg-surface p-4">
          <p className="text-xs font-medium text-ink-subtle">Shared with providers</p>
          <p className="mt-2 text-2xl font-bold">{loading ? "—" : records.filter((record) => record.visibility === "public").length}</p>
        </article>
        <article className="rounded-xl border border-line bg-surface p-4">
          <p className="text-xs font-medium text-ink-subtle">Kept private</p>
          <p className="mt-2 text-2xl font-bold">{loading ? "—" : records.filter((record) => record.visibility === "private").length}</p>
        </article>
      </section>

      {error ? <div role="alert" className="mt-5 rounded-xl border border-danger bg-danger-weak p-4 text-sm text-danger"><p>{error}</p><button type="button" onClick={() => void load()} className="mt-2 font-semibold underline">Try again</button></div> : null}

      <section className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Your measurements</h2>
          <span className="text-sm text-ink-subtle">{loading ? "Loading…" : `${records.length} saved`}</span>
        </div>

        {loading ? (
          <div className="mt-3 rounded-xl border border-line bg-surface p-8 text-center text-sm text-ink-subtle" aria-busy="true">Loading your vitals…</div>
        ) : records.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-line bg-surface px-6 py-12 text-center">
            <ActivityIcon size={34} className="mx-auto text-ink-subtle" />
            <h3 className="mt-3 text-lg font-semibold">No vitals saved yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-subtle">Your saved vital measurements will appear here. The sample numbers shown on the home dashboard are not used as your medical record.</p>
            <Link href="/records" className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-on-brand"><Plus size={18} /> Add a vital record</Link>
          </div>
        ) : (
          <div className="mt-3 overflow-hidden rounded-xl border border-line bg-surface">
            <ul className="divide-y divide-line">
              {records.map((record) => (
                <li key={record.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold">{record.type}</p>
                    <p className="mt-1 break-words text-base">{record.title}</p>
                    {record.summary ? <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-ink-subtle">{record.summary}</p> : null}
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-subtle"><CalendarBlank size={14} /> {formatDate(record.eventAt ?? record.createdAt)}</p>
                  </div>
                  <span className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${record.visibility === "public" ? "bg-brand-weak text-brand" : "bg-chip text-ink-subtle"}`}>
                    {record.visibility === "public" ? <Eye size={14} /> : <LockKey size={14} />}
                    {record.visibility === "public" ? "Shared with providers" : "Private"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <p className="mt-5 text-xs leading-5 text-ink-subtle">This page displays measurements you've saved. It doesn't diagnose conditions or calculate medical interpretations.</p>
    </main>
  )
}
