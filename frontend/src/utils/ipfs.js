import axios from 'axios';

const JWT = process.env.REACT_APP_PINATA_JWT;

export const uploadToIPFS = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const metadata = JSON.stringify({
      name: file.name,
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', options);

    const res = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          Authorization: `Bearer ${JWT}`,
        },
      }
    );

    return res.data.IpfsHash;

  } catch (error) {
    console.error(error);
    throw new Error('Upload failed');
  }
};