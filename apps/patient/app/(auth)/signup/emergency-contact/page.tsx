"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, UserList, X } from "@phosphor-icons/react"

import { Button } from "@workspace/ui/components/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { FlowCard, FlowHeader } from "@workspace/ui/components/flow-card"
import { IconBadge } from "@workspace/ui/components/icon-badge"
import { Input } from "@workspace/ui/components/input"
import {
  NativeSelect,
  NativeSelectOption,
} from "@workspace/ui/components/native-select"

import { authApi, getErrorMessage } from "@/lib/api"
import {
  MAX_EMERGENCY_CONTACTS,
  MIN_EMERGENCY_CONTACTS,
  RELATIONSHIPS,
  SIGNUP_STEPS,
} from "@/lib/constants"
import { useStepGuard } from "@/lib/hooks/use-step-guard"
import { ROUTES } from "@/lib/routes"
import { useSignupStore } from "@/lib/stores/signup-store"
import {
  emergencyContactSchema,
  type EmergencyContactValues,
} from "@/lib/validation/signup"

export default function EmergencyContactPage() {
  const router = useRouter()
  const registrationId = useSignupStore((s) => s.registrationId)
  const patientPhone = useSignupStore((s) => s.phone)
  const phoneVerified = useSignupStore((s) => s.phoneVerified)
  const contacts = useSignupStore((s) => s.contacts)
  const addContact = useSignupStore((s) => s.addContact)
  const removeContact = useSignupStore((s) => s.removeContact)

  const [listError, setListError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // This form only edits ONE contact at a time. The list lives in the store.
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<EmergencyContactValues>({
    resolver: zodResolver(emergencyContactSchema),
    defaultValues: { name: "", relationship: "", phone: "", email: "" },
  })

  const allowed = useStepGuard(Boolean(registrationId && phoneVerified))
  if (!allowed || !registrationId) return null

  function onAdd(values: EmergencyContactValues) {
    setListError(null)
    if (contacts.length >= MAX_EMERGENCY_CONTACTS) {
      setListError(`You can add up to ${MAX_EMERGENCY_CONTACTS} emergency contacts.`)
      return
    }
    if (values.phone === patientPhone) {
      setError("phone", { message: "Use a number that isn't your own" })
      return
    }
    if (contacts.some((contact) => contact.phone === values.phone)) {
      setError("phone", { message: "This contact has already been added" })
      return
    }
    addContact({
      name: values.name.trim(),
      relationship: values.relationship,
      phone: values.phone,
      email: values.email || undefined,
    })
    reset() // clear the fields for the next contact
  }

  async function onNext() {
    if (contacts.length < MIN_EMERGENCY_CONTACTS) {
      setListError("Add at least one emergency contact to continue.")
      return
    }
    setSaving(true)
    setListError(null)
    try {
      await authApi.saveEmergencyContacts({ registrationId: registrationId!, contacts })
      router.push(ROUTES.signupPassword)
    } catch (err) {
      setListError(getErrorMessage(err))
      setSaving(false)
    }
  }

  return (
    <FlowCard>
      <FlowHeader
        title="Emergency contact"
        onBack={() => router.back()}
        step={{ current: SIGNUP_STEPS.emergencyContact, total: SIGNUP_STEPS.total }}
      />

      <div className="flex flex-col items-center gap-4">
        <IconBadge icon={UserList} />
        <p className="text-center text-body">
          Emergency contacts let providers access your medical history in emergencies. Only add
          people you trust and can be reached easily
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Pressing Enter in any field also adds the contact */}
        <form onSubmit={handleSubmit(onAdd)} noValidate className="flex flex-col gap-4">
          <FieldGroup className="gap-4">
            <Field data-invalid={!!errors.name} className="gap-2">
              <FieldLabel htmlFor="ec-name" className="sr-only">Name</FieldLabel>
              <Input id="ec-name" autoComplete="off" placeholder="Name" aria-invalid={!!errors.name} {...register("name")} />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field data-invalid={!!errors.relationship} className="gap-2">
              <FieldLabel htmlFor="ec-relationship" className="sr-only">Relationship</FieldLabel>
              <NativeSelect id="ec-relationship" aria-invalid={!!errors.relationship} {...register("relationship")}>
                <NativeSelectOption value="">Relationship</NativeSelectOption>
                {RELATIONSHIPS.map((relationship) => (
                  <NativeSelectOption key={relationship} value={relationship}>
                    {relationship}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError errors={[errors.relationship]} />
            </Field>

            <Field data-invalid={!!errors.phone} className="gap-2">
              <FieldLabel htmlFor="ec-phone" className="sr-only">Phone number</FieldLabel>
              <Input
                id="ec-phone"
                type="tel"
                inputMode="numeric"
                maxLength={11}
                autoComplete="off"
                placeholder="Phone number"
                aria-invalid={!!errors.phone}
                {...register("phone")}
              />
              <FieldError errors={[errors.phone]} />
            </Field>

            <Field data-invalid={!!errors.email} className="gap-2">
              <FieldLabel htmlFor="ec-email" className="sr-only">Email (optional)</FieldLabel>
              <Input
                id="ec-email"
                type="email"
                autoComplete="off"
                placeholder="Email (optional)"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              <FieldError errors={[errors.email]} />
            </Field>
          </FieldGroup>

          <Button type="submit" variant="secondary">
            <Plus aria-hidden size={16} />
            Add to contact
          </Button>
        </form>

        {/* Figma: this box only exists once at least one contact is added */}
        {contacts.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1 rounded-md border border-line bg-field p-2 text-body">
            <span className="leading-relaxed text-ink-subtle">Contact:</span>
            <ul className="contents">
              {contacts.map((contact) => (
                <li
                  key={contact.phone}
                  title={`${contact.relationship} · ${contact.phone}`}
                  className="inline-flex items-center gap-1 rounded-md bg-chip py-1 pr-1 pl-2 text-caption"
                >
                  {contact.name}
                  <button
                    type="button"
                    onClick={() => removeContact(contact.phone)}
                    aria-label={`Remove ${contact.name}`}
                    // after:-inset-3 grows the click area (the visible X is only 10px)
                    className="relative grid size-4 place-items-center text-danger after:absolute after:-inset-3 after:content-[''] focus-visible:outline-2 focus-visible:outline-focus"
                  >
                    <X aria-hidden size={10} weight="bold" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {listError ? <p role="alert" className="text-body text-danger">{listError}</p> : null}

      <Button loading={saving} onClick={onNext}>
        Next
      </Button>
    </FlowCard>
  )
}