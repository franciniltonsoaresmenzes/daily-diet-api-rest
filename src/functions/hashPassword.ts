import bcrypt from 'bcrypt'

export async function hashPassword(password: string): Promise<string> {
  const saltsRounds = 10
  const hash = await bcrypt.hash(password, saltsRounds)
  return hash
}
