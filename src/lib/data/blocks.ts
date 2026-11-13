// TODO: replace with Convex block list data.

export type BlockedStudent = {
  id: string;
  name: string;
  department: string;
};

export type BlocksResult = {
  data: BlockedStudent[];
  loading: boolean;
  error: string | null;
};

const blocks: BlockedStudent[] = [
  { id: "block-1", name: "Hana Mamo", department: "Business" },
  { id: "block-2", name: "Samuel Bekele", department: "Biology" },
];

export function useBlocks(): BlocksResult {
  return { data: blocks, loading: false, error: null };
}
