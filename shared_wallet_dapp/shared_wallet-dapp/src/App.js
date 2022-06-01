import { useState, useEffect } from 'react';
import { ethers, utils } from "ethers";
import abi from "./contracts/SharedWallet.json";

function App() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isWalletOwner, setIsWalletOwner] = useState(false);
  const [walletOwnerAddress, setWalletOwnerAddress] = useState(null);
  const [currentWalletName, setCurrentWalletName] = useState(null);
  const [inputValue, setInputValue] = useState({ withdraw: "", walletName: "" });
  const [userTotalBalance, setUserTotalBalance] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [error, setError] = useState(null);

  const contractAddress = 'ADDR';
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const account = accounts[0];
        setIsWalletConnected(true);
        setUserAddress(account);
        console.log("Account Connected: ", account);
      } else {
        setError("Please install a MetaMask wallet to use our bank.");
        console.log("No Metamask detected");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getWalletOwnerHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const walletContract = new ethers.Contract(contractAddress, contractABI, signer);

        let owner = await walletContract.walletOwner();
        setWalletOwnerAddress(owner);

        const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });

        if (owner.toLowerCase() === account.toLowerCase()) {
          setIsWalletOwner(true);
        }
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our wallet.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const userBalanceHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const walletContract = new ethers.Contract(contractAddress, contractABI, signer);

        let balance = await walletContract.getBalance();
        setUserTotalBalance(utils.formatEther(balance));
        console.log("Retrieved balance...", balance);

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleInputChange = (event) => {
    setInputValue(prevFormData => ({ ...prevFormData, [event.target.name]: event.target.value }));
  }

  const getWalletName = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const walletContract = new ethers.Contract(contractAddress, contractABI, signer);

        let walletName = await walletContract.walletName();
        walletName = utils.parseBytes32String(walletName);
        setCurrentWalletName(walletName.toString());
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our wallet.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const setWalletNameHandler = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const walletContract = new ethers.Contract(contractAddress, contractABI, signer);

        const txn = await walletContract.setwalletName(utils.formatBytes32String(inputValue.walletName));
        console.log("Setting Wallet Name...");
        await txn.wait();
        console.log("Wallet Name Changed", txn.hash);
        getWalletName();

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const withDrawMoneyHandler = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const walletContract = new ethers.Contract(contractAddress, contractABI, signer);

        let myAddress = await signer.getAddress()
        console.log("provider signer...", myAddress);

        const txn = await walletContract.withdraw(myAddress, ethers.utils.parseEther(inputValue.withdraw));
        console.log("Withdrawing money...");
        await txn.wait();
        console.log("Money with drew...done", txn.hash);

        userBalanceHandler();

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    userBalanceHandler()
  }, [isWalletConnected])

  return (
    <main className="main-container">
      <h2 className="headline"><span className="headline-gradient">Shared Wallet Project</span> 💰</h2>
      <section className="customer-section px-10 pt-5 pb-10">
        {error && <p className="text-2xl text-red-700">{error}</p>}
        <div className="mt-5">
          {currentWalletName === "" && isWalletOwner ?
            <p>"Setup the name of your wallet." </p> :
            <p className="text-3xl font-bold">{currentWalletName}</p>
          }
        </div>
        <div className="mt-10 mb-10">
          <form className="form-style">
            <input
              type="text"
              className="input-style"
              onChange={handleInputChange}
              name="withdraw"
              placeholder="0.0000 ETH"
              value={inputValue.withdraw}
            />
            <button
              className="btn-purple"
              onClick={withDrawMoneyHandler}>
              Withdraw Money In ETH
            </button>
          </form>
        </div>
        <div className="mt-5">
          <p><span className="font-bold">User Balance: </span>{userTotalBalance}</p>
        </div>
        <div className="mt-5">
          {isWalletConnected && <p><span className="font-bold">Your Wallet Address: </span>{userAddress}</p>}
          <button className="btn-connect" onClick={checkIfWalletIsConnected}>
            {isWalletConnected ? "Wallet Connected 🔒" : "Connect Wallet 🔑"}
          </button>
        </div>
      </section>
      {
        isWalletOwner && (
          <section className="bank-owner-section">
            <h2 className="text-xl border-b-2 border-indigo-500 px-10 py-4 font-bold">Wallet Owner Panel</h2>
            <div className="p-10">
              <form className="form-style">
                <input
                  type="text"
                  className="input-style"
                  onChange={handleInputChange}
                  name="walletName"
                  placeholder="Enter a Name for Your Wallet"
                  value={inputValue.walletName}
                />
                <button
                  className="btn-grey"
                  onClick={setWalletNameHandler}>
                  Set Wallet Name
                </button>
              </form>
            </div>
          </section>
        )
      }
    </main>
  );
}

export default App;
