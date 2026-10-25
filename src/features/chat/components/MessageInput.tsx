"use client";
import { useState, type FormEvent, type KeyboardEvent } from "react";
import { SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const MAX_LENGTH = 2000;

export function MessageInput({
  onSend,
  onTyping,
  error,
}: {
  onSend: (body: string) => void;
  onTyping?: () => void;
  error?: string | null;
}) {
  const [value, setValue] = useState("");
  const trimmed = value.trim();

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form onSubmit={submit} className="border-t border-border bg-card/90 px-3 py-3 backdrop-blur-xl">
      {error && <p className="mb-2 px-1 text-xs text-destructive">{error}</p>}
      <div className="flex items-end gap-2">
        <Textarea
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            onTyping?.();
          }}
          onKeyDown={onKeyDown}
          maxLength={MAX_LENGTH}
          rows={1}
          placeholder="Write a message…"
          aria-label="Message"
          className="max-h-40 min-h-10 resize-none rounded-xl bg-popover/60"
        />
        <Button type="submit" size="icon" className="size-10 shrink-0" disabled={!trimmed} aria-label="Send message">
          <SendHorizontal />
        </Button>
      </div>
      {value.length > MAX_LENGTH - 200 && (
        <p className="mt-1 px-1 text-right font-mono text-[10px] text-muted-foreground">
          {value.length}/{MAX_LENGTH}
        </p>
      )}
    </form>
  );
}
