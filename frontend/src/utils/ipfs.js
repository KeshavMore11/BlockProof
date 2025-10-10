import axios from 'axios';

// Pinata configuration
const PINATA_API_KEY = process.env.REACT_APP_PINATA_API_KEY || 'your_pinata_api_key';
const PINATA_SECRET_KEY = process.env.REACT_APP_PINATA_SECRET_KEY || 'your_pinata_secret_key';

export const uploadToIPFS = async (file) => {
  try {
    // Create FormData
    const formData = new FormData();
    formData.append('file', file);
    
    // Pinata metadata
    const metadata = JSON.stringify({
      name: file.name,
      description: 'Certificate file uploaded via BlockCerti'
    });
    formData.append('pinataMetadata', metadata);
    
    // Pinata options
    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', options);

    // Upload to Pinata
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error('Failed to upload file to IPFS');
  }
};

export const getIPFSFile = (hash) => {
  return `https://ipfs.io/ipfs/${hash}`;
};

export const getPinataGatewayFile = (hash) => {
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
};

