// components/GameInstancesTable.js
import React, { useContext, useEffect, useState } from 'react';
import styles from "./styles.module.css";
import useWindowDimensions from "../hooks/useWindowDimensions";
import { IoMdArrowRoundBack } from "react-icons/io";
import XMarksABI from '../abi/XMarks.json'; 
import { contractAddress } from '@/config/config';
import Web3 from 'web3';
import { useAccount } from 'wagmi';
import { prepareWriteContract, writeContract, waitForTransaction } from "@wagmi/core";

const pastGamesView = 1;
const currentGameView = 2;
const userView = 3;

const provider = new Web3.providers.HttpProvider("https://sepolia-rollup.arbitrum.io/rpc");

const ExploreTab = ({ viewType, setGameView, longitude, latitude }) => {
    console.log(longitude);
    const { address, isConnected, isConnecting } = useAccount();
    const {height} = useWindowDimensions();
    const [loading, setLoading] = useState(false);
    const [pastGames, setPastGames] = useState("none");
    const [currentGameImage, setCurrentGameImage] = useState("");
    const [gameGuesses, setGameGuesses] = useState("");
    const [userGuesses, setUserGuesses] = useState("");
    const [maxGuesses, setMaxGuesses] = useState("");
    const [wonGames, setWonGames] = useState([]);

    useEffect(() => {
        async function fetchPastGames() {
            setLoading(true);
            const web3 = new Web3(provider);
            const xMarksContract = new web3.eth.Contract(XMarksABI, contractAddress);
            const gameId = parseInt(await xMarksContract.methods.gameId().call());
            let games = [];
            for (let i = 1; i<gameId; i++) {
                const gameDetails = await xMarksContract.methods.games(i).call();
                games.push(gameDetails);
            }
            setPastGames(games);    
            setLoading(false);
        }

        async function fetchCurrentGameData() {
            setLoading(true);
            const web3 = new Web3(provider);
            const xMarksContract = new web3.eth.Contract(XMarksABI, contractAddress);
            const image = await xMarksContract.methods.getCurrentGameImage().call();
            const gameId = parseInt(await xMarksContract.methods.gameId().call());
            const gameGuesses = (await xMarksContract.methods.getGameGuesses(gameId).call()).length;
            const userGuesses = await xMarksContract.methods.getGameData(address, gameId).call();
            const isVerified = await xMarksContract.methods.verifiedWallets(address).call();
            setUserGuesses(userGuesses.length)
            setGameGuesses(gameGuesses);
            setMaxGuesses(isVerified ? 3 : 1);
            setCurrentGameImage(image);
            setLoading(false);
        }

        async function fetchProfileData() {
            setLoading(true);
            const web3 = new Web3(provider);
            const xMarksContract = new web3.eth.Contract(XMarksABI, contractAddress);
            const gameId = parseInt(await xMarksContract.methods.gameId().call());
            let winningGames = [];
            for (let i = 1; i<gameId; i++) {
                const gameDetails = await xMarksContract.methods.games(i).call();
                if (gameDetails.winner.toLowerCase() === address.toLocaleLowerCase()) {
                    winningGames.push(gameDetails);
                }
            }
            setWonGames(winningGames);
            setLoading(false);
        }

        if (viewType === pastGamesView) {
            fetchPastGames();
        } else if (viewType === currentGameView) {
            setPastGames("none");
            fetchCurrentGameData();
        } else {
            setPastGames("none");
            fetchProfileData();
        }
    }, [viewType]);

    const submitCoordinate = async () => {
        setLoading(true);
        const submitGuessAbi = await XMarksABI.find((x) => x.name === "submitGuess");
        console.log(submitGuessAbi);
        let long = parseInt((longitude + 180).toFixed(4) * 10000);
        let lat = parseInt((latitude + 90).toFixed(4) * 10000);
        console.log(long, lat);
        const config = await prepareWriteContract({
            address: contractAddress,
            abi: XMarksABI,
            functionName: "submitGuess",
            args: [long, lat],
        });

        const { hash } = await writeContract(config);
        const data = await waitForTransaction({ hash });
        setUserGuesses(userGuesses + 1);
        setGameGuesses(gameGuesses + 1);
        setLoading(false);
    };

    return (
        <div className={styles.exploreTab} style={{height: height - 65, width: "100%"}}>
            {viewType === pastGamesView ?
                <div>
                    <h1 className={styles.exploreTitle}>Past Games</h1>
                    {loading ?
                        <div className={styles.loadingContainer}>
                            Loading...
                        </div>
                    :
                        <div className={styles.pastGames}>
                            {pastGames !== "none" &&
                                <>
                                    {pastGames.length ?
                                        pastGames.map((game, i) => {
                                            console.log(game);
                                            return (
                                                <div className={styles.pastGame} key={i}>
                                                    <div className={styles.pastGameTitle}>GAME {i+1}</div>
                                                    <img src={game.image || "./img-1.jpeg"} alt="game" className={styles.pastImage} />
                                                    <div className={styles.pastGameDetails}>
                                                        <div>Longitude: {(parseInt(game.winningLongitude) / 10000 - 180).toFixed(4)} </div>
                                                        <div>Latitude: {(parseInt(game.winningLatitude) / 10000 - 90).toFixed(4)}</div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    :
                                        <div className={styles.loadingContainer}>
                                            There are no past games just yet.
                                        </div>
                                    }
                                </>
                            }
                        </div>
                    }
                </div>
            :   viewType === currentGameView ?
                <div style={{position: "relative"}}>
                    <IoMdArrowRoundBack className={styles.backArrow} onClick={() => setGameView(pastGamesView)} />
                    <h1 className={styles.exploreTitle}>Current Game</h1>
                    <div className={styles.currentGame}>
                        {loading ?
                            <div className={styles.loadingContainer}>
                                Loading...
                            </div>
                        :
                            <div className={styles.currentGameContainer}>
                                <img src={currentGameImage || "./img-1.jpeg"} alt="game" className={styles.currentImage} />
                                <div className={styles.currentGameDetails}>
                                    <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 5}}><b>Time remaining</b>No expiry set</div>
                                    <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 5}}><b>No. of Guesses</b>{gameGuesses}</div>
                                </div>
                                <div className={styles.yourGuess}>Your Guess</div>
                                {maxGuesses - userGuesses > 0 ?
                                    <>
                                        <div className={styles.currentGuess}>
                                            <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 5}}>
                                                <b style={{color: "rgb(80,80,80)"}}>Remaining guesses</b>
                                                {maxGuesses - userGuesses}
                                            </div>
                                            <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 5}}>
                                                <b style={{color: "rgb(80,80,80)"}}>Selected Location</b>
                                                {longitude || latitude ? <>{longitude.toFixed(4)}, {latitude.toFixed(4)}</> : "none selected"}
                                            </div>
                                        </div>
                                        {longitude || latitude ?
                                            <div className={styles.submitContainer}>
                                                <div className={styles.submitBtn} onClick={() => submitCoordinate()}>
                                                    Submit Guess
                                                </div>
                                            </div>
                                        :
                                            null
                                        }
                                    </>
                                :
                                    <div style={{textAlign: "center", marginTop: 10}}>
                                        You cannot make any more guesses in this game
                                    </div>
                                }
                            </div>      
                        }
                    </div>
                </div>
            : viewType === userView &&
                <div style={{position: "relative"}}>
                    <IoMdArrowRoundBack className={styles.backArrow} onClick={() => setGameView(pastGamesView)} />
                    <h1 className={styles.exploreTitle}>My Profile</h1>
                    {loading ?
                        <div className={styles.loadingContainer}>
                            Loading...
                        </div>
                    :
                        <div className={styles.pastGames}>
                            {wonGames.length ?
                                wonGames.map((game, i) => {
                                    return (
                                        <div className={styles.pastGame} key={i}>
                                            <div className={styles.pastGameTitle}>GAME {i+1} NFT</div>
                                            <img src={game.image || "./img-1.jpeg"} alt="game" className={styles.pastImage} />
                                            <div className={styles.pastGameDetails}>
                                                <div>Longitude: {(parseInt(game.winningLongitude) / 10000 - 180).toFixed(4)} </div>
                                                <div>Latitude: {(parseInt(game.winningLatitude) / 10000 - 90).toFixed(4)}</div>
                                                <div>You have won this game and have been awarded with an nft</div>
                                            </div>
                                        </div>
                                    );
                                })
                            :
                                <div className={styles.loadingContainer}>
                                    You have not won any games yet.
                                </div>
                            }
                        </div>
                    }       
                </div>
            }
        </div>
    );
};

export default ExploreTab;
