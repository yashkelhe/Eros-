import { createClient } from "@supabase/supabase-js";

// const supabaseUrl = "https://ctvpuxhtzwnbkehyfiik.supabase.co"; // Replace with your Supabase project URL
// const supabaseKey ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0dnB1eGh0enduYmtlaHlmaWlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4NDY3NTIsImV4cCI6MjA1MTQyMjc1Mn0.6SZCYkFJ5QMA6dBU_Y_hhdSjwe32U-SsU23QsE4FEkY"; // Replace with your Supabase anon key
const supabaseUrl = process.env.SUPABASE_URL!; // Replace with your Supabase project URL
const supabaseKey = process.env.SUPABASE_KEY!; // Replace with your Supabase anon key
export const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadFile(
  file: File,
  setProgress: (progress: number) => void,
) {
  return new Promise(async (resolve, reject) => {
    try {
      const filePath = `${Date.now()}-${file.name}`; // Unique file path

      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from("Eros-audio") // Your bucket name
        .upload(filePath, file);

      if (error) {
        return reject(error.message);
      }

      if (error) {
        return reject(`Upload failed: ${error}`);
      }
      // Get the public URL of the uploaded file
      let { data: urlData } = await supabase.storage
        .from("Eros-audio")
        .getPublicUrl(filePath);

      // console.log("the URL is here", urlData.publicUrl);

      if (!urlData || !urlData.publicUrl) {
        return reject("Failed to get public URL");
      }
      // console.log("the URL is here hello ", urlData.publicUrl);
      resolve(urlData.publicUrl as string);
    } catch (error) {
      reject(error);
    }
  });
}
