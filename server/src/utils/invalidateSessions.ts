import mongoose from "mongoose";

export async function invalidateSessions(userId: string) {
  const regexp = new RegExp("^" + userId); // match all session id that starts with userId
  mongoose.connection.db.collection("sessions").deleteMany({ _id: regexp });
}
