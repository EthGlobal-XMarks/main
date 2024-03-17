import { DynamicContextProvider, FilterAndSortWallets } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { EthersExtension } from "@dynamic-labs/ethers-v5";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import MainComponent from "@/components/MainComponent";

export default function Home() {
    return (
        <DynamicContextProvider 
        settings={{ 
            environmentId: "56b68d0e-308f-4bde-a7d6-ca7a9a16f1de", 
            walletsFilter: FilterAndSortWallets(
            [
                "metamask",
                "coinbase",
                "walletconnect"
            ]
            ),
            multiwallet: true,
            walletConnectors: [EthereumWalletConnectors],
            walletConnectorExtensions: [EthersExtension]
        }}> 
            <DynamicWagmiConnector>
                <MainComponent />
            </DynamicWagmiConnector>
        </DynamicContextProvider>
        
    );
}