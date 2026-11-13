import { Bookmark, MessageCircle, MessageSquareText, Share2, Star } from "lucide-react";

export type PostCardProps = {
  author: string;
  time: string;
  content: string;
  likes: number;
  comments: number;
  liked?: boolean;
  image?: string;
};

export function PostCard({
  author,
  time,
  content,
  likes,
  comments,
  liked,
  image,
}: PostCardProps) {
  return (
    <article className="rounded-[26px] border border-border bg-background p-3 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex size-11 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
          {author
            .split(" ")
            .map((part) => part[0])
            .slice(0, 2)
            .join("")}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{author}</p>
              <p className="text-xs text-muted-foreground">{time}</p>
            </div>
            <button type="button" aria-label="Save post" className="rounded-full p-1 text-muted-foreground hover:bg-muted">
              <Star aria-hidden="true" className="size-4" />
            </button>
          </div>
          <p className="mt-3 text-sm leading-6 text-foreground/90">{content}</p>
          {image ? <div className="mt-3 h-32 rounded-[20px] bg-gradient-to-br from-[#0B7A57] via-[#13986C] to-[#F29A24]" /> : null}
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <button type="button" className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 ${liked ? "bg-[#ffe5e1] text-[#FF5A4D]" : "bg-muted text-muted-foreground"}`}>
              <MessageCircle aria-hidden="true" className="size-4" />
              {likes}
            </button>
            <button type="button" className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-1 text-muted-foreground">
              <MessageSquareText aria-hidden="true" className="size-4" />
              {comments}
            </button>
            <button type="button" aria-label="Share post" className="ml-auto rounded-full bg-muted p-2 text-muted-foreground">
              <Share2 aria-hidden="true" className="size-4" />
            </button>
            <button type="button" aria-label="Bookmark post" className="rounded-full bg-muted p-2 text-muted-foreground">
              <Bookmark aria-hidden="true" className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
