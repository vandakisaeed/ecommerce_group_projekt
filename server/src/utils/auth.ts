import jwt from "jsonwebtoken";
import User from "@/models/usersModel";

export async function getUserFromRequest(req: Request) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) return null;

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await User.findById(decoded.id);
    return user;
  } catch (e) {
    return null;
  }
}
