// components/admin/vishis/CreateVishiPage.tsx
'use client'

import { useState }       from 'react'
import { useRouter }      from 'next/navigation'
import { useCreateVishi } from '@/hooks/useVishis'
import { useUsers }       from '@/hooks/useUsers'
// FIXED: participantService is deleted — import vishiService directly
import { vishiService }   from '@/services/vishiService'
import { Button }         from '@/components/ui/button'
import { Input }          from '@/components/ui/input'
import { Label }          from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge }          from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Plus, X, Loader2, Users, AlertTriangle } from 'lucide-react'
import { toast }      from 'sonner'
import AdminRoute     from '@/components/shared/AdminRoute'
import PageHeader     from '@/components/shared/PageHeader'
import type { VishiFrequency } from '@/models/vishi'

interface ParticipantSlot {
  user_id:      number
  display_name: string
  vishi_name:   string
}

export default function CreateVishiPage() {
  const router = useRouter()
  const { mutateAsync: createVishi, isPending: creatingVishi } = useCreateVishi()

  const { data: usersData, isLoading: loadingUsers } = useUsers({
    ordering:  'username',
    is_active: true,
    page_size: 500,
  })
  const users = usersData?.results ?? []

  const [name,          setName]          = useState('')
  const [amount,        setAmount]        = useState('')
  const [frequency,     setFrequency]     = useState<VishiFrequency>('monthly')
  const [drawDay,       setDrawDay]       = useState('')
  const [collectionDay, setCollectionDay] = useState('')
  const [releaseDay,    setReleaseDay]    = useState('')
  const [startDate,     setStartDate]     = useState('')

  const [slots,        setSlots]        = useState<ParticipantSlot[]>([])
  const [selectedUser, setSelectedUser] = useState('')
  const [slotName,     setSlotName]     = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const isPending = creatingVishi || isSubmitting

  // ── Day-order validation ──────────────────────────────────────────────────

  const dayError: string | null = (() => {
    const d = Number(drawDay)
    const c = Number(collectionDay)
    const r = Number(releaseDay)
    if (!drawDay || !collectionDay || !releaseDay) return null
    if (d >= c) return 'Draw day must be before Collection day.'
    if (c >= r) return 'Collection day must be before Release day.'
    return null
  })()

  // ── Slot management ───────────────────────────────────────────────────────

  const addSlot = () => {
    const user = users.find((u) => String(u.id) === selectedUser)
    if (!user) return
    setSlots((prev) => [
      ...prev,
      {
        user_id:      user.id,
        display_name: user.username || user.mobile_number,
        vishi_name:   slotName.trim(),
      },
    ])
    setSelectedUser('')
    setSlotName('')
  }

  const removeSlot = (index: number) =>
    setSlots((prev) => prev.filter((_, i) => i !== index))

  const slotCount = (userId: number) =>
    slots.filter((s) => s.user_id === userId).length

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !amount || !drawDay || !collectionDay || !releaseDay || !startDate) {
      toast.error('Please fill all required fields.')
      return
    }
    if (Number(amount) <= 0) {
      toast.error('Amount must be greater than 0.')
      return
    }
    if (dayError) {
      toast.error(dayError)
      return
    }

    setIsSubmitting(true)
    try {
      // 1. Create the vishi
      const res = await createVishi({
        name:           name.trim(),
        amount:         amount.trim(),
        frequency,
        draw_day:       Number(drawDay),
        collection_day: Number(collectionDay),
        release_day:    Number(releaseDay),
        start_date:     startDate,
      })
      const newVishiId = res.data.id

      // 2. Add participants sequentially via vishiService.addParticipant
      //    (participantService was deleted — all participant ops live in vishiService)
      let failCount = 0
      for (const slot of slots) {
        try {
          await vishiService.addParticipant(newVishiId, {
            user:       slot.user_id,
            vishi_name: slot.vishi_name || undefined,
          })
        } catch {
          failCount++
        }
      }

      if (failCount > 0) {
        toast.warning(
          `Vishi created but ${failCount} participant${failCount !== 1 ? 's' : ''} failed to add. Add them manually from the detail page.`
        )
      } else {
        toast.success(
          slots.length > 0
            ? `Vishi created with ${slots.length} participant${slots.length !== 1 ? 's' : ''}.`
            : 'Vishi created. Add participants from the detail page.'
        )
      }
      router.push(`/admin/vishis/${newVishiId}`)
    } catch {
      // createVishi failure handled by interceptor
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AdminRoute>
      <div className="space-y-5">
        <PageHeader back title="Create Vishi" />

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Basic details */}
          <Card className="rounded-xl">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm">Basic Details</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              <div className="space-y-1.5">
                <Label>Name *</Label>
                <Input
                  placeholder="Family Vishi 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Amount (₹) *</Label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="5000"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Frequency *</Label>
                  <Select
                    value={frequency}
                    onValueChange={(v) => setFrequency(v as VishiFrequency)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="half_monthly">Half Monthly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="halfyear">Half Yearly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Day settings */}
          <Card className="rounded-xl">
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-sm">Day Settings</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Draw &lt; Collection &lt; Release. Monthly/Half-yearly/Yearly: day-of-month (1–28).
                Weekly/Half-monthly: offset from cycle start.
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Draw *</Label>
                  <Input
                    type="number" inputMode="numeric"
                    placeholder="15" min={1} max={28}
                    value={drawDay}
                    onChange={(e) => setDrawDay(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Collect *</Label>
                  <Input
                    type="number" inputMode="numeric"
                    placeholder="20" min={1} max={28}
                    value={collectionDay}
                    onChange={(e) => setCollectionDay(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Release *</Label>
                  <Input
                    type="number" inputMode="numeric"
                    placeholder="22" min={1} max={28}
                    value={releaseDay}
                    onChange={(e) => setReleaseDay(e.target.value)}
                  />
                </div>
              </div>
              {dayError && (
                <div className="flex items-center gap-2 text-xs text-destructive">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  {dayError}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Participants */}
          <Card className="rounded-xl">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Participants</CardTitle>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {slots.length} slot{slots.length !== 1 ? 's' : ''}
                  {slots.length === 0 && ' · add after creation too'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              {slots.length > 0 && (
                <div className="space-y-1.5">
                  {slots.map((slot, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-muted rounded-lg px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{slot.display_name}</p>
                          {slotCount(slot.user_id) > 1 && (
                            <Badge
                              variant="outline"
                              className="text-xs px-1.5 py-0 h-4 text-blue-600 bg-blue-50 border-blue-200"
                            >
                              multi
                            </Badge>
                          )}
                        </div>
                        {slot.vishi_name
                          ? <p className="text-xs text-muted-foreground">Alias: {slot.vishi_name}</p>
                          : <p className="text-xs text-muted-foreground/50 italic">No alias</p>
                        }
                      </div>
                      <Button
                        type="button" variant="ghost" size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => removeSlot(i)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-lg border p-3 space-y-2.5 bg-muted/30">
                <p className="text-xs text-muted-foreground font-medium">Add a slot</p>

                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingUsers ? 'Loading users...' : 'Select user...'} />
                  </SelectTrigger>
                  <SelectContent>
                    {users.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-3">
                        No active users found.
                      </p>
                    ) : (
                      users.map((u) => (
                        <SelectItem key={u.id} value={String(u.id)}>
                          <div className="flex flex-col">
                            <span>{u.username || u.mobile_number}</span>
                            {u.username && (
                              <span className="text-xs text-muted-foreground">{u.mobile_number}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                <div className="space-y-1">
                  <Input
                    placeholder="Slot alias e.g. Raj-Home, Raj-Shop (optional)"
                    value={slotName}
                    onChange={(e) => setSlotName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSlot() } }}
                  />
                  <p className="text-xs text-muted-foreground pl-1">
                    Same user can hold multiple slots with different aliases.
                  </p>
                </div>

                <Button
                  type="button" variant="outline" size="sm"
                  className="w-full"
                  onClick={addSlot}
                  disabled={!selectedUser}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Slot
                </Button>
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isPending || !!dayError}
          >
            {isPending
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : slots.length > 0
                ? `Create Vishi + ${slots.length} Participant${slots.length !== 1 ? 's' : ''}`
                : 'Create Vishi'
            }
          </Button>
        </form>
      </div>
    </AdminRoute>
  )
}
