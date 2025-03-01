import { ethers } from "ethers";

const provider = new ethers.providers.Web3Provider(window.ethereum);

export async function getAccount() {
    await provider.send("eth_requestAccounts", []);
    return provider.getSigner();
}
