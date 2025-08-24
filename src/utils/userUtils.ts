import { supabase } from '../supabaseClient'
import { auth } from '../firebaseConfig'

export type UserRole = 'dataTeam' | 'teamLead' | 'dataTeamLead'

export interface User {
  firebase_uid: string
  email: string | null
  name: string | null
  role: UserRole
  created_at: string
  last_login_at: string | null
  email_verified: boolean | null
  provider: string | null
}

/**
 * Get the current user's role from Supabase
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  try {
    const currentUser = auth.currentUser
    if (!currentUser?.email) {
      console.log('No current user or email')
      return null
    }

    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('email', currentUser.email)
      .single()

    if (error) {
      console.error('Error fetching user role from Supabase:', error)
      return null
    }

    return data?.role as UserRole || null
  } catch (error) {
    console.error('Error in getCurrentUserRole:', error)
    return null
  }
}

/**
 * Get the current user's full profile from Supabase
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const currentUser = auth.currentUser
    if (!currentUser?.email) {
      console.log('No current user or email')
      return null
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', currentUser.email)
      .single()

    if (error) {
      console.error('Error fetching user from Supabase:', error)
      return null
    }

    return data as User || null
  } catch (error) {
    console.error('Error in getCurrentUser:', error)
    return null
  }
}

/**
 * Update the current user's last login time
 */
export async function updateLastLogin(): Promise<void> {
  try {
    const currentUser = auth.currentUser
    if (!currentUser?.email) {
      return
    }

    const { error } = await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('email', currentUser.email)

    if (error) {
      console.error('Error updating last login:', error)
    }
  } catch (error) {
    console.error('Error in updateLastLogin:', error)
  }
}

/**
 * Check if the current user has a specific role
 */
export async function hasRole(requiredRole: UserRole): Promise<boolean> {
  const userRole = await getCurrentUserRole()
  return userRole === requiredRole
}

/**
 * Check if the current user has any of the specified roles
 */
export async function hasAnyRole(requiredRoles: UserRole[]): Promise<boolean> {
  const userRole = await getCurrentUserRole()
  return userRole ? requiredRoles.includes(userRole) : false
}

/**
 * Create or update a user in Supabase
 */
export async function upsertUser(userData: Partial<User>): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert(userData, { onConflict: 'firebase_uid' })
      .select()
      .single()

    if (error) {
      console.error('Error upserting user:', error)
      return null
    }

    return data as User
  } catch (error) {
    console.error('Error in upsertUser:', error)
    return null
  }
}
