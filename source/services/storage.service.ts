import { Storage } from "@google-cloud/storage";

const storage = new Storage({
  projectId: "",
  keyFilename: "",
});

export async function uploadImageToStorage(imageData: Buffer, metadata: any) {
  const bucketName = "";
  const destinationFilePath = "images/" + generateUniqueFileName();

  try {
    await storage
      .bucket(bucketName)
      .file(destinationFilePath)
      .save(imageData, {
        metadata: {
          ...metadata,
          contentType: "image/jpeg",
        },
      });
    const imageUrl =
      "" + destinationFilePath;
    return imageUrl;
  } catch (error) {
    throw error;
  }
}

function generateUniqueFileName() {
  return (
    Date.now() + "_" + Math.random().toString(36).substring(2, 15) + ".jpg"
  );
}
