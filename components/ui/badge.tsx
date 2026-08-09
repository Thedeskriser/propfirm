'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'

const badge = cva(
  'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium tabular',
  {
    variants: {
      tone: {
        success: 'bg-success-muted text-success border-success/30',
        danger:  'bg-danger-muted  text-danger  border-danger/30',
        warn:    'bg-warn-muted    text-warn    border-warn/30',
        info:    'bg-info-muted    text-info    border-info/30',
        accent:  'bg-accent-muted  text-accent  border-accent/30',
        neutral: 'bg-surface-muted text-text-muted border-border',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
)

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badge> {
  pulsing?: boolean
}

const PULSE_TONES: Record<NonNullable<BadgeProps['tone']>, string> = {
  success: 'bg-success',
  danger:  'bg-danger',
  warn:    'bg-warn',
  info:    'bg-info',
  accent:  'bg-accent',
  neutral: 'bg-text-muted',
}

export function Badge({ className, tone, pulsing, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badge({ tone }), className)} {...props}>
      {pulsing && (
        <span className="relative flex h-1.5 w-1.5 shrink-0 mr-0.5">
          <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", PULSE_TONES[tone || 'neutral'])}></span>
          <span className={cn("relative inline-flex rounded-full h-1.5 w-1.5", PULSE_TONES[tone || 'neutral'])}></span>
        </span>
      )}
      {children}
    </span>
  )
}
