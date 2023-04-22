import bcrypt from 'bcrypt'

export async function comparePassword(
  password: string,
  encrypted: string,
): Promise<boolean> {
  const hash = await bcrypt.compare(password, encrypted)
  return hash
}
