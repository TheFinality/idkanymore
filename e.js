const agents = [
  "Astra",
  "Breach",
  "Brimstone",
  "Chamber",
  "Crusader",
  "Cypher",
  "Deadlock",
  "Fade",
  "Gekko",
  "Jett",
  "KAY/O",
  "Killjoy",
  "Neon",
  "Omen",
  "Phoenix",
  "Raze",
  "Reyna",
  "Sage",
  "Shatter",
  "Skye",
  "Sova",
  "Viper",
  "Yoru"
];

const baseURL = "https://static.wikia.nocookie.net/valorant/images/";
const extension = "_icon.png";

const images = agents.map(agent => {
  return {
    agent: agent,
    url: `${baseURL}${agent.toLowerCase()}/${agent}_icon.png`
  };
});

console.log(images);
