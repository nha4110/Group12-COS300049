import axios from "axios";

const PINATA_API_KEY = "5d8b1175b86f0bee927f";
const PINATA_SECRET_API_KEY = "ec8a03ff57c136893e7777bcd502255d0d0f8e17a738a3163af51c1bfb07242a";

const pinataBaseURL = "https://api.pinata.cloud";

export const uploadToPinata = async (file, fileName) => {
  const formData = new FormData();
  formData.append("file", file);
  
  const metadata = JSON.stringify({
    name: fileName,
  });

  formData.append("pinataMetadata", metadata);
  formData.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

  try {
    const response = await axios.post(`${pinataBaseURL}/pinning/pinFileToIPFS`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
    });

    return response.data.IpfsHash; // Returns the CID (IPFS Hash)
  } catch (error) {
    console.error("Error uploading file to Pinata:", error);
    return null;
  }
};

export const uploadMetadataToPinata = async (metadata) => {
  try {
    const response = await axios.post(`${pinataBaseURL}/pinning/pinJSONToIPFS`, metadata, {
      headers: {
        "Content-Type": "application/json",
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
    });

    return response.data.IpfsHash;
  } catch (error) {
    console.error("Error uploading metadata:", error);
    return null;
  }
};
