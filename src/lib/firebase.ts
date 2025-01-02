// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD6pNcRRTnrrFBuul5WgfPhR6ZzgTtgaKk",
  authDomain: "eros-git.firebaseapp.com",
  projectId: "eros-git",
  storageBucket: "eros-git.firebasestorage.app",
  messagingSenderId: "61065552620",
  appId: "1:61065552620:web:185f7b8a4b888024d3bbc9",
  measurementId: "G-VF19YRQB4B",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const storage = getStorage(app);

// setProgress this will indiate the how much percent of the file have been uploaded
export async function uploadFile(
  file: File,
  setProgress: (progress: number) => void,
) {
  return new Promise((resolve, reject) => {
    try {
      // Create a storage reference from our storage service and pass the file name
      const storageRef = ref(storage, file.name);
      const uploadedTask = uploadBytesResumable(storageRef, file);

      uploadedTask.on(
        "state_changed",
        (snapshot) => {
          // this snapshot will give you the progress of the file upload
          const progress =
            Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 100;

          //   updateProgress(progress); // this will update the progress
          if (setProgress) setProgress(progress);

          switch (snapshot.state) {
            case "paused":
              console.log("Upload is paused");
              break;
            case "running":
              console.log("Upload is running");
              break;
          }
        },
        (error) => {
          reject(error);
        },
        () => {
          // getDownloadURL will give you the download URL of the file after upload is finished
          getDownloadURL(uploadedTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        },
      );
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
}
