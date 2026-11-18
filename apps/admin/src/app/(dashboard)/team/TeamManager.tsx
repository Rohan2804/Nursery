"use client";

import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useToast } from "@/components/Toast";
import { Button, Card, Field, Toggle } from "@/components/ui";
import type { Role } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { inviteMember, updateMember } from "./actions";

type Member = { user_id: string; email: string; full_name: string; role: Role; active: boolean; created_at: string };

export function TeamManager({ members, selfId }: { members: Member[]; selfId: string }) {
  const [invite, setInvite] = useState({ email: "", name: "", role: "staff" });
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();

  const act = (p: Promise<{ ok: boolean; error?: string; message?: string }>, after?: () => void) =>
    start(async () => {
      const res = await p;
      if (!res.ok) return toast("error", res.error ?? "Failed");
      toast("success", res.message ?? "Done");
      after?.();
      router.refresh();
    });

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-ink/45">
              <th className="py-3 pl-4 font-semibold">Person</th>
              <th className="py-3 font-semibold">Role</th>
              <th className="py-3 pr-4 font-semibold">Access</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => {
              const self = m.user_id === selfId;
              return (
                <tr key={m.user_id} className={cn("border-b border-line/70 last:border-0", !m.active && "opacity-50")}>
                  <td className="py-3 pl-4">
                    <p className="font-semibold">
                      {m.full_name || m.email} {self && <span className="text-xs text-moss">(you)</span>}
                    </p>
                    <p className="text-xs text-ink/50">{m.email}</p>
                  </td>
                  <td className="py-3">
                    <select
                      className="input h-9 w-36"
                      value={m.role}
                      disabled={self || pending}
                      aria-label={`Role for ${m.email}`}
                      onChange={(e) => act(updateMember(m.user_id, { role: e.target.value }))}
                    >
                      <option value="staff">Staff</option>
                      <option value="manager">Manager</option>
                      <option value="owner">Owner</option>
                    </select>
                  </td>
                  <td className="py-3 pr-4">
                    <Toggle checked={m.active} disabled={self || pending} label={`Access for ${m.email}`} onChange={(v) => act(updateMember(m.user_id, { active: v }))} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Card title="Invite someone" description="They'll get an email to set their password.">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            act(inviteMember(invite), () => setInvite({ email: "", name: "", role: "staff" }));
          }}
        >
          <Field label="Full name">
            <input className="input" required value={invite.name} onChange={(e) => setInvite({ ...invite, name: e.target.value })} />
          </Field>
          <Field label="Email">
            <input className="input" type="email" required value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} />
          </Field>
          <Field label="Role">
            <select className="input" value={invite.role} onChange={(e) => setInvite({ ...invite, role: e.target.value })}>
              <option value="staff">Staff — stock only</option>
              <option value="manager">Manager — edit catalog</option>
              <option value="owner">Owner — everything</option>
            </select>
          </Field>
          <Button type="submit" loading={pending} className="w-full">
            <UserPlus className="size-4" /> Send invitation
          </Button>
        </form>
      </Card>
    </div>
  );
}
