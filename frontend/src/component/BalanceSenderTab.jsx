import { useState } from "react";
import { ethers } from "ethers"; // Import ethers

const BalanceSenderTab = ({ walletAddress, web3, fetchBalance, balance }) => {
  const [recipient, setRecipient] = useState(""); // Allow user to input recipient
  const [amount, setAmount] = useState(""); // Allow user to input amount

  const transferETH = async () => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      alert("Please log in to continue.");
      return;
    }

    try {
      const txHash = await initiateMetaMaskTransfer(recipient, amount);
      if (!txHash) throw new Error("Transaction cancelled or failed");

      const sender = await getCurrentAccount();
      if (!sender) throw new Error("Failed to fetch sender address");

      if (sender.toLowerCase() !== walletAddress.toLowerCase()) {
        throw new Error("Sender address does not match logged-in wallet address");
      }

      const response = await fetch("http://localhost:8081/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          sender_address: sender,
          recipient_address: recipient,
          amount_eth: amount,
          tx_hash: txHash,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Transfer failed");

      alert("Transfer logged successfully!");
      console.log("Transfer successful:", data);

      if (fetchBalance) {
        fetchBalance(walletAddress);
      }
    } catch (error) {
      console.error("Transfer error:", error.message);
      if (error.message.includes("Token expired")) {
        alert("Session expired. Please log in again");
        localStorage.removeItem("jwtToken");
      } else {
        alert(`Error: ${error.message}`);
      }
    }
  };

  const getCurrentAccount = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        return accounts[0];
      } catch (error) {
        console.error("Error fetching account:", error);
        return null;
      }
    }
    return null;
  };

  const initiateMetaMaskTransfer = async (recipient, amount) => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return null;
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const sender = accounts[0];

      if (!recipient || !recipient.match(/^0x[a-fA-F0-9]{40}$/)) {
        alert("Invalid recipient address");
        return null;
      }

      const amountEth = parseFloat(amount);
      if (isNaN(amountEth) || amountEth <= 0) {
        alert("Invalid amount: Must be a positive number");
        return null;
      }

      const currentBalance = parseFloat(balance);
      if (isNaN(currentBalance) || currentBalance < amountEth) {
        alert(`Insufficient balance: You have ${currentBalance} ETH, but tried to send ${amountEth} ETH`);
        return null;
      }

      let weiValue;
      if (ethers && ethers.utils && ethers.utils.parseEther) {
        weiValue = ethers.utils.parseEther(amount.toString()).toString();
        console.log(`Converted ${amount} ETH to ${weiValue} Wei using ethers.utils.parseEther`);
      } else if (ethers && ethers.parseEther) {
        weiValue = ethers.parseEther(amount.toString()).toString();
        console.log(`Converted ${amount} ETH to ${weiValue} Wei using ethers.parseEther`);
      } else {
        weiValue = Math.floor(amountEth * 1e18).toString();
        console.log(`Converted ${amount} ETH to ${weiValue} Wei using manual conversion`);
      }

      const tx = {
        from: sender,
        to: recipient,
        value: weiValue,
        gasLimit: "0x5208", // Hex for 21000
      };

      console.log("Transaction object:", tx); // Debug the full transaction object
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [tx],
      });

      console.log("Transaction sent:", txHash);
      return txHash;
    } catch (error) {
      console.error("MetaMask error:", error.message);
      if (error.code === 4001) {
        alert("Transaction cancelled by user");
      } else if (error.code === -32603) {
        alert("Transaction failed: Insufficient funds or network error");
      } else {
        alert(`MetaMask error: ${error.message}`);
      }
      return null;
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Recipient Address (e.g., 0x574779E506d27EE70330C13D911881310543dbed)"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
      />
      <input
        type="number"
        placeholder="Amount (ETH)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        step="0.01"
      />
      <button onClick={transferETH}>Send ETH</button>
    </div>
  );
};

export default BalanceSenderTab;