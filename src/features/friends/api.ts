export async function sendFriendRequest(toUserId: string) {
  const res = await fetch("/api/friends/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ toUserId }),
  });

  if (!res.ok) {
    let message = "Failed to send friend request";
    try {
      const data = await res.json();
      message = data?.error || message;
    } catch {}
    throw new Error(message);
  }

  return res.json(); // { id, status: "PENDING", toUserId } (or whatever your route returns)
}

export async function acceptFriendRequest(requestId: string) {
  const res = await fetch("/api/friends/accept", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requestId }),
  });

  if (!res.ok) {
    let message = "Failed to accept friend request";
    try {
      const data = await res.json();
      message = data?.error || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}
export async function declineFriendRequest(requestId: string) {
  const res = await fetch("/api/friends/decline", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requestId }),
  });

  if (!res.ok) {
    let message = "Failed to decline friend request";
    try {
      const data = await res.json();
      message = data?.error || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}
