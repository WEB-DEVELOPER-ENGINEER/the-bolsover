/*
 * Keep Prisma lazy so static page builds do not require the native query engine.
 * The client is initialised only when an API handler actually touches the DB.
 */
const globalForPrisma = globalThis as unknown as { prisma?: any };

let client = globalForPrisma.prisma;

function getPrismaClient() {
  if (!globalForPrisma.prisma) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaClient } = require("@prisma/client");
    globalForPrisma.prisma = new PrismaClient({ log: ["error"] });
  }
  return globalForPrisma.prisma;
}

export const prisma: any = new Proxy(
  {},
  {
    get(_target, property) {
      const runtime = getPrismaClient();
      const value = runtime[property];
      return typeof value === "function" ? value.bind(runtime) : value;
    }
  }
);
