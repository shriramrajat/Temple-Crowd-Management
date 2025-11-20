import { Metadata } from 'next'
import VolunteerManagement from '@/components/admin/volunteer-management'

export const metadata: Metadata = {
  title: 'Volunteer Management | Admin',
  description: 'Manage volunteers and staff assignments',
}

export default function VolunteersPage() {
  return <VolunteerManagement />
}
