import EditVishiPage from '@/components/admin/vishis/EditVishiPage'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <EditVishiPage id={Number(id)} />
}
