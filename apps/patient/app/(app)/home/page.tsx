"use client"

import { useMemo } from "react"
import Link from "next/link"
import {
  Activity,
  ArrowRight,
  CaretRight,
  CheckCircle,
  Circle,
  Drop,
  FileText,
  Heartbeat,
  Lightning,
  PersonSimple,
  Thermometer,
  UserCircle,
  Wind,
} from "@phosphor-icons/react"

import { useSessionStore } from "@/lib/stores/session-store"

const vitals = [
  { label: "Body", lines: ["Weight: 95kg", "BMI: 51.9kg/m²"], Icon: PersonSimple, iconClass: "bg-[#f0d8ff] text-[#a100ff]" },
  { label: "Blood Pressure", value: "120", unit: "/80mmHg", Icon: Heartbeat, iconClass: "bg-[#ffe7d5] text-[#ff7a00]" },
  { label: "Blood Sugar", lines: ["Fasting: 72mg/dl", "Random: 88mg/dl"], Icon: Drop, iconClass: "bg-[#dceaff] text-[#1769ff]" },
  { label: "Breathing Rate", value: "16", unit: "brpm", Icon: Wind, iconClass: "bg-[#d8f5ff] text-[#00a9df]" },
  { label: "Pain Score", value: "3", unit: "/10", Icon: Lightning, iconClass: "bg-[#ffd8f5] text-[#ef16bf]" },
  { label: "Pulse Rate", value: "56", unit: "bpm", Icon: Activity, iconClass: "bg-[#d9f5e8] text-[#20a578]" },
  { label: "SpO2", value: "95", unit: "%", Icon: Drop, iconClass: "bg-[#f1e6da] text-[#b16a32]" },
  { label: "Temperature", value: "80", unit: "°C", Icon: Thermometer, iconClass: "bg-[#ffdce1] text-[#ff3152]" },
]

const sessions = [
  { name: "Perfect Medicals Inc.", tag: "Card scan", access: "General", mark: "✦", markClass: "bg-[#1754a5] text-white" },
  { name: "Dr. Oseyi Chinedu", tag: "Biometrics", access: "General", mark: "OC", markClass: "bg-[#252525] text-white" },
  { name: "Dr. Oseyi Chinedu", tag: "Emergency", access: "General", mark: "FL", markClass: "bg-[#a000b8] text-white" },
  { name: "Adetunji Osamede", tag: "In-app", access: "Full access", mark: "AO", markClass: "bg-[#ececec] text-[#555]", warning: true },
]

const setup = [
  { text: "Verify your phone", done: true },
  { text: "Upload your profile picture", done: true },
  { text: "Complete your contact info", done: true, count: "2/6" },
  { text: "Add emergency contacts", done: true, count: "1/3", arrow: true },
  { text: "Activate your OneHealth card", done: false, arrow: true },
  { text: "Add your first record", done: false, arrow: true },
]

function VitalCard({ item }: { item: (typeof vitals)[number] }) {
  return (
    <article className="w-[190px] shrink-0 rounded-2xl border border-[#e2e2e2] bg-[#f8f8f8] p-4">
      <div className="flex items-center gap-2">
        <span className={`flex size-8 items-center justify-center rounded-full ${item.iconClass}`}>
          <item.Icon aria-hidden size={18} />
        </span>
        <h3 className="whitespace-nowrap text-[14px] font-medium">{item.label}</h3>
      </div>

      <div className="mt-6 flex min-h-[54px] flex-col justify-end">
        {"lines" in item ? (
          <div className="space-y-1 text-[13px] text-[#666]">
            {item.lines.map((line) => <span key={line} className="block w-fit rounded border border-[#dedede] bg-white px-2 py-0.5">{line}</span>)}
          </div>
        ) : (
          <p className="whitespace-nowrap">
            <span className="text-[31px] font-extrabold tracking-tight">{item.value}</span>
            <span className="ml-1 text-[13px] text-[#777]">{item.unit}</span>
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#dedede] pt-3 text-[12px] text-[#777]">
        <span>Last updated: 2d ago</span>
        <CaretRight aria-hidden size={17} />
      </div>
    </article>
  )
}

function SummaryCard({ kind, value, label, detail, icon }: { kind: "records" | "sessions" | "requests"; value: string; label: string; detail: string; icon: React.ReactNode }) {
  const records = kind === "records"
  return (
    <article className={`flex min-h-[168px] flex-col justify-between rounded-2xl border p-4 shadow-sm ${records ? "border-transparent bg-[#2b8878] text-white" : "border-[#e2e2e2] bg-white text-[#111]"}`}>
      <div className="flex items-center justify-between text-[13px] font-medium">
        <span>{records ? "TOTAL RECORDS" : kind === "sessions" ? "ACTIVE SESSIONS" : "PENDING REQUESTS"}</span>
        <span className={records ? "text-white" : "text-[#238f80]"}>{icon}</span>
      </div>
      <div>
        <div className="flex items-baseline gap-2">
          <strong className="text-[48px] leading-none tracking-tight">{value}</strong>
          <span className={`font-semibold ${records ? "text-white" : "text-[#238f80]"}`}>{label}</span>
        </div>
        <div className={`mt-2 flex items-center justify-between text-[12px] ${records ? "text-white/85" : "text-[#777]"}`}>
          <span>{detail}</span>
          <CaretRight aria-hidden size={19} />
        </div>
      </div>
    </article>
  )
}

export default function HomePage() {
  const user = useSessionStore((s) => s.user)
  const name = useMemo(() => user?.fullName ?? user?.username ?? "Isoken", [user])

  return (
    <main className="mx-auto w-full max-w-[950px] px-5 py-7 lg:px-[22px] lg:py-8">
      <h1 className="font-display text-[36px] font-extrabold tracking-tight sm:text-[40px]">Welcome back, {name}!</h1>

      <section className="mt-7 grid gap-4 xl:grid-cols-3">
        <SummaryCard kind="records" value="35" label="↑ 3 new" detail="24 reports · 7 histories" icon={<FileText aria-hidden size={23} />} />
        <SummaryCard kind="sessions" value="12" label="Providers" detail="5 hospitals · 3 labs" icon={<UserCircle aria-hidden size={23} />} />
        <SummaryCard kind="requests" value="3" label="Action required" detail="Clinical consent" icon={<ArrowRight aria-hidden size={22} />} />
      </section>

      <section id="vitals" className="mt-6 overflow-hidden rounded-2xl border border-[#e2e2e2] bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-[20px] font-extrabold">My health vitals</h2>
          <Link href="#vitals" className="flex shrink-0 items-center gap-1 text-[15px] font-medium text-[#238f80]">View readings <CaretRight aria-hidden size={18} /></Link>
        </div>
        <div className="mt-5 flex gap-5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {vitals.map((item) => <VitalCard key={item.label} item={item} />)}
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.45fr_0.75fr]">
        <article id="access-log" className="min-h-[500px] rounded-2xl border border-[#e2e2e2] bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[20px] font-extrabold">Recent sessions</h2>
            <Link href="#access-log" className="flex items-center gap-1 text-[15px] font-medium text-[#238f80]">See all <CaretRight aria-hidden size={18} /></Link>
          </div>

          <div className="mt-4 divide-y divide-[#e5e5e5]">
            {sessions.map((session, index) => (
              <div key={`${session.name}-${index}`} className="flex min-h-[52px] items-center justify-between gap-3 py-2">
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`flex size-6 shrink-0 items-center justify-center rounded-md text-[9px] font-bold ${session.markClass}`}>{session.mark}</span>
                  <span className="truncate text-[15px]">{session.name}</span>
                  {session.warning ? <span className="text-[13px] text-[#ff7a00]">Unverified</span> : null}
                </div>
                <div className="flex shrink-0 items-center gap-2 text-[12px]">
                  <span className="rounded border border-[#d7d7d7] px-2 py-1 text-[#777]">{session.tag}</span>
                  <span className={`rounded-full px-2 py-1 ${session.warning ? "bg-[#efd8ff] text-[#a100d6]" : "bg-[#ececec] text-[#777]"}`}>{session.access}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article id="records" className="rounded-2xl border border-[#e2e2e2] bg-white p-5">
          <h2 className="font-display text-[20px] font-extrabold">Complete your account setup</h2>
          <div className="mx-auto mt-7 flex size-[112px] items-center justify-center rounded-full border-[10px] border-[#e5e5e5] border-r-[#238f80] border-t-[#238f80] text-[30px]">50%</div>

          <div className="mt-7 divide-y divide-[#e5e5e5]">
            {setup.map((item) => (
              <div key={item.text} className="flex min-h-[52px] items-center gap-2 py-2 text-[15px]">
                <span>{item.done ? <CheckCircle aria-hidden className="text-[#238f80]" size={19} weight="fill" /> : <Circle aria-hidden className="text-[#777]" size={19} />}</span>
                <span className="flex-1">{item.text}</span>
                {item.count ? <span className="font-medium">({item.count})</span> : null}
                {item.arrow ? <CaretRight aria-hidden size={17} className="text-[#777]" /> : null}
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  )
}
