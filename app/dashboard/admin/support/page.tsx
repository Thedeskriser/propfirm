import { AdminSupportTickets } from "@/components/admin/support-tickets";

export default function AdminSupportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Helpdesk & CRM</h1>
        <p className="text-muted-foreground mt-2">
          Manage user tickets and support requests.
        </p>
      </div>

      <AdminSupportTickets />
    </div>
  );
}
