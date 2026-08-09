import { TraderSupport } from "@/components/dashboard/trader-support";

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
        <p className="text-muted-foreground mt-2">
          Contact our support team if you need assistance with your account, billing, or trades.
        </p>
      </div>

      <TraderSupport />
    </div>
  );
}
