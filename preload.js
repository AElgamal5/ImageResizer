const os = require("os");
const path = require("path");
const toastify = require("toastify-js");

const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("os", {
  homedir: () => os.homedir(),
});

contextBridge.exposeInMainWorld("path", {
  join: (...args) => path.join(...args),
});

contextBridge.exposeInMainWorld("toastify", {
  toast: (options) => toastify(options).showToast(),
});
