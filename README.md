# XMarks : On-chain Geo-Guesser Game
X-Marks [cross-marks] is a multiplayer on-chain game, with unique NFT prizes for each round. Players compete to guess the location of various landmarks, cities and geographical features from around the world 🌎

## Overview
X-Marks offers a strategic, competitive multiplayer game where players vie for victory and rewards, including unique AI-generated NFTs. Gameplay starts with generating random coordinates, translated into images by DALL·E 3, which players aim to identify. They have a 12-hour window for guesses, starting with one per round but can earn up to five through WorldID verification. The closest guess wins the NFT image, a trophy symbolizing exploration and success. X-Marks combines continuous discovery and competition in an ongoing, on-chain adventure.

## Motivation
X-Marks bridges the gap between the ease of Web2 games and the genuine asset ownership offered by Web3. Developed for ETH Global London, it combines the best of both worlds: engaging gameplay with the fairness of verifiable randomness and real ownership through NFTs, all built on a user-friendly platform. Our goal is to showcase a future where gaming is both immersive and accessible, leveraging blockchain's potential without overwhelming the player.

## How to get Hands-On :-
1. **Join the Game** : Players can join the game by two options: entering their email addresses and/or connecting their WEB3 wallet's to the platform.

2. **Guess Locations** : Once in the game, players are presented with the NFT that is to be won. They must guess the correct location by dropping a pin on the Globe provided.

3. **Earn Rewards** : The winner is chosen based on the accuracy of it's guess. The closer the guess to the actual location, the higher the chaces of winning the reward!

4. **Leaderboard** : Compete with friends and other players on the global leaderborad to showcase your geo-guessing skills and get your unique city NFT.


## Description
- Xmarks architecture is based on three main components consisiting the smart contracts, the game client and the backend for support.
### Smart Contracts
* Core Functions:

    - *setPrizesContract*: Links a prize contract address to award winners.
    - *startNewGame*: Initiates a new game instance, requesting random numbers to determine the game's target coordinates.
    - *submitGuess* : Allows players to submit guesses for a game's target location. Limits guesses per player and ensures game activity.
    - *recordWinner* : Marks a game's winner, awards them via the prize contract, and concludes the game.
    addVerifiedWallet: Manages wallet verification, crucial for guess submissions after the initial guess.

* Chainlink Integration:

    - *Randomness* : Utilizes Chainlink VRF (Verifiable Random Function) to generate secure, random numbers for game target coordinates, ensuring fairness.
    - *Post Request using Chainlink functions *: `FullfillRandomWords` - after the random number's are generated we use the above function to make a post request and integrate to our backend systems. 

### Frontend / Game Client :-
* Core Functions 
   - *submitCoordinate* : Submits the guessed co-ordinates to the smart-contract, processes the transaction, and updates the user's guess count. 
   - *handleGlobeClick* : records the guess of the user on double click on the same location under 300 ms or times-out.
   - *fetchPastGames* : Retrieves details of all past games from the smartcontract and displays to the user.
   - *fetchCurrentGameData* : Fetches current game details, including image, total guesses, user's guesses, and verification status, to use for the current game details 
   - *fetchProfileData* : Queries and displays an user's winning games from the smartcontract. 

* WorldCoin Integration
  - The app seamlessly integrates Worldcoin's IDKit for secure and privacy-preserving user verification, ensuring we reward genuinity by utilizing WorldCoins genuine userbase and fairly giving an edge of extra chances to enter their guess 3 times while a normal user just gets a single guess.


* Dynamic Integration
    - Integrates Dynamic's SDK to enhance user onboarding with a seamless, authenticated, frictionless wallet connection experience for all kinds of users and further enhancing their gaming-experience while abstracting the complexities of crypto.

### Backend 
* Core Functions
   - *calculateDistance* : Computes the distance between two geographical coordinates using the `Haversine` formula, **https://en.wikipedia.org/wiki/Great-circle_distance** returning the result in meters.
   - *generateRandomCoordinatesLimited* : Generates random geographical coordinates based on input from a random number generator [ChainlinkVRF], then identifies and returns the closest city from a predefined list, along with the distance to that city.
   - *fetchGameGuessesAndFormat*: Retrieves and formats guess data for a specified game from the smart contract on the Arbitrum Sepolia network, adjusting for co-ordinate scaling.
   - *findWinner*: Identifies the closest guess to a specified winning location from a set of guesses using smartcontract, determining the winner's address and their guess's proximity to the target coordinates.
   - *generateImageFromCity*: Generates an image of a specified city by invoking OpenAI's DALL-E model, incorporating unique elements for a uniquely generated NFT.

## Local Setup
To run the setup locally
1. Clone the repository :
```bash
git clone https://github.com/EthGlobal-XMarks
```
2. Change Directory to frontend
``
cd frontend
``

3. Install packages locally
```
npm install
```

4. Then run the file on your local machine

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Future Developments

### Enhanced Multiplayer Experience
- **Private Rooms**: Implement functionality for players to create private game rooms, inviting friends for a more personalized and competitive experience.

### Community and Ecosystem
- **Player-Created Content**: Allow players to submit their own images or locations for game rounds, subject to community voting for inclusion.
- **Cross-Platform Play**: Ensure the game is accessible across multiple platforms, including mobile, to widen its reach and player base.

### User Engagement
- **Seasonal Leaderboards**: Seasonal leaderboards with special rewards to encourage continuous engagement and competition among players.

## Powered by Arbitrum Protocol