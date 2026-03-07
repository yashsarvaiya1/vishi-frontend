import VishiDetailAdminPage from '@/components/admin/vishis/VishiDetailAdminPage'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <VishiDetailAdminPage id={Number(id)} />
}
