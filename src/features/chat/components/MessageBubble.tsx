import type { ThreadMessage } from "../hooks/useMessages";

export function MessageBubble({
  message,
  mine,
  onRetry,
  onDiscard,
}: {
  message: ThreadMessage;
  mine: boolean;
  onRetry?: () => void;
  onDiscard?: () => void;
}) {
  const sentAt = new Date(message.createdAt);

  return (
    <div className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
      <div
        title={sentAt.toLocaleString()}
        className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words ${
          mine
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md border border-border bg-popover text-foreground"
        } ${message.failed ? "opacity-60" : ""}`}
      >
        {message.body}
        <span
          className={`mt-0.5 block text-right font-mono text-[10px] ${
            mine ? "text-primary-foreground/70" : "text-muted-foreground"
          }`}
        >
          {sentAt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
      {message.failed && (
        <div className="mt-1 flex items-center gap-2 text-[11px]">
          <span className="text-destructive">Not sent</span>
          <button type="button" onClick={onRetry} className="cursor-pointer font-semibold text-electric hover:underline">
            Retry
          </button>
          <button
            type="button"
            onClick={onDiscard}
            className="cursor-pointer text-muted-foreground hover:text-foreground hover:underline"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
