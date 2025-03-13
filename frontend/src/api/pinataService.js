import axios from "axios";

const PINATA_API_KEY = "5d8b1175b86f0bee927f";
const PINATA_SECRET_API_KEY = "ec8a03ff57c136893e7777bcd502255d0d0f8e17a738a3163af51c1bfb07242a";

export const uploadToPinata = async (file, fileName, folder = "") => {
  const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
  const formData = new FormData();
  formData.append("file", file, fileName);

  if (folder) {
    formData.append("pinataMetadata", JSON.stringify({ name: `${folder}/${fileName}` }));
  } else {
    formData.append("pinataMetadata", JSON.stringify({ name: fileName }));
  }

  try {
    const response = await axios.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
    });
    return response.data.IpfsHash;
  } catch (error) {
    console.error("Pinata upload error:", error);
    return null;
  }
};