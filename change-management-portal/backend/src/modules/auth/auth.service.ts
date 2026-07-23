import bcrypt from "bcryptjs";
import { prisma } from "../../config/db";
import { ApiError } from "../../utils/apiError";
import { signAccessToken } from "../../middleware/auth";

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const token = signAccessToken({
    sub: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
    },
  };
}
