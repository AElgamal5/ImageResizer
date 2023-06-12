const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const path = require("path");
const os = require("os");
const fs = require("fs");
const resizeImg = require("resize-img");

process.env.NODE_ENV = "production";

const isDev = process.env.NODE_ENV !== "production";
const isMac = process.platform === "darwin";
let mainWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "Image Resizer",
    width: isDev ? 1000 : 500,
    height: 600,
    webPreferences: {
      //for node_modules
      contextIsolation: true,
      nodeIntegration: true,

      //for preload
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadFile(path.join(__dirname, "renderer", "index.html"));
}

function createAboutWindow() {
  const aboutWindow = new BrowserWindow({
    title: "About Image Resizer",
    width: 300,
    height: 400,
  });

  aboutWindow.loadFile(path.join(__dirname, "renderer", "about.html"));
}

app.whenReady().then(() => {
  createMainWindow();

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  //remove mainWindow on close to free memory
  mainWindow.on("closed", () => (mainWindow = null));

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

//menu template
const menu = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
  {
    role: "fileMenu",
  },
  ...(!isMac
    ? [
        {
          label: "Help",
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
  // {
  //   label: 'File',
  //   submenu: [
  //     {
  //       label: 'Quit',
  //       click: () => app.quit(),
  //       accelerator: 'CmdOrCtrl+W',
  //     },
  //   ],
  // },
  ...(isDev
    ? [
        {
          label: "Developer",
          submenu: [
            { role: "reload" },
            { role: "forcereload" },
            { type: "separator" },
            { role: "toggledevtools" },
          ],
        },
      ]
    : []),
];

// receiving date from ipcRenderer
ipcMain.on("imageResize", (e, options) => {
  options.destination = path.join(os.homedir(), "imageResizer");
  resizerImage(options);
});

async function resizerImage({ imagePath, height, width, destination }) {
  try {
    const newImage = await resizeImg(fs.readFileSync(imagePath), {
      width: +width,
      height: +height,
    });

    const newImageName = path.basename(imagePath);

    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination);
    }

    fs.writeFileSync(path.join(destination, newImageName), newImage);

    //success alert
    mainWindow.webContents.send("imageResizeDone");

    //open the destination dir
    shell.openPath(destination);
  } catch (error) {
    console.log(error);
  }
}

app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit();
  }
});
