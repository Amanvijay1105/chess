import bcrypt from "bcrypt";

export async function createHashPassword(
  password: string
): Promise<string> {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    throw new Error("Failed to hash password");
  }
}

export async function comparePassword(
  password: string,
  hashPassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashPassword);
  } catch (error) {
    throw new Error("Failed to compare password");
  }
}