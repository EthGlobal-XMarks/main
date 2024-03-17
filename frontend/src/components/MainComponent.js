import { useState } from "react";
import Header from '../components/Header';
import Earth from "../components/Earth";
import ExploreTab from "@/components/ExploreTab";
import styles from "./styles.module.css";
import { useAccount } from "wagmi";
import { FaUser } from "react-icons/fa";

const pastGamesView = 1;
const currentGameView = 2;
const userView = 3;

export default function MainComponent () {
    const { address, isConnected, isConnecting } = useAccount();
    const [activeCountry, setActiveCountry] = useState();
    const [viewType, setViewType] = useState(pastGamesView);
    const [longitude, setLongitude] = useState();
    const [latitude, setLatitude] = useState();

    return (
        <div className={styles.container}>
            <div className="flex flex-col min-h-screen">
                {/* Header Component */}
                <header className="w-full">
                 <Header />
                </header>
                <div className={styles.gameContainer}>
                    <div className={styles.earthContainer}>      
                        <Earth setLongitude={(long) => setLongitude(long)} setLatitude={(lat) => setLatitude(lat)}/>  
                    </div> 
                    {viewType === pastGamesView && address &&
                        <div className={styles.userActionsContainer}>
                            <div className={styles.startGame} onClick={() => setViewType(currentGameView)}>
                                Join Current Game
                            </div>
                            <FaUser className={styles.userIcon} onClick={() => setViewType(userView)}/>
                        </div>

                    }

                    {/* Game Instances Table */}
                    <div className={styles.gameInfoContainer}>
                        <ExploreTab viewType={viewType} setGameView={(type) => setViewType(type)} longitude={longitude} latitude={latitude} />
                    </div>
                </div>
            </div>
        </div>
    );
}