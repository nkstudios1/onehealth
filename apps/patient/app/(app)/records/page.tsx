"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowClockwise, FileText, Plus, Eye, LockKey, Activity, ClipboardText, FirstAidKit } from "@phosphor-icons/react"
import { accessApi } from "@/lib/api/access"
import type { NewRecordInput, PatientRecord, RecordCategory, RecordVisibility } from "@/lib/api/access-types"

const filters: { value: RecordCategory | "all"; label: string }[] = [
  { value: "all", label: "All records" }, { value: "vitals", label: "Vitals" },
  { value: "medical_history", label: "Medical history" }, { value: "clinical_report", label: "Clinical reports" },
]
const labels: Record<RecordCategory, string> = { vitals: "Vitals", medical_history: "Medical history", clinical_report: "Clinical report" }
const icons = { vitals: Activity, medical_history: FirstAidKit, clinical_report: ClipboardText }
const formatDate = (value: string | null) => {
  if (!value) return "Date not specified"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
}

export default function RecordsPage() {
  const [records, setRecords] = useState<PatientRecord[]>([])
  const [filter, setFilter] = useState<RecordCategory | "all">("all")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [category, setCategory] = useState<RecordCategory>("medical_history")
  const [type, setType] = useState("")
  const [title, setTitle] = useState("")
  const [summary, setSummary] = useState("")
  const [eventAt, setEventAt] = useState("")
  const [visibility, setVisibility] = useState<RecordVisibility>("private")

  const load = useCallback(async (quiet = false) => {
    quiet ? setRefreshing(true) : setLoading(true)
    setError("")
    try { setRecords(await accessApi.getRecords()) }
    catch (err) { setError(err instanceof Error ? err.message : "We couldn't load your records.") }
    finally { setLoading(false); setRefreshing(false) }
  }, [])
  useEffect(() => { void load() }, [load])

  const filtered = useMemo(() => records.filter((r) => filter === "all" || r.category === filter), [records, filter])
  const counts = useMemo(() => ({
    all: records.length,
    vitals: records.filter((r) => r.category === "vitals").length,
    medical_history: records.filter((r) => r.category === "medical_history").length,
    clinical_report: records.filter((r) => r.category === "clinical_report").length,
  }), [records])

  async function saveRecord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(""); setNotice("")
    const input: NewRecordInput = { category, type: type.trim(), title: title.trim(), visibility,
      ...(summary.trim() ? { summary: summary.trim() } : {}), ...(eventAt ? { eventAt } : {}) }
    try {
      const record = await accessApi.addRecord(input)
      setRecords((current) => [record, ...current]); setFilter("all"); setShowForm(false)
      setType(""); setTitle(""); setSummary(""); setEventAt(""); setVisibility("private")
      setNotice("Record saved.")
    } catch (err) { setError(err instanceof Error ? err.message : "We couldn't save this record.") }
    finally { setSaving(false) }
  }

  async function toggleVisibility(record: PatientRecord) {
    const next: RecordVisibility = record.visibility === "private" ? "public" : "private"
    setBusyId(record.id); setError(""); setNotice("")
    try {
      const updated = await accessApi.setVisibility(record.id, next)
      setRecords((current) => current.map((r) => r.id === updated.id ? updated : r))
      setNotice(next === "public" ? "Record is now available to authorised providers." : "Record is private again.")
    } catch (err) { setError(err instanceof Error ? err.message : "Couldn't update visibility.") }
    finally { setBusyId(null) }
  }

  return <main className="mx-auto w-full max-w-[950px] px-5 py-7 lg:px-[22px] lg:py-8">
    <Link href="/home" className="inline-flex items-center gap-2 text-sm font-medium text-ink-subtle hover:text-ink"><ArrowLeft size={18} /> Back to home</Link>
    <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
      <div><h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">My health records</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-ink-subtle">Your health information in one place. You control which records authorised providers can see.</p></div>
      <div className="flex gap-2"><button type="button" onClick={() => void load(true)} disabled={loading || refreshing} className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm font-medium hover:bg-field disabled:opacity-50"><ArrowClockwise size={18} className={refreshing ? "animate-spin" : ""} /> Refresh</button><button type="button" onClick={() => { setShowForm(true); setError(""); setNotice("") }} className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-on-brand"><Plus size={18} /> Add record</button></div>
    </div>
    <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{filters.map((item) => <button key={item.value} type="button" onClick={() => setFilter(item.value)} className={`rounded-xl border p-4 text-left ${filter === item.value ? "border-brand bg-brand-weak" : "border-line bg-surface hover:bg-field"}`}><span className="block text-xs font-medium text-ink-subtle">{item.label}</span><strong className="mt-2 block text-2xl">{counts[item.value]}</strong></button>)}</section>
    <div className="mt-6 flex items-center justify-between gap-3"><h2 className="text-lg font-bold">{filters.find((x) => x.value === filter)?.label}</h2><select aria-label="Filter records" value={filter} onChange={(e) => setFilter(e.target.value as RecordCategory | "all")} className="h-10 rounded-lg border border-line bg-surface px-3 text-sm">{filters.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}</select></div>
    {error && <div role="alert" className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
    {notice && <div role="status" className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}
    <section className="mt-4 rounded-2xl border border-line bg-surface p-4 sm:p-5">
      {loading ? <p className="py-12 text-center text-sm text-ink-subtle">Loading your records…</p> : filtered.length === 0 ? <div className="px-4 py-12 text-center"><FileText size={30} className="mx-auto text-brand" /><h3 className="mt-3 font-semibold">{records.length ? "No records in this category" : "Your record collection starts here"}</h3><p className="mx-auto mt-1 max-w-md text-sm text-ink-subtle">{records.length ? "Choose another category to see your other records." : "Add medical history, a vital reading or a clinical report. Records are private by default."}</p>{!records.length && <button type="button" onClick={() => setShowForm(true)} className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-on-brand"><Plus size={18} /> Add your first record</button>}</div> :
      <div className="divide-y divide-line">{filtered.map((record) => { const Icon = icons[record.category]; return <article key={record.id} className="py-4 first:pt-0 last:pb-0"><div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-weak text-brand"><Icon size={21} /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-medium text-ink-subtle">{labels[record.category]}</span><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${record.visibility === "public" ? "bg-emerald-100 text-emerald-800" : "bg-chip text-ink-subtle"}`}>{record.visibility === "public" ? "Shareable" : "Private"}</span></div><h3 className="mt-1 break-words font-semibold">{record.type}</h3><p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6">{record.title}</p>{record.summary && <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-ink-subtle">{record.summary}</p>}<p className="mt-2 text-xs text-ink-subtle">Event date: {formatDate(record.eventAt)} · Added: {formatDate(record.createdAt)}</p><button type="button" disabled={busyId === record.id} onClick={() => void toggleVisibility(record)} className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg border border-line px-3 text-sm font-medium hover:bg-field disabled:opacity-50">{record.visibility === "private" ? <Eye size={17} /> : <LockKey size={17} />}{busyId === record.id ? "Updating…" : record.visibility === "private" ? "Make visible to providers" : "Make private"}</button></div></div></article> })}</div>}
    </section>
    {showForm && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-5"><section role="dialog" aria-modal="true" aria-labelledby="record-form-title" className="max-h-[92svh] w-full max-w-xl overflow-y-auto rounded-t-2xl bg-surface p-5 shadow-xl sm:rounded-2xl sm:p-6"><h2 id="record-form-title" className="text-xl font-bold">Add a health record</h2><p className="mt-1 text-sm text-ink-subtle">Enter information as recorded. OneHealth will not generate a diagnosis.</p>
      <form onSubmit={saveRecord} className="mt-5 space-y-4">
        <label className="block text-sm font-medium">Category<select required value={category} onChange={(e) => setCategory(e.target.value as RecordCategory)} className="mt-1.5 h-11 w-full rounded-lg border border-line bg-field px-3"><option value="medical_history">Medical history</option><option value="vitals">Vitals</option><option value="clinical_report">Clinical report</option></select></label>
        <label className="block text-sm font-medium">Record name / measurement<input required maxLength={100} value={type} onChange={(e) => setType(e.target.value)} placeholder={category === "vitals" ? "e.g. Blood pressure" : "e.g. Allergy, blood group, consultation"} className="mt-1.5 h-11 w-full rounded-lg border border-line bg-field px-3 font-normal" /></label>
        <label className="block text-sm font-medium">{category === "vitals" ? "Reading / value" : "Main details"}<input required maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={category === "vitals" ? "e.g. 120/80 mmHg" : "Enter the value or main details"} className="mt-1.5 h-11 w-full rounded-lg border border-line bg-field px-3 font-normal" /></label>
        <label className="block text-sm font-medium">Additional notes <span className="font-normal text-ink-subtle">(optional)</span><textarea maxLength={10000} rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Context or source" className="mt-1.5 w-full rounded-lg border border-line bg-field p-3 font-normal" /></label>
        <label className="block text-sm font-medium">Date of event <span className="font-normal text-ink-subtle">(optional)</span><input type="date" value={eventAt} onChange={(e) => setEventAt(e.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-line bg-field px-3 font-normal" /></label>
        <fieldset><legend className="text-sm font-medium">Visibility</legend><div className="mt-2 grid gap-2 sm:grid-cols-2"><label className="flex cursor-pointer gap-2 rounded-xl border border-line p-3"><input type="radio" name="visibility" checked={visibility === "private"} onChange={() => setVisibility("private")} /> <span><strong className="block text-sm">Private</strong><span className="text-xs text-ink-subtle">Only you can see this record.</span></span></label><label className="flex cursor-pointer gap-2 rounded-xl border border-line p-3"><input type="radio" name="visibility" checked={visibility === "public"} onChange={() => setVisibility("public")} /> <span><strong className="block text-sm">Shareable</strong><span className="text-xs text-ink-subtle">Visible to providers with an authorised session.</span></span></label></div></fieldset>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-2 border-t border-line pt-4"><button type="button" disabled={saving} onClick={() => setShowForm(false)} className="h-10 rounded-lg border border-line px-4 text-sm font-semibold">Cancel</button><button type="submit" disabled={saving || !type.trim() || !title.trim()} className="h-10 rounded-lg bg-brand px-4 text-sm font-semibold text-on-brand disabled:opacity-50">{saving ? "Saving…" : "Save record"}</button></div>
      </form></section></div>}
  </main>
}
