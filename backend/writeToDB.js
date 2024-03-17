import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, orderBy, limit, query, getDocs, Timestamp } from 'firebase/firestore';
import fetch from 'node-fetch';
import { FB_API_KEY, NFT_STORAGE_API_KEY } from './config.js';
import { NFTStorage } from 'nft.storage';

// Upload Generated Image to IFPS

async function writeToIFPS(imageUrl) {
    try {
        //Fetch Image from URL
        console.log(`Fetching image from URL: ${imageUrl}`);
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
        }
        console.log('Image fetched successfully');
        const imageData = await imageResponse.arrayBuffer();
        let storageClient = new NFTStorage({ token: NFT_STORAGE_API_KEY });
        const cid = await storageClient.storeBlob(new Blob([imageData]));
        const ipfsUrl = `https://nftstorage.link/ipfs/${cid}`;
        console.log(`Image uploaded to IPFS: ${ipfsUrl}`);
        return { ipfsUrl };
    } catch (error) {
        console.error('Error uploading image to IPFS:', error);
        throw error;
    }
}

// // Example usage
// const imageUrl = 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-cXlSFLipqdmIQrUK121OzoeW/user-kNkoVXYTWCzATsG3ZnENTuBe/img-bRaIkHCD2J16jPliQpJyX5zu.png?st=2024-03-15T23%3A35%3A19Z&se=2024-03-16T01%3A35%3A19Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2024-03-15T06%3A53%3A56Z&ske=2024-03-16T06%3A53%3A56Z&sks=b&skv=2021-08-06&sig=1mwWMft9W4jpklY%2Bhe2dpV1rrwMVC7TiAwMwRh2W6JQ%3D';
// writeToIFPS(imageUrl)
//     .then(ipfsUrl => console.log(`Image uploaded to IPFS: ${ipfsUrl}`))
//     .catch(error => console.error(error));


// Uploading Generated Image Data to Database
async function writeToFirebase(imageUrl, imageCity, imageLatitude, imageLongitude) {

    const firebaseConfig = {
        apiKey: FB_API_KEY,
        authDomain: "xmarks-7e43c.firebaseapp.com",
        projectId: "xmarks-7e43c",
        storageBucket: "xmarks-7e43c.appspot.com",
        messagingSenderId: "763539116352",
        appId: "1:763539116352:web:2ca04ed967ee30748aaaa5",
        measurementId:"G-49GRP4EZ0E"
      };

    // Initialize & Write to Firebase
    try {
      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);
      const docRef = await addDoc(collection(db, "generated_images"), {
        url:imageUrl,
        city:imageCity,
        longitude:imageLongitude,
        latitude:imageLatitude,
        createdAt: Timestamp.now() // Server-side timestamp
      });
    } catch (error) {
      console.error("Firebase initialization error:", error);
    }
  };

// // Example usage
// const imageUrl = 'https://path.to/your/image.jpg';
// const city = "Baku";
// const longitude = 23.1;
// const latitude = 12.3;
// writeToFirebase(imageUrl, city, longitude, latitude).catch(console.error);


// Read Stored Game Data From Firebase
async function fetchMostRecentLocation() {
    const firebaseConfig = {
        apiKey: FB_API_KEY,
        authDomain: "xmarks-7e43c.firebaseapp.com",
        projectId: "xmarks-7e43c",
        storageBucket: "xmarks-7e43c.appspot.com",
        messagingSenderId: "763539116352",
        appId: "1:763539116352:web:2ca04ed967ee30748aaaa5",
        measurementId: "G-49GRP4EZ0E"
    };

    // Initialize Firebase within the function
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    try {
        // Create a query against the collection, ordering by createdAt descending
        const q = query(collection(db, "generated_images"), orderBy("createdAt", "desc"), limit(1));

        const querySnapshot = await getDocs(q);
        let mostRecentDoc = null;

        querySnapshot.forEach((doc) => {
            // This will get the first and most recent document based on the query
            // console.log(doc.id, " => ", doc.data());
            mostRecentDoc = { id: doc.id, ...doc.data() };
        });

        return mostRecentDoc;
    } catch (error) {
        console.error("Error fetching documents:", error);
        throw error; // or handle as needed
    }
}

// // Example usage
// fetchMostRecentLocation().then(doc => {
//     console.log("Most recent document:", doc);
// }).catch(console.error);



export { writeToIFPS, writeToFirebase, fetchMostRecentLocation };