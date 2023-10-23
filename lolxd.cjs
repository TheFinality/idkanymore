const fs = require('fs');
const https = require('https');

const images = {
  Astra: 'https://static.wikia.nocookie.net/valorant/images/9/9a/Astra_icon.png',
  Breach: 'https://static.wikia.nocookie.net/valorant/images/5/5a/Breach_icon.png',
  Brimstone: 'https://static.wikia.nocookie.net/valorant/images/7/7c/Brimstone_icon.png',
  Chamber: 'https://static.wikia.nocookie.net/valorant/images/e/e6/Chamber_icon.png',
  Crusader: 'https://static.wikia.nocookie.net/valorant/images/a/a8/Crusader_icon.png',
  // Add the rest of the image URLs here
};

const downloadImage = (url, imageName) => {
  const filePath = `public/agentimages/${imageName}.png`;
  const file = fs.createWriteStream(filePath);
  https.get(url, response => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log(`${imageName} downloaded successfully.`);
    });
  }).on('error', err => {
    fs.unlink(filePath, () => console.error(`Error while downloading ${imageName}: ${err.message}`));
  });
};

for (const agent in images) {
  downloadImage(images[agent], agent);
}
