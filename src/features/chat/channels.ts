// Shared by the server publisher, the token route's capability and the browser subscriber.
export const inboxChannel = (userId: string) => `inbox:${userId}`;
