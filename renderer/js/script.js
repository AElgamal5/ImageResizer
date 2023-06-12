const form = document.querySelector("#img-form");
const img = document.querySelector("#img");
const outputPath = document.querySelector("#output-path");
const filename = document.querySelector("#filename");
const heightInput = document.querySelector("#height");
const widthInput = document.querySelector("#width");

function loadImage(e) {
  const file = e.target.files[0];
  console.log(file);

  if (!isImage(file)) {
    showError("Wrong image type");
    return;
  }

  //get images width and height
  const image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = function () {
    widthInput.value = this.width;
    heightInput.value = this.height;
  };

  console.log("FOL");
  form.style.display = "block";
  filename.innerHTML = file.name;
  outputPath.innerText = path.join(os.homedir(), "imageResizer");
}

//send file to main.js
function sendImage(e) {
  e.preventDefault();

  const width = widthInput.value;
  const height = heightInput.value;
  const imagePath = img.files[0].path;

  if (!img.files[0]) {
    showError("Upload image first!");
    return;
  }

  if (width === "" || height === "") {
    showError("Enter width and height first!");
    return;
  }

  //sending using ipcRenderer
  ipcRenderer.send("imageResize", { imagePath, height, width });
}

//on imageResizeDone
ipcRenderer.on("imageResizeDone", () => {
  showSuccess("Image Resized successfully");
});

function isImage(file) {
  const acceptedImageTypes = ["image/gif", "image/png", "image/jpeg"];

  return file && acceptedImageTypes.includes(file.type);
}

function showError(msg) {
  toastify.toast({
    text: msg,
    duration: 5000,
    close: false,
    style: { background: "red", color: "white", textAlign: "center" },
  });
}

function showSuccess(msg) {
  toastify.toast({
    text: msg,
    duration: 5000,
    close: false,
    style: { background: "green", color: "white", textAlign: "center" },
  });
}

img.addEventListener("change", loadImage);
form.addEventListener("submit", sendImage);
