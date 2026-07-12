import mongoose from 'mongoose';

/**
 * Executes operations inside a transaction if replica sets are supported,
 * otherwise falls back to a normal execution.
 * @param {Function} workFn - Async function executing Mongoose operations. Takes (session)
 */
export const runTransaction = async (workFn) => {
  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const result = await workFn(session);

    await session.commitTransaction();
    return result;
  } catch (error) {
    if (session && session.inTransaction()) {
      await session.abortTransaction();
    }
    // Check if error is due to transaction support lacking (e.g. standalone Mongo)
    if (error.message && (
      error.message.includes('replica set') || 
      error.message.includes('sessions') || 
      error.code === 20 // IllegalOperation
    )) {
      console.warn('MongoDB standalone detected. Falling back to non-transactional execution.');
      // Execute the work without a session
      return workFn(null);
    }
    throw error;
  } finally {
    if (session) {
      session.endSession();
    }
  }
};
