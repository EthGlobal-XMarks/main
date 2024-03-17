import XMarksABI from './abi/XMarks.json'; 

const XMarksAddress = "YOUR_CONTRACT_ADDRESS_HERE"; // Replace with testnet address

const useContract = () => {
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const signer = provider.getSigner();
    const xMarksContract = new ethers.Contract(XMarksAddress, XMarksABI, signer);

    setContract(xMarksContract);
  }, []);

  return contract;
};

export function XMarksInteraction() {
  const xMarks = useContract();
  const [currentGameImage, setCurrentGameImage] = useState("");
  const [gameData, setGameData] = useState([]);
  const [isWinner, setIsWinner] = useState(false);


  async function submitGuess(longitude, latitude) {
    if (!signer) {
      console.log('Please connect your wallet');
      return;
    }

    try {
      const tx = await contract.submitGuess(longitude, latitude);
      await tx.wait();
      console.log('Guess submitted successfully');
    } catch (error) {
      console.error('Failed to submit guess:', error);
    }
  }

  const fetchCurrentGameImage = async () => {
    if (xMarks) {
      const image = await xMarks.getCurrentGameImage();
      setCurrentGameImage(image);
    }
  };

  const checkIfWinner = async (gameId) => {
    if (xMarks) {
      const walletAddress = await xMarks.signer.getAddress();
      const winner = await xMarks.isWinner(walletAddress, gameId);
      setIsWinner(winner);
    }
  };

  const fetchGameData = async (gameId) => {
    if (xMarks) {
      const data = await xMarks.getGameGuesses(gameId); // Assuming you have a method to fetch game data
      setGameData(data);
    }
  };
}
