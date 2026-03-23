// components/admin/vishis/CreateVishiPage.tsx
'use client'

import { useState }       from 'react'
import { useRouter }      from 'next/navigation'
import { useCreateVishi } from '@/hooks/useVishis'
import { useUsers }       from '@/hooks/useUsers'
import { vishiService }   from '@/services/vishiService'
import { Button }         from '@/components/ui/button'
import { Input }          from '@/components/ui/input'
import { Label }          from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge }          from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Plus, X, Loader2, Users, AlertTriangle, ArrowRight } from 'lucide-react'
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
    ordering: 'username', is_active: true, page_size: 500,
  })
  const users = usersData?.results ?? []

  const [name,          setName]          = useState('')
  const [amount,        setAmount]        = useState('')
  const [frequency,     setFrequency]     = useState<VishiFrequency>('monthly')
  const [drawDay,       setDrawDay]       = useState('')
  const [collectionDay, setCollectionDay] = useState('')
  const [releaseDay,    setReleaseDay]    = useState('')
  const [startDate,     setStartDate]     = useState('')
  const [slots,         setSlots]         = useState<ParticipantSlot[]>([])
  const [selectedUser,  setSelectedUser]  = useState('')
  const [slotName,      setSlotName]      = useState('')
  const [isSubmitting,  setIsSubmitting]  = useState(false)

  const isPending = creatingVishi || isSubmitting

  const dayError: string | null = (() => {
    const d = Number(drawDay), c = Number(collectionDay), r = Number(releaseDay)
    if (!drawDay || !collectionDay || !releaseDay) return null
    if (d >= c) return 'Draw day must be before Collection day.'
    if (c >= r) return 'Collection day must be before Release day.'
    return null
  })()

  const addSlot = () => {
    const user = users.find((u) => String(u.id) === selectedUser)
    if (!user) return
    setSlots((prev) => [...prev, {
      user_id: user.id,
      display_name: user.username || user.mobile_number,
      vishi_name: slotName.trim(),
    }])
    setSelectedUser('')
    setSlotName('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !amount || !drawDay || !collectionDay || !releaseDay || !startDate) {
      toast.error('Please fill all required fields.')
      return
    }
    if (Number(amount) <= 0) { toast.error('Amount must be greater than 0.'); return }
    if (dayError) { toast.error(dayError); return }

    setIsSubmitting(true)
    try {
      const res = await createVishi({
        name: name.trim(), amount: amount.trim(), frequency,
        draw_day: Number(drawDay), collection_day: Number(collectionDay),
        release_day: Number(releaseDay), start_date: startDate,
      })
      const newVishiId = res.data.id
      let failCount = 0
      for (const slot of slots) {
        try {
          await vishiService.addParticipant(newVishiId, {
            user: slot.user_id, vishi_name: slot.vishi_name || undefined,
          })
        } catch { failCount++ }
      }
      if (failCount > 0) {
        toast.warning(`Vishi created but ${failCount} participant${failCount !== 1 ? 's' : ''} failed. Add manually.`)
      } else {
        toast.success(slots.length > 0
          ? `Vishi created with ${slots.length} participant${slots.length !== 1 ? 's' : ''}.`
          : 'Vishi created.')
      }
      router.push(`/admin/vishis/${newVishiId}`)
    } catch {
      // handled by interceptor
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AdminRoute>
      <div className="space-y-5">
        <PageHeader back title="Create Vishi" />

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Basic Details */}
          <Card className="rounded-2xl">
            <CardContent className="px-5 py-5 space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Basic Details</p>

              <div className="space-y-1.5">
                <Label>Vishi Name *</Label>
                <Input
                  placeholder="Family Vishi 2026"
                  value={name} onChange={(e) => setName(e.target.value)}
                  autoFocus className="rounded-xl h-10"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Amount (₹) *</Label>
                  <Input
                    type="number" inputMode="numeric" placeholder="5000" min="1"
                    value={amount} onChange={(e) => setAmount(e.target.value)}
                    className="rounded-xl h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Frequency *</Label>
                  <Select value={frequency} onValueChange={(v) => setFrequency(v as VishiFrequency)}>
                    <SelectTrigger className="rounded-xl h-10"><SelectValue /></SelectTrigger>
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
                  type="date" value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-xl h-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Day Settings */}
          <Card className="rounded-2xl">
            <CardContent className="px-5 py-5 space-y-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Day Settings</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Draw &lt; Collection &lt; Release. Monthly+: day of month (1–28). Weekly/Half-monthly: offset from start.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Draw *',       value: drawDay,       set: setDrawDay,       placeholder: '15' },
                  { label: 'Collection *', value: collectionDay, set: setCollectionDay, placeholder: '20' },
                  { label: 'Release *',    value: releaseDay,    set: setReleaseDay,    placeholder: '22' },
                ].map(({ label, value, set, placeholder }) => (
                  <div key={label} className="space-y-1.5">
                    <Label className="text-xs">{label}</Label>
                    <Input
                      type="number" inputMode="numeric" placeholder={placeholder} min={1} max={28}
                      value={value} onChange={(e) => set(e.target.value)}
                      className="rounded-xl h-10"
                    />
                  </div>
                ))}
              </div>

              {dayError && (
                <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/5 rounded-xl px-3 py-2.5">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  {dayError}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Participants */}
          <Card className="rounded-2xl">
            <CardContent className="px-5 py-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Participants</p>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {slots.length} slot{slots.length !== 1 ? 's' : ''}
                  {slots.length === 0 && ' · optional'}
                </span>
              </div>

              {/* Added slots */}
              {slots.length > 0 && (
                <div className="space-y-2">
                  {slots.map((slot, i) => (
                    <div key={i} className="flex items-center justify-between bg-muted/50 rounded-xl px-3 py-2.5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold truncate">{slot.display_name}</p>
                          {slots.filter((s) => s.user_id === slot.user_id).length > 1 && (
                            <Badge variant="outline" className="border-0 text-[10px] px-1.5 h-4 rounded-full bg-sky-100 text-sky-700 font-bold">
                              multi
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {slot.vishi_name ? `Alias: ${slot.vishi_name}` : 'No alias'}
                        </p>
                      </div>
                      <button type="button" onClick={() => setSlots((prev) => prev.filter((_, idx) => idx !== i))}
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add slot form */}
              <div className="rounded-xl border bg-muted/20 p-3 space-y-2.5">
                <p className="text-xs text-muted-foreground font-semibold">Add a slot</p>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger className="rounded-xl h-10">
                    <SelectValue placeholder={loadingUsers ? 'Loading users...' : 'Select user...'} />
                  </SelectTrigger>
                  <SelectContent>
                    {users.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-3">No active users found.</p>
                    ) : (
                      users.map((u) => (
                        <SelectItem key={u.id} value={String(u.id)}>
                          <span>{u.username || u.mobile_number}</span>
                          {u.username && <span className="text-xs text-muted-foreground ml-1">{u.mobile_number}</span>}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Slot alias e.g. Raj-Home (optional)"
                  value={slotName} onChange={(e) => setSlotName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSlot() } }}
                  className="rounded-xl h-10"
                />

                <Button type="button" variant="outline" size="sm" className="w-full rounded-xl"
                  onClick={addSlot} disabled={!selectedUser}>
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Slot
                </Button>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full h-12 rounded-2xl font-bold text-base gap-2"
            disabled={isPending || !!dayError}>
            {isPending
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <>
                  {slots.length > 0
                    ? `Create Vishi + ${slots.length} Participant${slots.length !== 1 ? 's' : ''}`
                    : 'Create Vishi'
                  }
                  <ArrowRight className="h-4 w-4" />
                </>
            }
          </Button>
        </form>
      </div>
    </AdminRoute>
  )
}
