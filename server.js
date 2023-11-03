const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar"); // Import chokidar
const serveIndex = require("serve-index"); // Import serve-index
require("dotenv").config();
const openai = new OpenAI(process.env.OPENAI_API_KEY);

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const chatHistories = new Map(); // Store chat history for each user

app.use(express.static("public"));
// Serve the 'dev' folder and list its contents when browsing
app.use("/dev", express.static("dev"), serveIndex("dev", { icons: true }));

// Utility functions
function createFile(filePath, content) {
  const fullFilePath = path.join("dev", filePath);
  const dir = path.dirname(fullFilePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(fullFilePath, content);
}

function createFolder(folderPath) {
  const fullFolderPath = path.join("dev", folderPath);
  if (!fs.existsSync(fullFolderPath)) {
    fs.mkdirSync(fullFolderPath, { recursive: true });
  }
}

function updateFile(filePath, content) {
  const fullFilePath = path.join("dev", filePath);
  if (fs.existsSync(fullFilePath)) {
    fs.appendFileSync(fullFilePath, content);
  } else {
    console.error(`File ${fullFilePath} does not exist.`);
  }
}

async function executeTasksFromResponse(response) {
  const functionPattern =
    /(\w+)\(('.*?'|`[\s\S]*?`)\s*,?\s*('?.*?'?|`[\s\S]*?`)?\)/g;
  let match;

  while ((match = functionPattern.exec(response)) !== null) {
    const functionName = match[1];
    const params = match
      .slice(2)
      .filter(Boolean)
      .map((param) => {
        if (param.startsWith("`") && param.endsWith("`")) {
          return param.slice(1, -1); // Remove the backticks for multi-line strings
        }
        return param.replace(/^['"]?(.*?)['"]?$/, "$1").trim();
      });

    switch (functionName) {
      case "createFile":
        if (params.length >= 2) {
          createFile(params[0], params[1]);
        } else {
          console.error(
            `Insufficient parameters for function: ${functionName}`
          );
        }
        break;
      case "createFolder":
        if (params.length >= 1) {
          createFolder(params[0]);
        } else {
          console.error(
            `Insufficient parameters for function: ${functionName}`
          );
        }
        break;
      case "updateFile":
        if (params.length >= 2) {
          updateFile(params[0], params[1]);
        } else {
          console.error(
            `Insufficient parameters for function: ${functionName}`
          );
        }
        break;
      default:
        console.error(`Unknown function: ${functionName}`);
    }
  }
}

io.on("connection", (socket) => {
  console.log("User connected");
  // Initialize chat history with the instruction message
  chatHistories.set(socket.id, [
    {
      role: "system",
      content: `Act as a frontend developer who is working inside of my app and is restricted to using my functions to write code. These functions are the only things that will work so do not write code outside of these function calls. I've created functions createFile(filePath, content), createFolder(folderPath), and updateFile(filePath, content) and every time I make a request you need to call these functions to create the files I need.

        Here is an example of your response:
        createFolder('app');
        createFile('app/index.js',\`
        const express = require('express');
        const app = express();
        const bodyParser = require('body-parser');
        
        // Middleware to parse JSON requests
        app.use(bodyParser.json());
        \`);
    
        And follow these rules:
        1. always create all files needed to run the project.
        2. The project should be within a root folder. give the folder a unique name related to the project.
        3. When adding any dependencies to package.json use the latest version by using *.
        4. create any react project as a html project that can be run in the browser without building.
        5. use CDN for react project dependencies.
        6. import statements will not work in the browser. Include scripts in the html.
        7. use babel cdn to ensure jsx is compiled in the browser.
        8. only code you can provide is the method calls provided and only input string values and no variables. for example for a timestamp you must provide it like this '1699042023651'
        `,
    },
  ]);

  socket.on("message", async (message) => {
    const history = chatHistories.get(socket.id);
    history.push({ role: "user", content: message });

    const aiResponse = await openai.chat.completions.create({
      messages: history,
      model: "gpt-3.5-turbo",
    });

    const responseContent = aiResponse.choices[0].message.content.trim();
    history.push({ role: "assistant", content: responseContent }); // Add AI's response to history

    executeTasksFromResponse(responseContent);
    socket.emit("ai-response", responseContent);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
    chatHistories.delete(socket.id); // Remove chat history when user disconnects
  });
});

// Watch for changes in the 'dev' folder
const watcher = chokidar.watch("dev", {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
});

watcher.on("change", (path) => {
  io.emit("reload"); // Emit a reload event to all clients
});

io.on("connection", (socket) => {
  // ... [rest of the code remains unchanged]
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
