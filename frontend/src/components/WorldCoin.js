"use client"

import { useAccount } from 'wagmi';
import { IDKitWidget, VerificationLevel } from '@worldcoin/idkit';
import XMarksABI from '../abi/XMarks.json'; 
import { readContract } from '@wagmi/core'
import { useEffect, useState } from 'react';
import { backendUrl, contractAddress } from '@/config/config';
import axios from 'axios';

export default function WorldCoin() {
    const { address, isConnected, isConnecting } = useAccount();
    const [isWalletVerified, setIsWalletVerified] = useState("loading");
 
    useEffect(() => {
        async function fetchData() {
            const result = await readContract({
                abi: XMarksABI,
                address: contractAddress,
                functionName: 'verifiedWallets',
                args: [address],
                chainId: 421614
            });
            setIsWalletVerified(result);
        }
        if (address !== 0 && address) {
            fetchData();
        }
    }, [address]);

    console.log(address);

    const verifyProof = async (proof) => {
        console.log(proof);
        let res = await axios.post(`${backendUrl}/verifyProof`, {proof: proof, address: address});
        console.log(res);
        if (res.data.type === "success") {
            setIsWalletVerified(true);
        }
    };
      
      // TODO: Functionality after verifying
      const onSuccess = () => {
        console.log("Success")
      };

    return (
        address ?
            <>
                {isWalletVerified === false ?
                    <div>
                        <IDKitWidget
                            app_id="app_staging_d135904cf1cc197cb139db7992f44ac6"
                            action="identity"
                            false
                            verification_level={VerificationLevel.Device}
                            handleVerify={verifyProof}
                            onSuccess={onSuccess}>
                            {({ open }) => (
                                <button
                                onClick={open} style={{zIndex: 100, color: "black", backgroundColor: "white", padding: "9.5px 12px", borderRadius: 8, fontSize: 13}} >
                                    Verify with <b>World ID</b>
                                </button>
                                )}
                        </IDKitWidget>
                    </div>
                :
                    <div style={{zIndex: 100, color: "black", backgroundColor: "white", padding: "9.5px 12px", borderRadius: 8, fontSize: 13}} >
                        World ID Verified
                    </div>
                }
            </>
        : null
    );
}