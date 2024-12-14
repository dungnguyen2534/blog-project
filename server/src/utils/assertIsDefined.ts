export default function assertIsDefined<T>(
  value: T,
  message?: string
): asserts value is NonNullable<T> {
  if (!value)
    throw new Error(
      message || `Expected 'value' to be defined, but received ${value}`
    );
}
