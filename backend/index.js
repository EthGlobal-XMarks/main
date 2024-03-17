import express from 'express';
import Web3 from 'web3';
import { generateRandomCoordinatesLimited } from './randomCoordinates.js';
import fetch from 'node-fetch';
import cors from 'cors';
import { generateImageFromCity } from './openaiService.js';
import { fetchMostRecentLocation, writeToFirebase, writeToIFPS } from './writeToDB.js';
import { fetchLatestGameId, findWinner } from './winnerFind.js';

const app = express();
const httpProvider = "https://sepolia-rollup.arbitrum.io/rpc";
const contractAddress = "0xCDdd0ee772b816B62E3939B0958a64228592a2B6";
const privateKey = "f2fcb341506b167a8e66ffbba57875e86bcb44687b719d7f879dda92f4bd8710";
const publicKey = "0xb1a2b6bf5F8d79EC9DbcA11a2e5397Aa6AF57611";
const abi = [
	{
		"inputs": [
			{
				"internalType": "uint64",
				"name": "randomSubscriptionId",
				"type": "uint64"
			},
			{
				"internalType": "uint64",
				"name": "functionsSubscriptionId",
				"type": "uint64"
			},
			{
				"internalType": "address",
				"name": "router",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "EmptyArgs",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "EmptySource",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "NoInlineSecrets",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "have",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "want",
				"type": "address"
			}
		],
		"name": "OnlyCoordinatorCanFulfill",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "OnlyRouterCanFulfill",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "requestId",
				"type": "bytes32"
			}
		],
		"name": "UnexpectedRequestID",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			}
		],
		"name": "OwnershipTransferRequested",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "id",
				"type": "bytes32"
			}
		],
		"name": "RequestFulfilled",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "requestId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256[]",
				"name": "randomWords",
				"type": "uint256[]"
			}
		],
		"name": "RequestFulfilled",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "id",
				"type": "bytes32"
			}
		],
		"name": "RequestSent",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "requestId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint32",
				"name": "numWords",
				"type": "uint32"
			}
		],
		"name": "RequestSent",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "requestId",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"internalType": "bytes",
				"name": "response",
				"type": "bytes"
			},
			{
				"indexed": false,
				"internalType": "bytes",
				"name": "err",
				"type": "bytes"
			}
		],
		"name": "Response",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "acceptOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "addr",
				"type": "address"
			}
		],
		"name": "addVerifiedWallet",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "number",
				"type": "uint256"
			}
		],
		"name": "convertToString",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "gameData",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "longitude",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "latitude",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "wallet",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "gameGuesses",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "longitude",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "latitude",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "wallet",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "gameId",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "games",
		"outputs": [
			{
				"internalType": "address",
				"name": "winner",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "winningLongitude",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "winningLatitude",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "image",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "active",
				"type": "bool"
			},
			{
				"internalType": "bytes32",
				"name": "longitudeHash",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "latitudeHash",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getCurrentGameImage",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "wallet",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "instance",
				"type": "uint256"
			}
		],
		"name": "getGameData",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "longitude",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "latitude",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "wallet",
						"type": "address"
					}
				],
				"internalType": "struct XMarks.Guess[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "getGameGuesses",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "longitude",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "latitude",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "wallet",
						"type": "address"
					}
				],
				"internalType": "struct XMarks.Guess[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_requestId",
				"type": "uint256"
			}
		],
		"name": "getRequestStatus",
		"outputs": [
			{
				"internalType": "bool",
				"name": "fulfilled",
				"type": "bool"
			},
			{
				"internalType": "uint256[]",
				"name": "randomWords",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "requestId",
				"type": "bytes32"
			},
			{
				"internalType": "bytes",
				"name": "response",
				"type": "bytes"
			},
			{
				"internalType": "bytes",
				"name": "err",
				"type": "bytes"
			}
		],
		"name": "handleOracleFulfillment",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "wallet",
				"type": "address"
			}
		],
		"name": "isWalletVerified",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "addr",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "isWinner",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "lastRequestId",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "maximumGuesses",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "requestId",
				"type": "uint256"
			},
			{
				"internalType": "uint256[]",
				"name": "randomWords",
				"type": "uint256[]"
			}
		],
		"name": "rawFulfillRandomWords",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "winner",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "winningLongitude",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "winningLatitude",
				"type": "uint256"
			}
		],
		"name": "recordWinner",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "requestIds",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "s_lastError",
		"outputs": [
			{
				"internalType": "bytes",
				"name": "",
				"type": "bytes"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "s_lastRequestId",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "s_lastResponse",
		"outputs": [
			{
				"internalType": "bytes",
				"name": "",
				"type": "bytes"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "s_requests",
		"outputs": [
			{
				"internalType": "bool",
				"name": "fulfilled",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "exists",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "image",
				"type": "string"
			}
		],
		"name": "setImage",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_prizesContract",
				"type": "address"
			}
		],
		"name": "setPrizesContract",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "startNewGame",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "longitude",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "latitude",
				"type": "uint256"
			}
		],
		"name": "submitGuess",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "verifiedWallets",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

app.use(express.json());
app.use(cors());

var web3;

const web3Init = async () => {
    const provider = new Web3.providers.HttpProvider(httpProvider);
    web3 = new Web3(provider);
    web3.eth.accounts.wallet.add(privateKey);
};

app.post('/verifyProof', async (req, res) => {
    console.log(req.body);
    const reqBody = {
        nullifier_hash: req.body.proof.nullifier_hash,
        merkle_root: req.body.proof.merkle_root,
        proof: req.body.proof.proof,
        verification_level: req.body.proof.verification_level,
        action: "identity"
    };
    const response = await fetch(
        'https://developer.worldcoin.org/api/v1/verify/app_staging_d135904cf1cc197cb139db7992f44ac6',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reqBody),
        }
    );
    if (response.ok) {
        const { success } = await response.json();
        if (success) {
            let contract = new web3.eth.Contract(abi, contractAddress);
            await contract.methods.addVerifiedWallet(req.body.address).send({from: publicKey, gasLimit: 2000000});
            res.json({type: "success", message: "Verified proof"});
        } else {
            res.json({type: "failure", message: "Invalid proof"});
        }
    } else {
        const { code, detail } = await response.json();
        res.json({type: "failure", message: "Failed verification", code: code, detail: detail});
    }
});

// Calls Smart Contract "Start Game" Function
app.post("/startGame", async (req, res) => {
    let contract = new web3.eth.Contract(abi, contractAddress);
    await contract.methods.startNewGame().send({from: publicKey, gasLimit: 2000000});
    res.json({type: "success", message: "Game initialization started"});
});

app.post('/getCoordinates', async (req, res) => {
    //Fetches Random Numbers from ChainLink VRF & Generated Random Coordinates
    if (req.body.random1 && req.body.random2) {
        let output = await generateRandomCoordinatesLimited(req.body.random1, req.body.random2)
        res.json({success: 1});
        let generatedCoordinates = output.closestCityCoordinates;
        let generatedCity = output.closestCity;
        console.log(generatedCity, output);
        // Generate Image Using OpenAI
        let output2 = await generateImageFromCity(generatedCity);
        let generatedImageUrl = output2.imageUrl;
        console.log(generatedImageUrl);
        let output3 = await writeToIFPS(generatedImageUrl);
        let IfpsImgUrl = output3.ipfsUrl;
        console.log(IfpsImgUrl);
        try {
            let imgLatitude = generatedCoordinates.latitude;
            let imgLongitude = generatedCoordinates.longitude;
            console.log(imgLatitude, imgLongitude);
            writeToFirebase(IfpsImgUrl, generatedCity, imgLatitude, imgLongitude).catch(console.error);
        } catch (error) {
            console.error("Firebase Write Error", error);
        }
        let contract = new web3.eth.Contract(abi, contractAddress);
        await contract.methods.setImage(IfpsImgUrl).send({from: publicKey, gasLimit: 2000000});
    } else {
        res.json({success: 0});
    }
});

// End-Game Logic
app.post("/endGame", async (req, res) => {
    try {
        // Fetch Winning Coordinates
        let currentGameData = await fetchMostRecentLocation();
        const lat = currentGameData.latitude;
        const long = currentGameData.longitude;

        // Fetch Current Game Guesses and Find Winner
        let currentGameNo = await fetchLatestGameId(abi, contractAddress);
        let winnerDetails = await findWinner(contractAddress, currentGameNo, lat, long, abi)
        const winnerAdd = winnerDetails.winnerAddress
        const winnerDistance = winnerDetails.closestDistance;
        let contract = new web3.eth.Contract(abi, contractAddress);
        console.log(winnerAdd, long * 10000 + 180, lat * 10000 + 90);
        await contract.methods.recordWinner(winnerAdd, (long + 180) * 10000, (lat + 90) * 10000).send({from: publicKey, gasLimit: 2000000});
        res.json({success: 1});
    } catch (error) {
        console.error('Error Running End Game Sequence', error);
        res.json({success: 0});
    }
});

web3Init();


export {app};