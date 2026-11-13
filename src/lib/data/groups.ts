// TODO: replace with Convex groups data.

export type Community = {
  id: string;
  name: string;
  members: number;
  joined: boolean;
  tag: string;
};

export type GroupResult = {
  data: Community[];
  loading: boolean;
  error: string | null;
};

const groups: Community[] = [
  { id: "group-1", name: "Computer Science Club", members: 264, joined: true, tag: "Tech" },
  { id: "group-2", name: "Design & Media Society", members: 132, joined: false, tag: "Creative" },
  { id: "group-3", name: "WKU Debate Circle", members: 89, joined: true, tag: "Discussion" },
];

export function useGroups(): GroupResult {
  return { data: groups, loading: false, error: null };
}
