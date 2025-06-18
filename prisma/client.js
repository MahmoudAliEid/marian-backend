const { PrismaClient } = require("../generated/prisma");
import { withAccelerate } from "@prisma/extension-accelerate";

const Prisma = new PrismaClient().$extends(withAccelerate());

module.exports = Prisma;
