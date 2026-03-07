import MyVishiDetailPage from '@/components/common/my-vishis/MyVishiDetailPage'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <MyVishiDetailPage id={Number(id)} />
}
