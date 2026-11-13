// TODO: replace with Convex profile data.

export type UserProfile = {
  id: string;
  name: string;
  department: string;
  year: "Y1" | "Y2" | "Y3" | "Y4" | "Y5";
  bio: string;
  skills: string[];
  showDepartment: boolean;
  showPhoneNumber: boolean;
};

export type ProfileResult = {
  data: UserProfile;
  loading: boolean;
  error: string | null;
};

const profile: UserProfile = {
  id: "profile-1",
  name: "Selam Bekele",
  department: "Computer Science",
  year: "Y3",
  bio: "Interested in product design, campus events, and helping students find useful opportunities.",
  skills: ["Design", "Research", "Python", "Campus events"],
  showDepartment: true,
  showPhoneNumber: false,
};

export function useProfile(): ProfileResult {
  return {
    data: profile,
    loading: false,
    error: null,
  };
}
