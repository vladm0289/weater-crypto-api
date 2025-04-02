import { Prisma } from "@prisma/client";
import { prismaExceptionShortMessage } from "./prima-client-exception.utils";

export function handlePrismaError(error: any): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return prismaExceptionShortMessage(error.message);
  }
  return error.message || "An unexpected error occurred";
}
