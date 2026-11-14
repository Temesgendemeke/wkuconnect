"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  Check,
  GraduationCap,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  User,
  X,
  BookOpen,
  AlertCircle,
  RefreshCw,
  Edit3,
} from "lucide-react";
import { useSharedAuthState } from "@/components/auth/provider";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Switch } from "@/components/ui/switch";

export const WKU_DEPARTMENTS = [
  "Computer Science",
  "Software Engineering",
  "Information Technology",
  "Electrical & Computer Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Medicine & Health Sciences",
  "Pharmacy",
  "Public Health",
  "Business & Economics",
  "Accounting & Finance",
  "Management",
  "Economics",
  "Law",
  "Social Sciences & Humanities",
  "Psychology",
  "Journalism & Communication",
  "Agriculture & Natural Resources",
  "Natural & Computational Sciences",
  "Biology",
  "Chemistry",
  "Physics",
  "Mathematics",
] as const;

export const ACADEMIC_YEARS = [
  "Y1",
  "Y2",
  "Y3",
  "Y4",
  "Y5",
  "Graduate",
  "Alumni",
] as const;

export const POPULAR_SKILLS = [
  "Python",
  "JavaScript",
  "React",
  "Next.js",
  "Mobile Dev",
  "UI/UX Design",
  "Data Analysis",
  "Machine Learning",
  "Graphic Design",
  "Video Editing",
  "Public Speaking",
  "Project Management",
  "Research",
  "Tutoring",
  "Content Writing",
  "Event Organizing",
] as const;

export default function ProfilePage() {
  const auth = useSharedAuthState();
  const updateMeMutation = useMutation(api.users.updateMe);

  // Live Convex user subscription
  const liveConvexUser = useQuery(
    api.users.getCurrentUser,
    auth.status === "authenticated" && auth.initData
      ? { initData: auth.initData }
      : "skip"
  );

  // Original saved state baseline (to calculate exact diff)
  const [initialLoaded, setInitialLoaded] = useState<boolean>(false);
  const [savedBaseline, setSavedBaseline] = useState({
    displayName: "Student User",
    avatarUrl: undefined as string | undefined,
    department: "Computer Science",
    customDepartment: "",
    isCustomDept: false,
    academicYear: "Y3",
    bio: "Interested in tech, campus events, and collaborating with fellow students.",
    skills: ["Design", "Research", "Python", "Campus events"] as string[],
    showDepartment: true,
    showPhone: false,
  });

  // Current working editable states
  const [displayName, setDisplayName] = useState<string>("Student User");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [department, setDepartment] = useState<string>("Computer Science");
  const [customDepartment, setCustomDepartment] = useState<string>("");
  const [isCustomDept, setIsCustomDept] = useState<boolean>(false);
  const [academicYear, setAcademicYear] = useState<string>("Y3");
  const [bio, setBio] = useState<string>(
    "Interested in tech, campus events, and collaborating with fellow students."
  );
  const [skills, setSkills] = useState<string[]>([
    "Design",
    "Research",
    "Python",
    "Campus events",
  ]);
  const [newSkillInput, setNewSkillInput] = useState<string>("");

  // Privacy toggles
  const [showDepartment, setShowDepartment] = useState<boolean>(true);
  const [showPhone, setShowPhone] = useState<boolean>(false);

  // Status feedback states
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>("");
  const [saveError, setSaveError] = useState<string | null>(null);

  // -------------------------------------------------------------
  // Data Initialization (Only runs on initial load / server sync)
  // -------------------------------------------------------------
  useEffect(() => {
    // 1. Check local storage cache first
    let loadedState = { ...savedBaseline };
    const savedLocal = localStorage.getItem("wku_user_profile");
    if (savedLocal) {
      try {
        const parsed = JSON.parse(savedLocal);
        if (parsed.displayName) loadedState.displayName = parsed.displayName;
        if (parsed.avatarUrl) loadedState.avatarUrl = parsed.avatarUrl;
        if (parsed.department) {
          if (WKU_DEPARTMENTS.includes(parsed.department)) {
            loadedState.department = parsed.department;
            loadedState.isCustomDept = false;
          } else {
            loadedState.department = "Other";
            loadedState.customDepartment = parsed.department;
            loadedState.isCustomDept = true;
          }
        }
        if (parsed.academicYear) loadedState.academicYear = parsed.academicYear;
        if (parsed.bio !== undefined) loadedState.bio = parsed.bio;
        if (Array.isArray(parsed.skills)) loadedState.skills = parsed.skills;
        if (parsed.showDepartment !== undefined) loadedState.showDepartment = parsed.showDepartment;
        if (parsed.showPhone !== undefined) loadedState.showPhone = parsed.showPhone;
      } catch (e) {
        console.error("Local profile read error", e);
      }
    }

    // 2. Override with live Convex user if available
    const sourceUser = liveConvexUser || (auth.status === "authenticated" ? auth.user : null);
    if (sourceUser) {
      if (sourceUser.displayName) loadedState.displayName = sourceUser.displayName;
      if (sourceUser.avatarUrl) loadedState.avatarUrl = sourceUser.avatarUrl;
      if (sourceUser.major) {
        if (WKU_DEPARTMENTS.includes(sourceUser.major as any)) {
          loadedState.department = sourceUser.major;
          loadedState.isCustomDept = false;
        } else {
          loadedState.department = "Other";
          loadedState.customDepartment = sourceUser.major;
          loadedState.isCustomDept = true;
        }
      }
      if (sourceUser.academicYear) loadedState.academicYear = sourceUser.academicYear;
      if (sourceUser.bio !== undefined && sourceUser.bio !== null) loadedState.bio = sourceUser.bio;
      if (sourceUser.skills && sourceUser.skills.length > 0) loadedState.skills = sourceUser.skills;
      if (sourceUser.showDepartment !== undefined) loadedState.showDepartment = sourceUser.showDepartment;
      if (sourceUser.showPhoneNumber !== undefined) loadedState.showPhone = sourceUser.showPhoneNumber;
    }

    // Apply only if not yet initialized by user
    if (!initialLoaded) {
      setSavedBaseline(loadedState);
      setDisplayName(loadedState.displayName);
      setAvatarUrl(loadedState.avatarUrl);
      setDepartment(loadedState.department);
      setCustomDepartment(loadedState.customDepartment);
      setIsCustomDept(loadedState.isCustomDept);
      setAcademicYear(loadedState.academicYear);
      setBio(loadedState.bio);
      setSkills(loadedState.skills);
      setShowDepartment(loadedState.showDepartment);
      setShowPhone(loadedState.showPhone);
      setInitialLoaded(true);
    }
  }, [liveConvexUser, auth, initialLoaded]);

  // -------------------------------------------------------------
  // Validation: Calculate if actual changes exist
  // -------------------------------------------------------------
  const effectiveDepartment = isCustomDept
    ? customDepartment || "Custom Dept"
    : department;

  const hasNameChanged = useMemo(() => {
    return displayName.trim() !== savedBaseline.displayName.trim();
  }, [displayName, savedBaseline.displayName]);

  const hasYearChanged = useMemo(() => {
    return academicYear !== savedBaseline.academicYear;
  }, [academicYear, savedBaseline.academicYear]);

  const hasDepartmentChanged = useMemo(() => {
    const curDept = isCustomDept ? customDepartment.trim() : department;
    const baseDept = savedBaseline.isCustomDept
      ? savedBaseline.customDepartment.trim()
      : savedBaseline.department;
    return curDept !== baseDept;
  }, [isCustomDept, customDepartment, department, savedBaseline]);

  const hasBioChanged = useMemo(() => {
    return bio.trim() !== savedBaseline.bio.trim();
  }, [bio, savedBaseline.bio]);

  const hasSkillsChanged = useMemo(() => {
    if (skills.length !== savedBaseline.skills.length) return true;
    return JSON.stringify([...skills].sort()) !== JSON.stringify([...savedBaseline.skills].sort());
  }, [skills, savedBaseline.skills]);

  const hasAvatarChanged = useMemo(() => {
    return avatarUrl !== savedBaseline.avatarUrl;
  }, [avatarUrl, savedBaseline.avatarUrl]);

  const hasPrivacyChanged = useMemo(() => {
    return (
      showDepartment !== savedBaseline.showDepartment ||
      showPhone !== savedBaseline.showPhone
    );
  }, [showDepartment, showPhone, savedBaseline]);

  // Check if anything has been modified
  const hasAnyChanges = useMemo(() => {
    return (
      hasNameChanged ||
      hasYearChanged ||
      hasDepartmentChanged ||
      hasBioChanged ||
      hasSkillsChanged ||
      hasAvatarChanged ||
      hasPrivacyChanged
    );
  }, [
    hasNameChanged,
    hasYearChanged,
    hasDepartmentChanged,
    hasBioChanged,
    hasSkillsChanged,
    hasAvatarChanged,
    hasPrivacyChanged,
  ]);

  // -------------------------------------------------------------
  // Dedicated Field Handlers
  // -------------------------------------------------------------
  const handleDisplayNameChange = useCallback((newName: string) => {
    setDisplayName(newName);
  }, []);

  const handleDepartmentChange = useCallback((selectedDept: string) => {
    if (selectedDept === "Other") {
      setIsCustomDept(true);
    } else {
      setIsCustomDept(false);
      setDepartment(selectedDept);
    }
  }, []);

  const handleCustomDepartmentChange = useCallback((customVal: string) => {
    setCustomDepartment(customVal);
  }, []);

  const handleYearChange = useCallback((year: string) => {
    setAcademicYear(year);
  }, []);

  const handleBioChange = useCallback((newBio: string) => {
    setBio(newBio);
  }, []);

  const handleAddSkill = useCallback((skillToAdd: string) => {
    const trimmed = skillToAdd.trim();
    if (!trimmed) return;
    setSkills((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    setNewSkillInput("");
  }, []);

  const handleRemoveSkill = useCallback((skillToRemove: string) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  }, []);

  const handleToggleShowDepartment = useCallback((nextVal: boolean) => {
    setShowDepartment(nextVal);
  }, []);

  const handleToggleShowPhone = useCallback((nextVal: boolean) => {
    setShowPhone(nextVal);
  }, []);

  const handleAvatarChange = useCallback(() => {
    const newUrl = window.prompt("Enter image URL for your profile photo:", avatarUrl || "");
    if (newUrl !== null) {
      setAvatarUrl(newUrl.trim() || undefined);
    }
  }, [avatarUrl]);

  const handleResetToTelegram = useCallback(() => {
    if (auth.status === "authenticated" && auth.user) {
      if (auth.user.displayName) setDisplayName(auth.user.displayName);
      if (auth.user.avatarUrl) setAvatarUrl(auth.user.avatarUrl);
    }
  }, [auth]);

  // -------------------------------------------------------------
  // Master Save Handler: Executes ONLY when changes are valid
  // -------------------------------------------------------------
  const handleSaveAll = async () => {
    // If neither name nor year nor anything changed, block execution
    if (!hasAnyChanges) {
      setSaveError("No changes detected. Edit your name, year, department, bio, or skills first.");
      setTimeout(() => setSaveError(null), 3500);
      return;
    }

    if (!displayName.trim()) {
      setSaveError("Name cannot be empty.");
      setTimeout(() => setSaveError(null), 3000);
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSavedSuccess(false);

    const activeDepartment = isCustomDept
      ? customDepartment.trim() || "Unspecified"
      : department;

    const payload = {
      displayName: displayName.trim(),
      avatarUrl,
      department: activeDepartment,
      academicYear,
      bio,
      skills,
      showDepartment,
      showPhone,
    };

    // 1. Immediately persist to localStorage
    try {
      localStorage.setItem("wku_user_profile", JSON.stringify(payload));
    } catch (e) {
      console.error("Local storage error", e);
    }

    // 2. Sync to Convex database
    try {
      if (auth.status === "authenticated" && auth.initData) {
        await updateMeMutation({
          initData: auth.initData,
          displayName: payload.displayName,
          avatarUrl: payload.avatarUrl,
          major: activeDepartment,
          academicYear,
          bio,
          skills,
          showDepartment,
          showPhoneNumber: showPhone,
        });
        setSaveMessage("Profile saved to database and synced across your campus circle!");
      } else {
        setSaveMessage("Changes saved locally! Connect via Telegram to sync live to campus database.");
      }

      // Update baseline so button is disabled until next real modification
      setSavedBaseline({
        displayName: payload.displayName,
        avatarUrl: payload.avatarUrl,
        department: isCustomDept ? "Other" : activeDepartment,
        customDepartment: isCustomDept ? activeDepartment : "",
        isCustomDept,
        academicYear,
        bio,
        skills: [...skills],
        showDepartment,
        showPhone,
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4500);
    } catch (err: unknown) {
      console.warn("Convex mutation notice:", err);
      // Saved locally fallback
      setSaveMessage("Changes saved locally on your device!");
      setSavedBaseline({
        displayName: payload.displayName,
        avatarUrl: payload.avatarUrl,
        department: isCustomDept ? "Other" : activeDepartment,
        customDepartment: isCustomDept ? activeDepartment : "",
        isCustomDept,
        academicYear,
        bio,
        skills: [...skills],
        showDepartment,
        showPhone,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4500);
    } finally {
      setIsSaving(false);
    }
  };

  const initials = displayName
    ? displayName
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <main className="layout-shell isolate relative min-h-screen w-full overflow-hidden bg-[#111310] text-white">
      {/* Background radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(ellipse_at_50%_-20%,rgba(174,222,62,0.12),transparent_68%)]"
      />

      <div className="mx-auto flex w-full max-w-lg flex-col gap-3 px-4 pb-24 pt-3 sm:gap-4 sm:px-6 sm:pt-5">
        {/* Navigation Bar */}
        <header className="relative z-10 flex items-center justify-between pb-2">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#191c18] px-3.5 py-1.5 text-xs font-semibold text-[#c4c8bd] transition-all hover:border-[#c6f15b]/40 hover:text-[#d9ff86]"
          >
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Home</span>
          </Link>

          <div className="flex items-center gap-2">
            {hasAnyChanges ? (
              <span className="rounded-full bg-[#c6f15b]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#c6f15b] animate-pulse">
                Modifications pending
              </span>
            ) : (
              <span className="rounded-full bg-white/[0.05] px-2.5 py-0.5 text-[10px] font-medium text-[#7a8174]">
                Up to date
              </span>
            )}
            {auth.status === "authenticated" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c6f15b]/30 bg-[#c6f15b]/10 px-3 py-1 text-[11px] font-semibold text-[#c6f15b]">
                <span className="size-1.5 rounded-full bg-[#c6f15b] animate-pulse" />
                Telegram Online
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-[#191c18] px-3 py-1 text-[11px] font-medium text-[#8f9589]">
                Preview Mode
              </span>
            )}
          </div>
        </header>

        {/* Profile Hero Card with Live Sync to Editable States */}
        <section className="relative overflow-hidden rounded-[25px] bg-[#c6f15b] p-5 text-[#17200e] shadow-[0_16px_40px_rgba(123,161,43,0.15)]">
          <div
            aria-hidden="true"
            className="absolute -bottom-10 -right-6 size-36 rounded-full bg-[#8dbb30]/25"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-6 right-8 size-20 rounded-full border border-[#263914]/15"
          />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Profile Avatar / Photo with click-to-update */}
              <div className="relative flex size-18 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#111510] font-display text-2xl font-black text-[#c6f15b] shadow-xl ring-4 ring-[#8dbb30]/30 sm:size-20">
                {avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="size-full object-cover"
                  />
                ) : (
                  <span>{initials}</span>
                )}
                <button
                  type="button"
                  onClick={handleAvatarChange}
                  title="Update profile photo"
                  className="absolute bottom-1 right-1 flex size-6 items-center justify-center rounded-full bg-[#c6f15b] text-[#111510] shadow-md transition-transform hover:scale-110 active:scale-95"
                >
                  <Camera className="size-3" strokeWidth={2.5} />
                </button>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="truncate font-display text-2xl font-bold tracking-tight text-[#17200e] sm:text-3xl">
                    {displayName || "Unnamed Student"}
                  </h1>
                  <ShieldCheck
                    className="size-5 shrink-0 text-[#204a11]"
                    strokeWidth={2.5}
                  />
                </div>
                {/* Real-time reactive preview: changes here as you select/type */}
                <p className="mt-0.5 text-xs font-semibold text-[#2f421a]">
                  {effectiveDepartment} • {academicYear}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="inline-block rounded-md bg-[#192211]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#1e2a12]">
                    WKU Campus
                  </span>
                  <span className="inline-block rounded-md bg-[#192211]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#1e2a12]">
                    Student
                  </span>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between border-t border-[#17200e]/10 pt-2 sm:border-0 sm:pt-0">
              <button
                type="button"
                onClick={handleResetToTelegram}
                title="Sync from Telegram profile"
                className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#35481c] hover:underline"
              >
                <RefreshCw className="size-3" />
                <span>Sync TG</span>
              </button>
              <span className="rounded-full bg-[#111510] px-3 py-1 text-xs font-bold text-[#c6f15b]">
                Active
              </span>
            </div>
          </div>
        </section>

        {/* Modular Fields Container */}
        <div className="flex flex-col gap-3">
          {/* FUNCTION: Edit Display Name */}
          <section className="rounded-[23px] border border-white/[0.06] bg-[#191c18] p-4 shadow-[0_12px_32px_rgba(0,0,0,0.2)] sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-[#c6f15b]/10 text-[#c6f15b]">
                  <User className="size-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Full Name</h2>
                  <p className="text-[11px] text-[#8e9587]">
                    Edit your name or alias shown to students
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {hasNameChanged && (
                  <span className="text-[10px] font-bold text-[#c6f15b]">Edited</span>
                )}
                <Edit3 className="size-3.5 text-[#8e9587]" />
              </div>
            </div>
            <input
              type="text"
              value={displayName}
              onChange={(e) => handleDisplayNameChange(e.target.value)}
              placeholder="Your full name..."
              className={`w-full rounded-[14px] border bg-[#0f110e] px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 ${
                hasNameChanged
                  ? "border-[#c6f15b] focus:ring-[#c6f15b]"
                  : "border-white/[0.08] focus:border-[#c6f15b] focus:ring-[#c6f15b]"
              }`}
            />
          </section>

          {/* FUNCTION: Department & Academics Selection */}
          <section className="rounded-[23px] border border-white/[0.06] bg-[#191c18] p-4 shadow-[0_12px_32px_rgba(0,0,0,0.2)] sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-[#c6f15b]/10 text-[#c6f15b]">
                  <GraduationCap className="size-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Department / Major</h2>
                  <p className="text-[11px] text-[#8e9587]">
                    Select or customize your field of study
                  </p>
                </div>
              </div>
              {hasDepartmentChanged && (
                <span className="text-[10px] font-bold text-[#c6f15b]">Edited</span>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#c4c8bd]">
                  Department
                </label>
                <select
                  value={isCustomDept ? "Other" : department}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  className={`w-full cursor-pointer rounded-[14px] border bg-[#0f110e] px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 ${
                    hasDepartmentChanged
                      ? "border-[#c6f15b] focus:ring-[#c6f15b]"
                      : "border-white/[0.08] focus:border-[#c6f15b] focus:ring-[#c6f15b]"
                  }`}
                >
                  {WKU_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept} className="bg-[#191c18] text-white">
                      {dept}
                    </option>
                  ))}
                  <option value="Other" className="bg-[#191c18] text-[#c6f15b] font-semibold">
                    + Other (Type custom)
                  </option>
                </select>

                {isCustomDept && (
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="Type custom department name..."
                      value={customDepartment}
                      onChange={(e) => handleCustomDepartmentChange(e.target.value)}
                      className="w-full rounded-[14px] border border-[#c6f15b]/40 bg-[#0f110e] px-3.5 py-2 text-xs text-white placeholder-[#687063] focus:border-[#c6f15b] focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* FUNCTION: Academic Year */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-xs font-medium text-[#c4c8bd]">
                    Academic Year
                  </label>
                  {hasYearChanged && (
                    <span className="text-[10px] font-bold text-[#c6f15b]">
                      Changed to {academicYear}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {ACADEMIC_YEARS.map((yr) => {
                    const isSelected = academicYear === yr;
                    return (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => handleYearChange(yr)}
                        className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                          isSelected
                            ? "bg-[#c6f15b] text-[#111310] shadow-[0_0_16px_rgba(198,241,91,0.25)] ring-2 ring-[#c6f15b]"
                            : "border border-white/[0.06] bg-[#0f110e] text-[#9da396] hover:border-white/[0.15] hover:text-white"
                        }`}
                      >
                        {yr}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* FUNCTION: Bio & About */}
          <section className="rounded-[23px] border border-white/[0.06] bg-[#191c18] p-4 shadow-[0_12px_32px_rgba(0,0,0,0.2)] sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-[#c6f15b]/10 text-[#c6f15b]">
                  <BookOpen className="size-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Student Bio</h2>
                  <p className="text-[11px] text-[#8e9587]">
                    Introduce yourself to your campus circle
                  </p>
                </div>
              </div>
              {hasBioChanged && (
                <span className="text-[10px] font-bold text-[#c6f15b]">Edited</span>
              )}
            </div>

            <div>
              <textarea
                value={bio}
                onChange={(e) => handleBioChange(e.target.value)}
                rows={3}
                placeholder="Share your academic interests, hobby projects, or what you are looking for..."
                className="w-full resize-none rounded-[16px] border border-white/[0.08] bg-[#0f110e] p-3 text-xs leading-relaxed text-white placeholder-[#687063] focus:border-[#c6f15b] focus:outline-none focus:ring-1 focus:ring-[#c6f15b]"
              />
              <p className="mt-1 text-right text-[10px] text-[#71776b]">
                {bio.length} characters
              </p>
            </div>
          </section>

          {/* FUNCTION: Interactive Skills Management */}
          <section className="rounded-[23px] border border-white/[0.06] bg-[#191c18] p-4 shadow-[0_12px_32px_rgba(0,0,0,0.2)] sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-[#c6f15b]/10 text-[#c6f15b]">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Skills & Tags</h2>
                  <p className="text-[11px] text-[#8e9587]">
                    Add anything you specialize in or want to learn
                  </p>
                </div>
              </div>
              {hasSkillsChanged && (
                <span className="text-[10px] font-bold text-[#c6f15b]">Edited</span>
              )}
            </div>

            {/* Active Skills Badges */}
            <div className="mb-4">
              <label className="mb-2 block text-xs font-medium text-[#c4c8bd]">
                Active Skills ({skills.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {skills.length === 0 ? (
                  <p className="text-xs italic text-[#72786b]">No skills added yet.</p>
                ) : (
                  skills.map((skill) => (
                    <span
                      key={skill}
                      className="group inline-flex items-center gap-1.5 rounded-full border border-[#c6f15b]/30 bg-[#252c1c] px-3 py-1.5 text-xs font-semibold text-[#d9ff86] transition-all hover:border-red-400/40 hover:bg-red-950/20"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="rounded-full text-[#9da396] hover:text-red-400"
                        title={`Remove ${skill}`}
                      >
                        <X className="size-3.5" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Custom Skill Input */}
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                placeholder="Type a new skill (e.g. Flutter, 3D Modeling)..."
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill(newSkillInput);
                  }
                }}
                className="flex-1 rounded-[14px] border border-white/[0.08] bg-[#0f110e] px-3.5 py-2 text-xs text-white placeholder-[#687063] focus:border-[#c6f15b] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleAddSkill(newSkillInput)}
                className="inline-flex items-center gap-1.5 rounded-[14px] bg-[#c6f15b] px-4 py-2 text-xs font-bold text-[#111310] transition-transform hover:scale-105 active:scale-95"
              >
                <Plus className="size-3.5" />
                Add
              </button>
            </div>

            {/* Popular quick add chips */}
            <div>
              <p className="mb-2 text-[11px] font-medium text-[#8e9587]">
                Quick suggestions:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SKILLS.filter((s) => !skills.includes(s)).map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleAddSkill(suggestion)}
                    className="inline-flex items-center gap-1 rounded-full border border-white/[0.06] bg-[#0f110e] px-2.5 py-1 text-[11px] font-medium text-[#b0b7a8] transition-colors hover:border-[#c6f15b]/40 hover:text-[#c6f15b]"
                  >
                    <Plus className="size-2.5" />
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* FUNCTION: Privacy Controls */}
          <section className="rounded-[23px] border border-white/[0.06] bg-[#191c18] p-4 shadow-[0_12px_32px_rgba(0,0,0,0.2)] sm:p-5">
            <h2 className="text-sm font-bold text-white mb-1">Privacy & Visibility</h2>
            <p className="text-[11px] text-[#8e9587] mb-3">
              Control what fellow campus members see on your public profile.
            </p>

            <div className="space-y-3 divide-y divide-white/[0.04]">
              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="text-xs font-semibold text-white">Show Department</p>
                  <p className="text-[11px] text-[#82887a]">
                    Display your college & department on student cards
                  </p>
                </div>
                <Switch
                  checked={showDepartment}
                  onChange={handleToggleShowDepartment}
                  label="Show department"
                />
              </div>

              <div className="flex items-center justify-between pt-3">
                <div>
                  <p className="text-xs font-semibold text-white">Show Phone Number</p>
                  <p className="text-[11px] text-[#82887a]">
                    Share verified contact with campus connections
                  </p>
                </div>
                <Switch
                  checked={showPhone}
                  onChange={handleToggleShowPhone}
                  label="Show phone number"
                />
              </div>
            </div>
          </section>

          {/* Status Message */}
          {savedSuccess && (
            <div className="flex items-center gap-2 rounded-2xl border border-[#c6f15b]/30 bg-[#c6f15b]/10 p-3 text-xs font-semibold text-[#c6f15b]">
              <Check className="size-4 shrink-0" />
              <span>{saveMessage || "Profile updated and saved successfully!"}</span>
            </div>
          )}

          {saveError && (
            <div className="flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-400">
              <AlertCircle className="size-4 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {/* Save Button (Disabled & Non-functional if nothing was modified) */}
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving || !hasAnyChanges}
            className={`group flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold transition-all ${
              !hasAnyChanges
                ? "cursor-not-allowed border border-white/[0.06] bg-[#1f221e] text-[#6c7265] opacity-60"
                : "bg-[#c6f15b] text-[#111310] shadow-[0_10px_28px_rgba(198,241,91,0.25)] hover:bg-[#d6ff73] hover:shadow-[0_12px_32px_rgba(198,241,91,0.35)] active:scale-[0.99]"
            }`}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-[#111310] border-t-transparent" />
                Saving Profile...
              </span>
            ) : !hasAnyChanges ? (
              <span>No Changes to Save</span>
            ) : (
              <>
                <Save className="size-4 transition-transform group-hover:scale-110" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
