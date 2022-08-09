// Base URI + tokenId
// BaseURI = https://example.com
// tokenId = 1
// tokenURI(1) => https://example.com/1


export default function handler(req, res) {
  const tokenId = req.query.tokenId;

  const name = `0xGammaNFT ${tokenId}`;
  const description = `A new and beautiful NFT collection`;
  const image =`/${Number(tokenId)-1}.svg`;

  res.status(200).json({
    name: name,
    description: description,
    image: image,
  });

}
