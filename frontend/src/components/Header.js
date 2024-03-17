import React from 'react';
import Image from 'next/image';
import WorldCoin from './WorldCoin';
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { useAccount } from 'wagmi';

const Header = () => {
    const { address, isConnected, isConnecting } = useAccount();

    return (
        <header className="flex justify-between items-center p-5 bg-black relative z-10">
            <div className="logo">
                <Image src= "/xmarks-logo.png" alt="xmarks" width={90} height={150} />
            </div>
            <div style={{position: "absolute", top: address ? 15 : 10, right: 20, display: "flex", gap: 15}}>
                <WorldCoin />
                <DynamicWidget />
            </div>
        </header>
    );
};

export default Header;

