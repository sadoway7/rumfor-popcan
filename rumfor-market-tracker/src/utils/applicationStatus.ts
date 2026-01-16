import { ApplicationStatus } from '@/types'
import { APPLICATION_STATUSES } from '@/config/constants'

// Assumptions/Invariants:
// - Status transitions are the single source of truth for all application updates.
// - Terminal states: approved, rejected, withdrawn (no transitions out).
// - Draft can only move to submitted.
// - Submitted can move to under-review, approved, rejected, withdrawn.
// - Under-review can move to approved, rejected, withdrawn.
// - Market availability statuses (open/accepting-applications/closed) are not valid application statuses here.

export const APPLICATION_STATUS_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  [APPLICATION_STATUSES.DRAFT]: [APPLICATION_STATUSES.SUBMITTED],
  [APPLICATION_STATUSES.SUBMITTED]: [
    APPLICATION_STATUSES.UNDER_REVIEW,
    APPLICATION_STATUSES.APPROVED,
    APPLICATION_STATUSES.REJECTED,
    APPLICATION_STATUSES.WITHDRAWN,
  ],
  [APPLICATION_STATUSES.UNDER_REVIEW]: [
    APPLICATION_STATUSES.APPROVED,
    APPLICATION_STATUSES.REJECTED,
    APPLICATION_STATUSES.WITHDRAWN,
  ],
  [APPLICATION_STATUSES.APPROVED]: [],
  [APPLICATION_STATUSES.REJECTED]: [],
  [APPLICATION_STATUSES.WITHDRAWN]: [],
  // NOTE: The following values exist in ApplicationStatus type but are market-level states.
  // They should never be used for Application.status and are treated as invalid here.
  open: [],
  'accepting-applications': [],
  closed: [],
}

export const isValidApplicationStatusTransition = (
  fromStatus: ApplicationStatus,
  toStatus: ApplicationStatus
): boolean => {
  if (fromStatus === toStatus) return true
  return APPLICATION_STATUS_TRANSITIONS[fromStatus]?.includes(toStatus) ?? false
}

export const assertValidApplicationStatusTransition = (
  fromStatus: ApplicationStatus,
  toStatus: ApplicationStatus
): void => {
  if (!isValidApplicationStatusTransition(fromStatus, toStatus)) {
    throw new Error(`Invalid application status transition: ${fromStatus} -> ${toStatus}`)
  }
}
