import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import type { Database } from '../types/database.types'

type ComplianceIssue = Database['public']['Tables']['compliance_issues']['Row']

export function useComplianceIssues() {
  const [data, setData] = useState<ComplianceIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('compliance_issues')
        .select('*')
        .order('date_created', { ascending: false })

      if (error) {
        setError(error.message)
      } else {
        setData(data || [])
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  return { data, loading, error }
}
