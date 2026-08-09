'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type { ChallengePlan } from '@/types/api'
import { MarketingHeader } from '@/components/marketing/header'
import { MarketingFooter } from '@/components/marketing/footer'
import { ChallengesPreview } from '@/components/marketing/challenges-preview'
import { PurchaseDialog } from '@/components/challenges/purchase-dialog'

export default function ChallengesPage() {
  return (
    <Suspense fallback={<ChallengesPageSkeleton />}>
      <ChallengesPageInner />
    </Suspense>
  )
}

function ChallengesPageSkeleton() {
  return (
    <>
      <MarketingHeader />
      <main className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-10 w-48 bg-surface-muted rounded" />
          <div className="h-6 w-96 bg-surface-muted rounded" />
        </div>
      </main>
      <MarketingFooter />
    </>
  )
}

function ChallengesPageInner() {
  const params = useSearchParams()
  const preSelect = Number(params.get('plan') ?? 0) || null

  const [openPlan, setOpenPlan] = useState<ChallengePlan | null>(null)

  // Fetch the specific plan if a plan ID is in the URL
  useEffect(() => {
    if (preSelect) {
      api.challengePlans().then((res) => {
        if (res.ok) {
          const p = res.data.find((pl) => pl.id === preSelect)
          if (p) setOpenPlan(p)
        }
      })
    }
  }, [preSelect])

  // Stripe cancel return → inform the trader and clean the URL.
  useEffect(() => {
    if (params.get('stripe') === 'cancelled') {
      toast.info('Checkout cancelled — no payment was taken.')
      if (typeof window !== 'undefined') window.history.replaceState({}, '', '/challenges')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <MarketingHeader />
      <main className="pt-20">
        <ChallengesPreview onSelectPlan={(id) => {
          if (typeof window !== 'undefined') window.history.replaceState({}, '', `/challenges?plan=${id}`)
          api.challengePlans().then((res) => {
            if (res.ok) {
              const p = res.data.find((pl) => pl.id === id)
              if (p) setOpenPlan(p)
            }
          })
        }} />
      </main>
      <MarketingFooter />

      {openPlan && (
        <PurchaseDialog plan={openPlan} open={!!openPlan} onClose={() => {
          setOpenPlan(null)
          if (typeof window !== 'undefined') window.history.replaceState({}, '', '/challenges')
        }} />
      )}
    </>
  )
}
