import { Role, type UserDraft, UserStatus } from "../../api/types"

const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export const EMPTY_DRAFT: UserDraft = {
  firstName: "",
  lastName: "",
  email: "",
  role: Role.Viewer,
  status: UserStatus.Invited,
}

export type ValidatedField = "firstName" | "lastName" | "email"
export type FieldErrors = Partial<Record<ValidatedField, string>>

export function validateUserDraft(draft: UserDraft): FieldErrors {
  const errors: FieldErrors = {}

  if (!draft.firstName.trim()) {
    errors.firstName = "First name is required"
  }
  if (!draft.lastName.trim()) {
    errors.lastName = "Last name is required"
  }
  if (!draft.email.trim()) {
    errors.email = "Email address is required"
  } else if (!EMAIL_PATTERN.test(draft.email.trim())) {
    errors.email = "Enter a valid email address"
  }

  return errors
}

export const normalizeUserDraft = (draft: UserDraft): UserDraft => ({
  ...draft,
  firstName: draft.firstName.trim(),
  lastName: draft.lastName.trim(),
  email: draft.email.trim(),
})
