import { describe, expect, it } from 'bun:test'
import { TestClient } from './lib/test-client'

describe('Health Routes', () => {
	const client = new TestClient()

	describe('GET /health', () => {
		it('should return 200', async () => {
			const res = await client.get('/health')
			expect(res.status).toBe(200)
			expect(res.data).toEqual({
				status: 200,
				message: 'Service is running',
				timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/),
			})
		})
	})
})
