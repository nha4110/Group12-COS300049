{/*
Lu Nhat Hoang -  105234956
Nguyen Ngoc Huy Hoang - 105514373
Chung Dung Toan - 105514412
Le Anh Tuan - 105011586
*/ }
import axios from "axios";

const PINATA_API_KEY = "5d8b1175b86f0bee927f";
const PINATA_SECRET_API_KEY = "ec8a03ff57c136893e7777bcd502255d0d0f8e17a738a3163af51c1bfb07242a";
const PINATA_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";

export const uploadToPinata = async (formData, name, group) => {
  try {
    let price = "0.5"; // Default price if not provided

    // Log FormData contents
    for (let [key, value] of formData.entries()) {
      console.log(`FormData entry: ${key} = ${value.name || value}`);
      if (key === "price") {
        price = value; // Set price from FormData
      }
    }

    const response = await axios.post(PINATA_URL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
      params: {
        pinataMetadata: JSON.stringify({
          name: `${group}_${name}`, // e.g., "invincible_6_collection"
          price: price, // Include price in metadata
        }),
        pinataOptions: JSON.stringify({
          cidVersion: 1,
          wrapWithDirectory: true, // Group files in a directory
        }),
      },
    });
    return { IpfsHash: response.data.IpfsHash };
  } catch (error) {
    console.error("Pinata upload error:", error.response?.data || error.message);
    throw new Error(`Pinata upload failed: ${error.message}`);
  }
};
