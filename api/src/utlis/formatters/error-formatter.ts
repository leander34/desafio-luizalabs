import { z } from 'zod'
export function errorFormatter(errors: z.ZodIssue[]) {
  return errors.map((err) => {
    const { message, path } = err
    return { path: path.join('.'), message }
  })
}
