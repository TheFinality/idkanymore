const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const fileUpload = require('express-fileupload'); // Add this line to include file upload functionality
const sharp = require('sharp');

app.use(express.static(__dirname + '/public/setups'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(fileUpload()); // Include the fileUpload middleware
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname);

const agentFilePath = path.join(__dirname, 'agents.json');
const mapFilePath = path.join(__dirname, 'maps.json');

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/main.html');
});

app.get('/lineups', (req, res) => {
  res.sendFile(__dirname + '/public/lineups.html');
});

app.get('/newagent', (req, res) => {
  res.sendFile(__dirname + '/public/newagent.html');
});

app.get('/newmap', (req, res) => {
  res.sendFile(__dirname + '/public/newmap.html');
});

app.get('/addsetups', (req, res) => {
  // Read the JSON data
  const agentData = require(agentFilePath);
  const mapData = require(mapFilePath);

  // Send the HTML file and pass the JSON data to it
  res.render(path.join(__dirname, '/public/addsetups.html'), { agents: agentData, maps: mapData });
});


app.post('/addsetups', (req, res) => {
  const agent = req.body.agent;
  const title = req.body.title;
  const map = req.body.map;

  // Handling the files
  const thumbnail = req.files ? req.files.thumbnail : null;
  const content = req.files ? (Array.isArray(req.files.content) ? req.files.content : [req.files.content]) : [];

  // Directory path
  const dirPath = path.join(__dirname, 'public', 'setups', agent, map, title);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // Storing thumbnail
  if (thumbnail) {
    const thumbnailPath = path.join(dirPath, 'thumbnail.png');
    sharp(thumbnail.data)
      .toFormat('png')
      .toFile(thumbnailPath, (err, info) => {
        if (err) {
          console.error(err);
          res.status(500).send(err);
        }
      });
  }

  // Storing content files
  content.forEach((file, index) => {
    const contentPath = path.join(dirPath, `${index + 1}.png`);
    sharp(file.data)
      .toFormat('png')
      .toFile(contentPath, (err, info) => {
        if (err) {
          console.error(err);
          res.status(500).send(err);
        }
      });
  });

  // Sending a response
  res.redirect('/');
});





app.post('/newagent', (req, res) => {
  const agent = req.body.agent; // Get the agent from the form

  // Read the existing JSON data from agents.json
  fs.readFile(agentFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('An error occurred while reading the data.');
    } else {
      let agents = JSON.parse(data);

      // Add the new agent to the agents array
      agents.push({ name: agent });

      // Write the updated agents array back to agents.json file
      fs.writeFile(agentFilePath, JSON.stringify(agents, null, 2), 'utf8', (err) => {
        if (err) {
          console.error(err);
          res.status(500).send('An error occurred while saving the agent data.');
        } else {
          res.redirect('/'); // Redirect to the main page
        }
      });
    }
  });
});

app.post('/newmap', (req, res) => {
  const map = req.body.map; // Get the map from the form

  // Read the existing JSON data from maps.json
  fs.readFile(mapFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('An error occurred while reading the data.');
    } else {
      let maps = JSON.parse(data);

      // Add the new agent to the agents array
      maps.push({ name: map });

      // Write the updated agents array back to agents.json file
      fs.writeFile(mapFilePath, JSON.stringify(maps, null, 2), 'utf8', (err) => {
        if (err) {
          console.error(err);
          res.status(500).send('An error occurred while saving the map data.');
        } else {
          res.redirect('/'); // Redirect to the main page
        }
      });
    }
  });
});

app.get('/setups/:agent', (req, res) => {
  const agent = req.params.agent;
  const setupsDir = path.join(__dirname, 'public', 'setups', agent);

  // Read the contents of the directory
  fs.readdir(setupsDir, (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error reading setups directory');
    } else {
      const subfolders = files.filter(file => fs.lstatSync(path.join(setupsDir, file)).isDirectory());
      console.log(subfolders);
      res.render(path.join(__dirname, '/public/setupmaps.html'), { maps: subfolders, agent: agent });
      // Use the subfolders array as needed
    }
  });
});

app.get('/setups/:agent/:map', (req, res) => {
  const agent = req.params.agent;
  const map = req.params.map;
  const setupsDir = path.join(__dirname, 'public', 'setups', agent, map);

  // Read the contents of the directory
  fs.readdir(setupsDir, (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error reading setups directory');
    } else {
      const foldersWithFiles = {};
      files.forEach((file) => {
        const filePath = path.join(setupsDir, file);
        if (fs.lstatSync(filePath).isDirectory()) {
          const filesInFolder = fs.readdirSync(filePath).filter((f) => !fs.lstatSync(path.join(filePath, f)).isDirectory());
          foldersWithFiles[file] = filesInFolder;
        }
      });
      console.log(foldersWithFiles)
      res.render(path.join(__dirname, '/public/ssetups.html'), { agent: agent, data: foldersWithFiles, map: map });
    }
  });
});

app.get('/setupmaps', (req, res) => {
  const maps = require(mapFilePath);
  res.render(path.join(__dirname, '/public/setupmaps.html'), { maps: maps });
});

app.get('/setups', (req, res) => {
  // Read the JSON data
  const jsonData = require(agentFilePath);

  // Send the HTML file and pass the JSON data to it
  res.render(path.join(__dirname, '/public/setups.html'), { agents: jsonData });
});

app.get('/admin', (req, res) => {
  res.sendFile(__dirname + '/public/admin.html');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});