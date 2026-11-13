// TODO: replace with Convex feed queries.

export type FeedPost = {
  id: string;
  author: string;
  time: string;
  content: string;
  likes: number;
  comments: number;
  liked: boolean;
  image?: string;
};

export type FeedResult = {
  data: FeedPost[];
  loading: boolean;
  error: string | null;
};

const feedData: FeedPost[] = [
  {
    id: "feed-1",
    author: "Selam Bekele",
    time: "12 min ago",
    content: "Anyone joining the campus cleanup this Saturday? I can bring gloves and water.",
    likes: 28,
    comments: 9,
    liked: true,
    image: "/images/post-1.jpg",
  },
  {
    id: "feed-2",
    author: "Abel Tadesse",
    time: "1 hr ago",
    content: "Does anyone have a good coffee spot near the engineering building? Need a place to study before finals.",
    likes: 16,
    comments: 4,
    liked: false,
  },
  {
    id: "feed-3",
    author: "Marta Tesfaye",
    time: "4 hrs ago",
    content: "Found a set of chemistry lab notes for the current semester. Message me if you want them.",
    likes: 42,
    comments: 11,
    liked: false,
  },
];

export function useFeed(): FeedResult {
  return {
    data: feedData,
    loading: false,
    error: null,
  };
}
