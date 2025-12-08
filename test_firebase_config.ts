
import { initializeApp } from "firebase/app";
import { getAuth, sendSignInLinkToEmail } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAQpLgRcRkhJcHtJrkX6KktoAYEknUj-GA",
    authDomain: "comicku-a4aae.firebaseapp.com",
    projectId: "comicku-a4aae",
    storageBucket: "comicku-a4aae.firebasestorage.app",
    messagingSenderId: "449222490773",
    appId: "1:449222490773:web:2038082d8995a70d11b99c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const actionCodeSettings = {
    url: 'http://localhost:5000/login',
    handleCodeInApp: true,
};

console.log("Attempting to send email...");
sendSignInLinkToEmail(auth, "test@example.com", actionCodeSettings)
    .then(() => {
        console.log("Successfully sent email (SDK returned success).");
        process.exit(0);
    })
    .catch((error) => {
        console.error("Error sending email:", error.code, error.message);
        process.exit(1);
    });
