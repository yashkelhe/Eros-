import { db } from "@/server/db";

async function deleteAllData() {
  try {
    // Delete from the child tables first to avoid foreign key violations
    // await db.$executeRaw`
    //   DELETE FROM "SourceCodeEmbedding";
    // `;
    // console.log("Deleted all SourceCodeEmbedding rows.");
    // await db.$executeRaw`
    //   DELETE FROM "Commit";
    // `;
    // console.log("Deleted all Commit rows.");
    // await db.$executeRaw`
    //   DELETE FROM "UserToProject";
    // `;
    // console.log("Deleted all UserToProject rows.");
    // await db.$executeRaw`
    //   DELETE FROM "Project";
    // `;
    // console.log("Deleted all Project rows.");
    // await db.$executeRaw`
    //   DELETE FROM "User";
    // `;
    // console.log("Deleted all User rows.");
  } catch (error) {
    console.error("Error deleting all data", error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

// Call the function to delete all data
deleteAllData()
  .then(() => console.log("Deletion completed"))
  .catch((error) => console.error("Deletion failed", error));
