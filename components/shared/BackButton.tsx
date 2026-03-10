// components/shared/BackButton.tsx
'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BackButtonProps {
  href?:      string   // if omitted → router.back()
  className?: string
}

export default function BackButton({ href, className }: BackButtonProps) {
  const router = useRouter()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => href ? router.push(href) : router.back()}
      className={cn('-ml-2 h-9 w-9 shrink-0', className)}
      aria-label="Go back"
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>
  )
}
