import { PrismaClient } from "@/lib/generated/prisma/index";
import { withAccelerate } from "@prisma/extension-accelerate";

const Prisma = new PrismaClient().$extends(withAccelerate());

export default Prisma;
