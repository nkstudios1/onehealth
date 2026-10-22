"use client"

import { useMemo } from "react"
import {
  Activity,
  ArrowRight,
  CaretRight,
  CheckCircle,
  Circle,
  Drop,
  Heartbeat,
  Lightning,
  PersonSimple,
  Thermometer,
  Wind,
} from "@phosphor-icons/react"

import { useSessionStore } from "@/lib/stores/session-store"

const vitals = [
  { label: "Body", value: "Weight: 95kg", secondary: "BMI: 51.9kg/m²", Icon: PersonSimple, tone: "purple" },
  { label: "Blood Pressure", value: "120", secondary: "/80mmHg", Icon: Heartbeat, tone: "orange" },
  { label: "Blood Sugar", value: "Fasting: 72mg/dl", secondary: "Random: 88mg/dl", Icon: Drop, tone: "blue" },
  { label: "Breathing Rate", value: "16", secondary: "brpm", Icon: Wind, tone: "cyan" },
  { label: "Pain Score", value: "3", secondary: "/10", Icon: Lightning, tone: "pink" },
  { label: "Pulse Rate", value: "56", secondary: "bpm", Icon: Activity, tone: "green" },
  { label: "SpO2", value: "95", secondary: "%", Icon: Drop, tone: "brown" },
  { label: "Temperature", value: "80", secondary: "°C", Icon: Thermometer, tone: "red" },
]

const sessions = [
  { name: "Perfect Medicals Inc.", tag: "Card scan", access: "General", mark: "PM" },
  { name: "Dr. Oseyi Chinedu", tag: "Biometrics", access: "General", mark: "OC" },
  { name: "Dr. Oseyi Chinedu", tag: "Emergency", access: "General", mark: "OC" },
  { name: "Adetunji Osamede", tag: "In-app", access: "Full access", mark: "AO", warning: true },
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
  const toneClasses: Record<string, string> = {
    purple: "bg-[#f2d9ff] text-[#a100ff]",
    orange: "bg-[#ffe8d5] text-[#ff7a00]",
    blue: "bg-[#dbeaff] text-[#1769ff]",
    cyan: "bg-[#d7f5ff] text-[#00a9df]",
    pink: "bg-[#ffd8f5] text-[#ef16bf]",
    green: "bg-[#d9f5e8] text-[#20a578]",
    brown: "bg-[#f1e6da] text-[#b16a32]",
    red: "bg-[#ffdce1] text-[#ff3152]",
  }

  return (
    <article className="min-w-[190px] flex-1 rounded-2xl border border-[#e4e4e4] bg-[#f8f8f8] p-4">
      <div className="flex items-center gap-2">
        <span className={`flex size-8 items-center justify-center rounded-full ${toneClasses[item.tone]}`}><item.Icon size={18} /></span>
        <h3 className="text-[15px] font-medium">{item.label}</h3>
      </div>
      <div className="mt-6 flex min-h-[54px] flex-col justify-end">
        {item.label === "Body" || item.label === "Blood Sugar" ? (
          <div className="space-y-1 text-[14px] text-[#666]">
            <span className="block w-fit rounded border border-[#dedede] bg-white px-2 py-0.5">{item.value}</span>
            <span className="block w-fit rounded border border-[#dedede] bg-white px-2 py-0.5">{item.secondary}</span>
          </div>
        ) : (
          <p className="whitespace-nowrap"><span className="text-[31px] font-extrabold tracking-tight">{item.value}</span> <span className="text-[14px] text-[#777]">{item.secondary}</span></p>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-[#dedede] pt-3 text-[12px] text-[#777]"><span>Last updated: 2d ago</span><CaretRight size={17} /></div>
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
        <article className="flex min-h-[168px] flex-col justify-between rounded-2xl bg-[linear-gradient(135deg,#3ea996,#176d60)] p-4 text-white shadow-sm">
          <div className="flex items-center justify-between text-[13px] font-medium tracking-wide"><span>TOTAL RECORDS</span><span className="text-xl">▣</span></div>
          <div><div className="flex items-baseline gap-2"><strong className="text-[48px] leading-none">35</strong><span className="font-semibold">↑ 3 new</span></div><div className="mt-2 flex items-center justify-between text-[12px] opacity-90"><span>24 reports · 7 histories</span><CaretRight size={19} /></div></div>
        </article>
        <article className="flex min-h-[168px] flex-col justify-between rounded-2xl border border-[#e3e3e3] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-[13px] font-medium"><span>ACTIVE SESSIONS</span><PersonSimple className="text-brand" size={23} /></div>
          <div><div className="flex items-baseline gap-2"><strong className="text-[48px] leading-none">12</strong><span className="font-semibold text-brand">Providers</span></div><div className="mt-2 flex items-center justify-between text-[12px] text-[#777]"><span>5 hospitals · 3 labs</span><CaretRight size={19} /></div></div>
        </article>
        <article className="flex min-h-[168px] flex-col justify-between rounded-2xl border border-[#e3e3e3] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-[13px] font-medium"><span>PENDING REQUESTS</span><ArrowRight className="text-brand" size={22} /></div>
          <div><div className="flex items-baseline gap-2"><strong className="text-[48px] leading-none">3</strong><span className="font-semibold text-brand">Action required</span></div><div className="mt-2 flex items-center justify-between text-[12px] text-[#777]"><span>Clinical consent</span><CaretRight size={19} /></div></div>
        </article>
      </section>

      <section id="vitals" className="mt-6 overflow-hidden rounded-2xl border border-[#e2e2e2] bg-white p-5">
        <div className="flex items-center justify-between"><h2 className="font-display text-[20px] font-extrabold">My health vitals</h2><button className="flex items-center gap-1 text-[15px] font-medium text-brand">View readings <CaretRight size={18} /></button></div>
        <div className="mt-5 flex gap-5 overflow-x-auto pb-1 [scrollbar-width:none]">{vitals.map((item) => <VitalCard key={item.label} item={item} />)}</div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.45fr_0.75fr]">
        <article id="access-log" className="min-h-[500px] rounded-2xl border border-[#e2e2e2] bg-white p-5">
          <div className="flex items-center justify-between"><h2 className="font-display text-[20px] font-extrabold">Recent sessions</h2><button className="flex items-center gap-1 text-[15px] font-medium text-brand">See all <CaretRight size={18} /></button></div>
          <div className="mt-4 divide-y divide-[#e5e5e5]">
            {sessions.map((session, index) => <div key={`${session.name}-${index}`} className="flex min-h-[52px] items-center justify-between gap-3 py-2"><div className="flex min-w-0 items-center gap-3"><span className={`flex size-6 shrink-0 items-center justify-center rounded-md text-[9px] font-bold ${index === 0 ? "bg-[#18509c] text-white" : index === 3 ? "bg-[#f0f0f0] text-[#555]" : "bg-[#7b0ca6] text-white"}`}>{session.mark}</span><span className="truncate text-[15px]">{session.name}</span>{session.warning ? <span className="text-[13px] text-[#ff7a00]">Unverified</span> : null}</div><div className="flex shrink-0 items-center gap-2 text-[12px]"><span className="rounded border border-[#d7d7d7] px-2 py-1 text-[#777]">{session.tag}</span><span className={`rounded-full px-2 py-1 ${session.warning ? "bg-[#efd8ff] text-[#a100d6]" : "bg-[#ececec] text-[#777]"}`}>{session.access}</span></div></div>)}
          </div>
        </article>

        <article id="records" className="rounded-2xl border border-[#e2e2e2] bg-white p-5">
          <h2 className="font-display text-[20px] font-extrabold">Complete your account setup</h2>
          <div className="mx-auto mt-7 flex size-[112px] items-center justify-center rounded-full border-[10px] border-[#e5e5e5] border-r-brand border-t-brand text-[30px]">50%</div>
          <div className="mt-7 divide-y divide-[#e5e5e5]">
            {setup.map((item) => <div key={item.text} className="flex min-h-[52px] items-center gap-2 py-2 text-[15px]"><span>{item.done ? <CheckCircle className="text-brand" size={19} weight="fill" /> : <Circle className="text-[#777]" size={19} />}</span><span className="flex-1">{item.text}</span>{item.count ? <span className="font-medium">({item.count})</span> : null}{item.arrow ? <CaretRight size={17} className="text-[#777]" /> : null}</div>)}
          </div>
        </article>
      </section>
    </main>
  )
}
