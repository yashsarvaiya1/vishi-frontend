import UserDetailPage from '@/components/admin/users/UserDetailPage'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <UserDetailPage id={Number(id)} />
}
