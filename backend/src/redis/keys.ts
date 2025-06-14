export const redisKeys = {
	session: (sessionId: string) => `session:${sessionId}`,
}
