export default function assertIsDefined<T>(
  value: T,
  message?: string
): asserts value is NonNullable<T> {
  if (!value)
    throw new Error(
      message || `Expected 'value' to be defined, but received ${value}`
    );
}

// this is to assert that a value is defined if possibly undefined
// like when create article with authenticated user, there is already requireAuth middleware to check if user is authenticated
// but TS said authenticated user is still possibly undefined, if so, this function will throw an error
// this is better than using `!` to assert that a value is defined, that's bad practice
