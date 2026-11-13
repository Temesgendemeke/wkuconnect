"use client";

import { Camera, Save, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Switch } from "@/components/ui/switch";
import { useProfile } from "@/lib/data/profile";

export default function ProfilePage() {
  const { data } = useProfile();
  const [showDepartment, setShowDepartment] = useState(data.showDepartment);
  const [showPhone, setShowPhone] = useState(data.showPhoneNumber);

  return (
    <main className="layout-shell mx-auto flex w-full max-w-md flex-col gap-4 px-4 pb-8 pt-5">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Account</p>
          <h1 className="text-3xl">Profile</h1>
        </div>
        <ThemeToggle />
      </header>

      <section className="overflow-hidden rounded-[30px] border border-border bg-card shadow-sm">
        <div className="h-28 bg-brand" />
        <div className="relative px-4 pb-4 pt-0">
          <div className="relative -mt-10 flex items-end justify-between">
            <div className="flex size-20 items-center justify-center rounded-full border-[4px] border-card bg-gradient-to-br from-[#0B7A57] to-[#13986C] text-xl font-bold text-white">
              S
            </div>
            <button type="button" aria-label="Change profile photo" className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm">
              <Camera aria-hidden="true" className="size-4" />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <h2 className="text-2xl font-semibold">{data.name}</h2>
            <ShieldCheck aria-hidden="true" className="size-4 text-primary" />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-[28px] border border-border bg-card p-4 shadow-sm">
        <div className="grid gap-3">
          <label className="text-sm font-medium text-muted-foreground">Department</label>
          <select defaultValue={data.department} className="rounded-2xl border border-border bg-background px-3 py-3 text-sm text-foreground">
            <option>Computer Science</option>
            <option>Biology</option>
            <option>Business</option>
            <option>Psychology</option>
          </select>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">Academic year</p>
          <div className="flex flex-wrap gap-2">
            {['Y1', 'Y2', 'Y3', 'Y4', 'Y5'].map((year) => (
              <button
                key={year}
                type="button"
                className={`rounded-full px-3 py-2 text-sm ${year === data.year ? "bg-brand text-white" : "border border-border bg-background text-muted-foreground"}`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-muted-foreground">Bio</label>
          <textarea defaultValue={data.bio} rows={4} className="rounded-[20px] border border-border bg-background px-3 py-3 text-sm text-foreground" />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-muted-foreground">Skills</label>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill) => (
              <span key={skill} className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">{skill}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="font-semibold">Privacy</p>
            <p className="text-xs text-muted-foreground">Control what other students can see.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium">Show department</p>
            </div>
            <Switch checked={showDepartment} onChange={setShowDepartment} label="Show department" />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium">Show phone number</p>
              <p className="text-xs text-muted-foreground">Never shared by default</p>
            </div>
            <Switch checked={showPhone} onChange={setShowPhone} label="Show phone number" />
          </div>
        </div>
      </section>

      <button type="button" className="mt-2 flex items-center justify-center gap-2 rounded-full bg-brand px-4 py-3 text-base font-medium text-white shadow-glow">
        <Save aria-hidden="true" className="size-4" />
        Save changes
      </button>
    </main>
  );
}
