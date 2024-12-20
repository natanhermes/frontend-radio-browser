import { z } from 'zod'

const envSchema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_REACT_APP_STREAM_PROXY_URL: z.string().url(),
})

export const env = envSchema.parse(import.meta.env)
