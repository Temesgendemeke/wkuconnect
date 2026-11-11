"use client";

import {
  Component,
  useMemo,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { useMutation, useQuery } from "convex/react";
import {
  Check,
  CircleAlert,
  Clock3,
  Search,
  UserRoundCheck,
  UsersRound,
  UserPlus,
  X,
} from "lucide-react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { PublicUser } from "../../../convex/users";
import { useAuthedSession } from "@/components/auth/provider";
import { UserAvatar } from "@/components/chat/user-avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

type RequestProfile = {
  requestId: Id<"connections">;
  createdAt?: number;
  user: PublicUser;
};

type ConnectedProfile = {
  connectionId: Id<"connections">;
  updatedAt: number;
  user: PublicUser;
};

type Relationship = "none" | "pending" | "incoming" | "connected";

type SendConnectionResult =
  | { status: "request_sent"; requestId: Id<"connections"> }
  | { status: "request_already_sent"; requestId: Id<"connections"> }
  | { status: "incoming_request_exists"; requestId: Id<"connections"> }
  | { status: "already_connected"; connectionId: Id<"connections"> };

type Feedback = {
  kind: "success" | "error";
  message: string;
};

class ConnectionsErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Connections page failed to load", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <main className="min-h-dvh bg-[#171614] px-5 pb-32 pt-8 text-[#eee5d7]">
          <div className="mx-auto max-w-3xl">
            <Alert variant="destructive">
              <CircleAlert aria-hidden="true" />
              <AlertTitle>Connections could not be loaded</AlertTitle>
              <AlertDescription>
                Please try again. If the problem continues, reopen the page.
              </AlertDescription>
            </Alert>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => this.setState({ error: null })}
            >
              Try again
            </Button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

export function ConnectionsPage() {
  return (
    <ConnectionsErrorBoundary>
      <ConnectionsContent />
    </ConnectionsErrorBoundary>
  );
}

function ConnectionsContent() {
  const { initData, user: me } = useAuthedSession();
  const [search, setSearch] = useState("");
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [relationshipOverrides, setRelationshipOverrides] = useState<
    Record<string, Relationship>
  >({});
  const [incomingOverrides, setIncomingOverrides] = useState<
    Record<string, RequestProfile>
  >({});
  const [resolvedIncoming, setResolvedIncoming] = useState<
    Record<string, true>
  >({});

  const students = useQuery(api.connections.listStudents, {
    initData,
    limit: 100,
  }) as PublicUser[] | undefined;
  const incoming = useQuery(api.connections.listIncomingRequests, {
    initData,
  }) as RequestProfile[] | undefined;
  const outgoing = useQuery(api.connections.listOutgoingRequests, {
    initData,
  }) as RequestProfile[] | undefined;
  const connected = useQuery(api.connections.listConnectedStudents, {
    initData,
  }) as ConnectedProfile[] | undefined;

  const sendRequest = useMutation(api.connections.sendConnectionRequest);
  const acceptRequest = useMutation(api.connections.acceptConnectionRequest);
  const rejectRequest = useMutation(api.connections.rejectConnectionRequest);

  const relationshipsLoaded =
    incoming !== undefined && outgoing !== undefined && connected !== undefined;
  const filteredStudents = useMemo(() => {
    const searchTerm = search.trim().toLocaleLowerCase();
    return (students ?? []).filter((student) => {
      if (student._id === me._id) return false;
      if (!searchTerm) return true;
      return (
        student.displayName.toLocaleLowerCase().includes(searchTerm) ||
        (student.major ?? "").toLocaleLowerCase().includes(searchTerm)
      );
    });
  }, [me._id, search, students]);

  const incomingRows = useMemo(() => {
    const requests = new Map(
      (incoming ?? []).map((request) => [request.requestId, request]),
    );
    for (const request of Object.values(incomingOverrides)) {
      requests.set(request.requestId, request);
    }
    return [...requests.values()].filter(
      (request) => !resolvedIncoming[request.requestId],
    );
  }, [incoming, incomingOverrides, resolvedIncoming]);
  const incomingByUser = useMemo(
    () => new Map(incomingRows.map((request) => [request.user._id, request])),
    [incomingRows],
  );
  const outgoingByUser = useMemo(
    () => new Map((outgoing ?? []).map((request) => [request.user._id, request])),
    [outgoing],
  );
  const connectedByUser = useMemo(
    () => new Map((connected ?? []).map((connection) => [connection.user._id, connection])),
    [connected],
  );

  function getRelationship(userId: string): Relationship {
    if (connectedByUser.has(userId) || relationshipOverrides[userId] === "connected") {
      return "connected";
    }
    if (incomingByUser.has(userId)) return "incoming";
    if (outgoingByUser.has(userId)) return "pending";
    return relationshipOverrides[userId] ?? "none";
  }

  async function sendConnection(user: PublicUser) {
    if (busyAction) return;
    setBusyAction(`send:${user._id}`);
    setFeedback(null);
    try {
      const result = (await sendRequest({
        initData,
        recipientId: user._id as Id<"users">,
      })) as SendConnectionResult;
      switch (result.status) {
        case "request_sent":
          setFeedback({
            kind: "success",
            message: `Connection request sent to ${user.displayName}.`,
          });
          break;
        case "request_already_sent":
          setFeedback({
            kind: "success",
            message: `Your request to ${user.displayName} is already pending.`,
          });
          break;
        case "incoming_request_exists":
          setIncomingOverrides((current) => ({
            ...current,
            [user._id]: {
              requestId: result.requestId,
              user,
            },
          }));
          setFeedback({
            kind: "success",
            message: `${user.displayName} has already sent you a request. Review it in Incoming requests.`,
          });
          break;
        case "already_connected":
          setRelationshipOverrides((current) => ({
            ...current,
            [user._id]: "connected",
          }));
          setFeedback({
            kind: "success",
            message: `You are already connected with ${user.displayName}.`,
          });
          break;
        default:
          throw new Error("Received an unexpected connection response.");
      }
    } catch (error) {
      setFeedback({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "Could not send the connection request. Please try again.",
      });
    } finally {
      setBusyAction(null);
    }
  }

  async function respondToRequest(
    request: RequestProfile,
    action: "accept" | "reject",
  ) {
    if (busyAction) return;
    setBusyAction(`${action}:${request.requestId}`);
    setFeedback(null);
    try {
      if (action === "accept") {
        await acceptRequest({ initData, requestId: request.requestId });
        setRelationshipOverrides((current) => ({
          ...current,
          [request.user._id]: "connected",
        }));
        setFeedback({
          kind: "success",
          message: `You are now connected with ${request.user.displayName}.`,
        });
      } else {
        await rejectRequest({ initData, requestId: request.requestId });
        setFeedback({
          kind: "success",
          message: `Request from ${request.user.displayName} was declined.`,
        });
      }
      setResolvedIncoming((current) => ({
        ...current,
        [request.requestId]: true,
      }));
    } catch (error) {
      setFeedback({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : `Could not ${action} this request. Please try again.`,
      });
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <main className="min-h-dvh bg-[radial-gradient(ellipse_at_50%_-20%,#3a2d1b_0%,#171614_45%,#11100f_100%)] px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-8 text-[#eee5d7] sm:px-8 sm:pt-12">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 sm:gap-10">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#c5a15e]">
            Your campus, closer
          </p>
          <h1 className="font-serif text-4xl tracking-tight text-[#f3eadc] sm:text-5xl">
            Connections
          </h1>
          <p className="max-w-xl text-sm leading-6 text-[#afa697] sm:text-base">
            Discover and connect with Wolkite University students.
          </p>
        </header>

        {feedback ? (
          <Alert
            variant={feedback.kind === "error" ? "destructive" : "default"}
            className={
              feedback.kind === "success"
                ? "border-[#665333] bg-[#211e19] text-[#e2d2b2]"
                : ""
            }
          >
            {feedback.kind === "success" ? (
              <Check aria-hidden="true" />
            ) : (
              <CircleAlert aria-hidden="true" />
            )}
            <AlertTitle>
              {feedback.kind === "success" ? "All set" : "Something went wrong"}
            </AlertTitle>
            <AlertDescription>{feedback.message}</AlertDescription>
          </Alert>
        ) : null}

        <section aria-labelledby="discover-heading" className="space-y-4">
          <SectionHeading
            id="discover-heading"
            icon={<UsersRound aria-hidden="true" />}
            eyebrow="Find your people"
            title="Discover students"
            description="Browse student profiles and send a connection request."
          />
          <label className="relative block">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#a99f90]"
            />
            <Input
              type="search"
              aria-label="Search students by name or major"
              placeholder="Search by name or major"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-11 rounded-xl border-[#4b3b27] bg-[#1a1916]/90 pl-10 text-[#eee5d7] placeholder:text-[#81796d]"
            />
          </label>

          {students === undefined ? (
            <StudentSkeletonGrid />
          ) : filteredStudents.length === 0 ? (
            <EmptyState
              icon={<UsersRound aria-hidden="true" />}
              title={search.trim() ? "No students found" : "No students to show"}
              description={
                search.trim()
                  ? "Try another name or major."
                  : "There are no other student profiles available yet."
              }
            />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {filteredStudents.map((student) => (
                <li key={student._id}>
                  <StudentCard
                    user={student}
                    relationship={
                      relationshipsLoaded
                        ? getRelationship(student._id)
                        : "loading"
                    }
                    busyAction={busyAction}
                    onConnect={() => void sendConnection(student)}
                    onAccept={() => {
                      const request = incomingByUser.get(student._id);
                      if (request) void respondToRequest(request, "accept");
                    }}
                    onReject={() => {
                      const request = incomingByUser.get(student._id);
                      if (request) void respondToRequest(request, "reject");
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="incoming-heading" className="space-y-4">
          <SectionHeading
            id="incoming-heading"
            icon={<UserPlus aria-hidden="true" />}
            eyebrow="Your inbox"
            title="Incoming requests"
          />
          {incoming === undefined ? (
            <CompactSkeletonList />
          ) : incomingRows.length === 0 ? (
            <EmptyState
              icon={<UserPlus aria-hidden="true" />}
              title="No incoming requests"
              description="New requests from other students will appear here."
              compact
            />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {incomingRows.map((request) => (
                <li key={request.requestId}>
                  <StudentCard
                    user={request.user}
                    relationship="incoming"
                    busyAction={busyAction}
                    onConnect={() => undefined}
                    onAccept={() => void respondToRequest(request, "accept")}
                    onReject={() => void respondToRequest(request, "reject")}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="sent-heading" className="space-y-4">
          <SectionHeading
            id="sent-heading"
            icon={<Clock3 aria-hidden="true" />}
            eyebrow="Awaiting a reply"
            title="Sent requests"
          />
          {outgoing === undefined ? (
            <CompactSkeletonList />
          ) : outgoing.length === 0 ? (
            <EmptyState
              icon={<Clock3 aria-hidden="true" />}
              title="No sent requests"
              description="Connection requests you send will be listed here."
              compact
            />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {outgoing.map((request) => (
                <li key={request.requestId}>
                  <StudentCard
                    user={request.user}
                    relationship="pending"
                    busyAction={busyAction}
                    onConnect={() => undefined}
                    onAccept={() => undefined}
                    onReject={() => undefined}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="connected-heading" className="space-y-4">
          <SectionHeading
            id="connected-heading"
            icon={<UserRoundCheck aria-hidden="true" />}
            eyebrow="Your community"
            title="My connections"
          />
          {connected === undefined ? (
            <CompactSkeletonList />
          ) : connected.length === 0 ? (
            <EmptyState
              icon={<UserRoundCheck aria-hidden="true" />}
              title="No connections yet"
              description="When a student accepts your request, they will appear here."
              compact
            />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {connected.map((connection) => (
                <li key={connection.connectionId}>
                  <StudentCard
                    user={connection.user}
                    relationship="connected"
                    busyAction={busyAction}
                    onConnect={() => undefined}
                    onAccept={() => undefined}
                    onReject={() => undefined}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

function SectionHeading({
  id,
  icon,
  eyebrow,
  title,
  description,
}: {
  id: string;
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#735b34]/60 bg-[#342a1c] text-[#d3ad66]">
        {icon}
      </span>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a88b58]">
          {eyebrow}
        </p>
        <h2
          id={id}
          className="mt-0.5 font-serif text-2xl text-[#eee5d7] sm:text-3xl"
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm leading-5 text-[#a99f90]">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

function StudentCard({
  user,
  relationship,
  busyAction,
  onConnect,
  onAccept,
  onReject,
}: {
  user: PublicUser;
  relationship: Relationship | "loading";
  busyAction: string | null;
  onConnect: () => void;
  onAccept: () => void;
  onReject: () => void;
}) {
  const isBusy = busyAction !== null;

  return (
    <article className="flex min-h-36 flex-col justify-between gap-4 rounded-2xl border border-[#453a2a] bg-gradient-to-br from-[#211e19] to-[#191816] p-4 shadow-[0_14px_38px_rgba(0,0,0,0.18)] transition-colors hover:border-[#665333] sm:p-5">
      <div className="flex min-w-0 items-start gap-3">
        <UserAvatar
          name={user.displayName}
          avatarUrl={user.avatarUrl}
          size="lg"
          className="border border-[#8c6b37]/60"
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-medium text-[#eee5d7]">
            {user.displayName}
          </h3>
          <p className="mt-0.5 truncate text-sm text-[#b3a995]">
            {user.major || "WKU student"}
          </p>
          {user.skills.length > 0 ? (
            <ul
              aria-label={`${user.displayName}'s skills`}
              className="mt-2 flex flex-wrap gap-1.5"
            >
              {user.skills.map((skill) => (
                <li
                  key={skill}
                  className="rounded-full border border-[#51432f] bg-[#29241b] px-2 py-0.5 text-[11px] text-[#c9b991]"
                >
                  {skill}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
      <RelationshipActions
        user={user}
        relationship={relationship}
        busy={isBusy}
        onConnect={onConnect}
        onAccept={onAccept}
        onReject={onReject}
        sending={busyAction === `send:${user._id}`}
      />
    </article>
  );
}

function RelationshipActions({
  user,
  relationship,
  busy,
  onConnect,
  onAccept,
  onReject,
  sending,
}: {
  user: PublicUser;
  relationship: Relationship | "loading";
  busy: boolean;
  onConnect: () => void;
  onAccept: () => void;
  onReject: () => void;
  sending: boolean;
}) {
  if (relationship === "loading") {
    return (
      <div className="flex justify-end">
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    );
  }
  if (relationship === "pending") {
    return (
      <div className="flex justify-end">
        <Badge
          variant="outline"
          className="border-[#665333] bg-[#2b251a] text-[#d4b16a]"
        >
          <Clock3 aria-hidden="true" data-icon="inline-start" />
          Pending
        </Badge>
      </div>
    );
  }
  if (relationship === "connected") {
    return (
      <div className="flex justify-end">
        <Badge
          variant="outline"
          className="border-[#665333] bg-[#2b251a] text-[#d4b16a]"
        >
          <Check aria-hidden="true" data-icon="inline-start" />
          Connected
        </Badge>
      </div>
    );
  }
  if (relationship === "incoming") {
    return (
      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label={`Reject connection request from ${user.displayName}`}
          onClick={onReject}
          disabled={busy}
        >
          <X aria-hidden="true" data-icon="inline-start" />
          Reject
        </Button>
        <Button
          type="button"
          size="sm"
          aria-label={`Accept connection request from ${user.displayName}`}
          onClick={onAccept}
          disabled={busy}
        >
          <Check aria-hidden="true" data-icon="inline-start" />
          Accept
        </Button>
      </div>
    );
  }
  return (
    <div className="flex justify-end">
      <Button
        type="button"
        size="sm"
        aria-label={`Connect with ${user.displayName}`}
        onClick={onConnect}
        disabled={busy}
      >
        <UserPlus aria-hidden="true" data-icon="inline-start" />
        {sending ? "Sending…" : "Connect"}
      </Button>
    </div>
  );
}

function StudentSkeletonGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2" aria-label="Loading students">
      {[0, 1, 2, 3].map((item) => (
        <div
          key={item}
          className="space-y-4 rounded-2xl border border-[#453a2a] bg-[#1b1a17] p-4"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full bg-[#373025]" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3 w-28 bg-[#373025]" />
              <Skeleton className="h-3 w-36 bg-[#373025]" />
            </div>
          </div>
          <Skeleton className="h-8 w-full bg-[#373025]" />
        </div>
      ))}
    </div>
  );
}

function CompactSkeletonList() {
  return (
    <div className="grid gap-3 sm:grid-cols-2" aria-label="Loading requests">
      {[0, 1].map((item) => (
        <div
          key={item}
          className="flex items-center gap-3 rounded-2xl border border-[#453a2a] bg-[#1b1a17] p-4"
        >
          <Skeleton className="size-10 rounded-full bg-[#373025]" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3 w-28 bg-[#373025]" />
            <Skeleton className="h-3 w-36 bg-[#373025]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  compact = false,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <Empty
      className={`rounded-2xl border border-dashed border-[#453a2a] bg-[#1b1a17]/70 text-[#eee5d7] ${
        compact ? "min-h-36" : "min-h-48"
      }`}
    >
      <EmptyMedia
        variant="icon"
        className="size-10 rounded-xl border border-[#735b34]/60 bg-[#342a1c] text-[#d3ad66]"
      >
        {icon}
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle className="text-[#eee5d7]">{title}</EmptyTitle>
      </EmptyHeader>
      <EmptyContent>
        <EmptyDescription className="text-[#a99f90]">
          {description}
        </EmptyDescription>
      </EmptyContent>
    </Empty>
  );
}
