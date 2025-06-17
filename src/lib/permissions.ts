import { UserRole } from '@prisma/client'

// Define which roles can perform specific actions
export const APPROVAL_ROLES = [
  UserRole.CANDIDATE,
  UserRole.CAMPAIGN_MANAGER,
  UserRole.COMMUNICATIONS_DIRECTOR,
] as const

export const MANAGEMENT_ROLES = [
  UserRole.CANDIDATE,
  UserRole.CAMPAIGN_MANAGER,
] as const

export const ADMIN_ROLES = [
  UserRole.ADMIN,
] as const

export const ALL_ROLES = Object.values(UserRole)

// Type-safe permission check functions
export function canApproveMessages(role: UserRole): boolean {
  return (APPROVAL_ROLES as readonly UserRole[]).includes(role)
}

export function canManageTeam(role: UserRole): boolean {
  return (MANAGEMENT_ROLES as readonly UserRole[]).includes(role)
}

export function isAdmin(role: UserRole): boolean {
  return role === UserRole.ADMIN
}

export function canCreateMessages(role: UserRole): boolean {
  // All roles except USER can create messages
  return role !== UserRole.USER
}

export function canViewCampaign(role: UserRole): boolean {
  // All roles can view campaigns
  return true
}

// Role display names
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  [UserRole.USER]: 'User',
  [UserRole.CANDIDATE]: 'Candidate',
  [UserRole.CAMPAIGN_MANAGER]: 'Campaign Manager',
  [UserRole.COMMUNICATIONS_DIRECTOR]: 'Communications Director',
  [UserRole.FIELD_DIRECTOR]: 'Field Director',
  [UserRole.FINANCE_DIRECTOR]: 'Finance Director',
  [UserRole.VOLUNTEER]: 'Volunteer',
  [UserRole.ADMIN]: 'Administrator',
}

// Role colors for UI
export const ROLE_COLORS: Record<UserRole, string> = {
  [UserRole.USER]: 'gray',
  [UserRole.CANDIDATE]: 'purple',
  [UserRole.CAMPAIGN_MANAGER]: 'blue',
  [UserRole.COMMUNICATIONS_DIRECTOR]: 'green',
  [UserRole.FIELD_DIRECTOR]: 'yellow',
  [UserRole.FINANCE_DIRECTOR]: 'orange',
  [UserRole.VOLUNTEER]: 'cyan',
  [UserRole.ADMIN]: 'red',
}