import Web3 from 'web3';
import { calculateDistance } from './randomCoordinates.js';


async function fetchLatestGameId(contractAbi, contractAddress) {

    const ARBITRUM_SEPOLIA_RPC_URL = 'https://sepolia-rollup.arbitrum.io/rpc';
    const web3 = new Web3(ARBITRUM_SEPOLIA_RPC_URL);
    const contract = new web3.eth.Contract(contractAbi, contractAddress);

    try {
        const latestGameId = await contract.methods.gameId().call();
        console.log("Latest Game ID on Arbitrum Sepolia Rollup:", latestGameId);
        return latestGameId;
    } catch (error) {
        console.error("Error fetching the latest game ID from Arbitrum Sepolia Rollup:", error);
        throw error;
    }
}


async function fetchGameGuessesAndFormat(gameId, contractAbi, contractAddress) {
    const ARBITRUM_SEPOLIA_RPC_URL = 'https://sepolia-rollup.arbitrum.io/rpc';
    const web3 = new Web3(ARBITRUM_SEPOLIA_RPC_URL);
    const contract = new web3.eth.Contract(contractAbi, contractAddress);

    try {
        const guessesRaw = await contract.methods.getGameGuesses(gameId).call();
        let formattedGuesses = [];

        for (let i = 0; i<guessesRaw.length; i++) {
            formattedGuesses.push({
                address: guessesRaw[i].wallet,
                longitude: (guessesRaw[i].longitude / 10000) - 180,
                latitude: (guessesRaw[i].latitude / 10000) - 90
            });
        }

        return formattedGuesses;
    } catch (error) {
        console.error("Error fetching and formatting game guesses:", error);
        throw error;
    }
}


async function findWinner(contractAddress, gameId, winningLat, winningLon, contractAbi) {
    // Simulating fetchGameGuesses returns an array of arrays as described
    const guesses = await fetchGameGuessesAndFormat(gameId, contractAbi, contractAddress); // You need to implement or adjust this call accordingly
    console.log("Guesses for game", gameId, ":", guesses);
    let closestDistance = Infinity;
    let winnerAddress = null;

    guesses.forEach(guess => {
        const guesserAddress = guess.address; // The first element is the guesser's address
        // Iterate over the rest of the array containing guess objects
        const distance = calculateDistance(winningLat, winningLon, guess.latitude, guess.longitude);
        if (distance < closestDistance) {
            closestDistance = distance;
            winnerAddress = guesserAddress;
        }
    });
    console.log("Winner address:", winnerAddress, "with a distance of", closestDistance, "from the winning location");
    return { winnerAddress, closestDistance };
}


export { findWinner, fetchLatestGameId };