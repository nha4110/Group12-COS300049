export const checkConnection = async (setAccount, loggedInWallet, setWalletMismatch) => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          if (loggedInWallet && accounts[0].toLowerCase() !== loggedInWallet.toLowerCase()) {
            console.warn("MetaMask account differs from logged-in wallet:", accounts[0], loggedInWallet);
            setWalletMismatch(true);
          } else {
            setWalletMismatch(false);
          }
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    }
  };
  
  export const handleAccountsChanged = (accounts, setAccount, loggedInWallet, setWalletMismatch, loadCollectionsFromCacheOrFetch) => {
    console.log("MetaMask accounts changed:", accounts);
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      if (loggedInWallet && accounts[0].toLowerCase() !== loggedInWallet.toLowerCase()) {
        console.warn("MetaMask account differs from logged-in wallet:", accounts[0], loggedInWallet);
        setWalletMismatch(true);
      } else {
        setWalletMismatch(false);
      }
      loadCollectionsFromCacheOrFetch();
    } else {
      setAccount(null);
      setWalletMismatch(false);
    }
  };
  
  export const connectMetaMask = async (setAccount, loggedInWallet, setWalletMismatch) => {
    if (!window.ethereum) return alert("MetaMask not detected!");
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      if (loggedInWallet && accounts[0].toLowerCase() !== loggedInWallet.toLowerCase()) {
        setWalletMismatch(true);
      } else {
        setWalletMismatch(false);
      }
    } catch (error) {
      console.error("MetaMask connection error:", error);
      alert("Failed to connect to MetaMask.");
    }
  };