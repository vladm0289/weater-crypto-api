export function transformToBoolean({ value }: { value: string }): boolean {
  return value.toLowerCase() === "true";
}
