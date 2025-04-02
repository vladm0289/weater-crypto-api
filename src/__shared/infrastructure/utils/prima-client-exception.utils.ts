export const prismaExceptionShortMessage = (message: string): string => {
  const shortMessage = message.substring(message.indexOf("→"));
  return shortMessage
    .substring(shortMessage.indexOf("\n"))
    .replace(/\n/g, "")
    .trim();
};
