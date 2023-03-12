// global selections
const colorDivs = document.querySelectorAll('.color');
const generateBtn = document.querySelector('.generate');
const lockButtons = document.querySelectorAll('.lock');
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll('.color h2');
const copyContainer = document.querySelector('.copy-container');
const adjustButtons = document.querySelectorAll('.adjust');
const closeAdjustmentButtons = document.querySelectorAll('.close-adjustment');
const sliderContainers = document.querySelectorAll('.sliders');
let initialColors;
let savedPalettes = [];
const saveBtn = document.querySelector('.save');
const submitSave = document.querySelector('.submit-save');
const closeSave = document.querySelector('.close-save');
const saveContainer = document.querySelector('.save-container');
const saveInput = document.querySelector('.save-container input');
const libraryContainer = document.querySelector('.library-container');
const libraryBtn = document.querySelector('.library');
const closeLibraryBtn = document.querySelector('.close-library');

// functions
function randomColors() {
  initialColors = [];
  colorDivs.forEach((div) => {
    const hexText = div.children[0];
    const icons = div.querySelectorAll('.controls button');
    const randomColor = randomHexColor();

    if (div.classList.contains('locked')) {
      initialColors.push(hexText.innerText);
      return;
    }

    div.style.backgroundColor = randomColor;
    hexText.innerText = randomColor;
    initialColors.push(randomColor.hex());

    //update text and icons according contrast
    const contrastColor = getTextContrastColor(randomColor);
    hexText.style.color = contrastColor;

    icons.forEach((icon) => {
      icon.style.color = contrastColor;
    });

    const sliders = div.querySelectorAll('.sliders input');
    const hueSlider = sliders[0];
    const ligSlider = sliders[1];
    const satSlider = sliders[2];

    colorizeSliders(randomColor, hueSlider, satSlider, ligSlider);
  });
  resetInputs();
}

//generate  colors
function randomHexColor() {
  const hexColor = chroma.random();
  return hexColor;
}

// get contrast color for text and icons
function getTextContrastColor(randomColor) {
  const luminance = chroma(randomColor).luminance();
  if (luminance > 0.5) {
    return 'black';
  }
  return 'white';
}

//set color to sliders controls
function colorizeSliders(color, hue, saturation, brightness) {
  const midBright = color.set('hsl.l', 0.5);
  const scaleBrightness = chroma.scale(['black', midBright, 'white']);

  const noSaturation = color.set('hsl.s', 0);
  const fullSaturation = color.set('hsl.s', 1);
  const scaleSaturation = chroma.scale([noSaturation, color, fullSaturation]);

  hue.style.backgroundImage = `linear-gradient(to right, rgb(191,64,64), rgb(191,191,64), rgb(64,191,64),rgb(64,191,191),rgb(64,64,191),rgb(191,64,191),rgb(191,64,64))`;

  brightness.style.backgroundImage = `linear-gradient(to right,${scaleBrightness(
    0
  )},${scaleBrightness(0.5)},${scaleBrightness(1)})`;
  saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSaturation(
    0
  )},${scaleSaturation(1)})`;
}

function hslControls(e) {
  const index =
    e.target.getAttribute('data-hue') ||
    e.target.getAttribute('data-bright') ||
    e.target.getAttribute('data-saturation');

  //recuperarndo los 3 sliders del color
  const sliders = e.target.parentElement.querySelectorAll(
    'input[type="range"]'
  );

  const hueSlider = sliders[0];
  const ligSlider = sliders[1];
  const satSlider = sliders[2];
  const bgColor = initialColors[index];

  //generarndo nuevo color
  let color = chroma(bgColor)
    .set('hsl.h', hueSlider.value)
    .set('hsl.s', satSlider.value)
    .set('hsl.l', ligSlider.value);

  colorDivs[index].style.backgroundColor = color;

  colorizeSliders(color, hueSlider, satSlider, ligSlider);
}

function updateTextUI(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  const icons = activeDiv.querySelectorAll('.controls button');
  const textHex = activeDiv.querySelector('h2');

  textHex.innerText = color.hex();
  textHex.style.color = getTextContrastColor(color);

  icons.forEach((icon) => {
    icon.style.color = getTextContrastColor(color);
  });
}

function resetInputs() {
  sliders.forEach((slider) => {
    if (slider.name === 'hue') {
      const color = initialColors[slider.getAttribute('data-hue')];
      slider.value = chroma(color).get('hsl.h');
    }

    if (slider.name == 'brightness') {
      const color = initialColors[slider.getAttribute('data-bright')];
      slider.value = chroma(color).get('hsl.l');
    }

    if (slider.name === 'saturation') {
      const color = initialColors[slider.getAttribute('data-saturation')];
      slider.value = chroma(color).get('hsl.s');
    }
  });
}

function copyToClipboard(hex) {
  const tempElement = document.createElement('textarea');
  tempElement.value = hex.innerText;
  document.body.appendChild(tempElement);
  tempElement.select();
  document.execCommand('copy'); //try using clipboard api instead
  document.body.removeChild(tempElement);

  copyContainer.classList.add('active');
  copyContainer.children[0].classList.add('active');
}

function openAdjustmentPanel(index) {
  sliderContainers[index].classList.toggle('active');
}

function closeAdjustmentPanel(index) {
  sliderContainers[index].classList.remove('active');
}

function lockLayer(e, index) {
  const lockIcon = e.target.children[0];
  const activeDiv = colorDivs[index];

  activeDiv.classList.toggle('locked');

  if (lockIcon.classList.contains('fa-lock-open')) {
    e.target.innerHTML = '<i class="fas fa-lock"></i>';
  } else {
    e.target.innerHTML = '<i class="fas fa-lock-open"></i>';
  }
}

function openSavePalette(e) {
  const popupSave = saveContainer.children[0];
  saveContainer.classList.add('active');
  popupSave.classList.add('active');
}

function closeSavePalette(e) {
  //using the object without any variable or constant
  saveContainer.children[0].classList.remove('active');
  saveContainer.classList.remove('active');
}

function openLibrary() {
  libraryContainer.children[0].classList.add('active');
  libraryContainer.classList.add('active');
}

function closeLibrary() {
  libraryContainer.children[0].classList.remove('active');
  libraryContainer.classList.remove('active');
}

function savePalette(e) {
  const name = saveInput.value;
  const colors = [];

  currentHexes.forEach((hex) => {
    colors.push(hex.innerText);
  });

  //create objet to save
  const paletteObject = {
    name,
    colors,
    id: savedPalettes.length,
  };

  savedPalettes.push(paletteObject);
  //save to local storage, to improve refactoring saving the array already we have instead of object
  saveToLocal(paletteObject);
  closeSavePalette(e);
  saveInput.value = '';

  //generate library
  crateItemLibrary(paletteObject);
}

function crateItemLibrary(paletteObj) {
  const palette = document.createElement('div');
  palette.classList.add('custom-palette');
  const title = document.createElement('h4');
  title.innerText = paletteObj.name;
  const preview = document.createElement('div');
  preview.classList.add('small-preview');

  paletteObj.colors.forEach((color) => {
    const smallDiv = document.createElement('div');
    smallDiv.style.backgroundColor = color;
    preview.appendChild(smallDiv);
  });

  const paletteBtn = document.createElement('button');
  paletteBtn.classList.add('pick-palette-btn');
  paletteBtn.classList.add(paletteObj.id);
  paletteBtn.innerText = 'Select';

  paletteBtn.addEventListener('click', (e) => {
    closeLibrary();
    initialColors = [];
    const paletteIndex = e.target.classList[1];

    savedPalettes[paletteIndex].colors.forEach((color, index) => {
      initialColors.push(color);
      colorDivs[index].style.backgroundColor = color;
      colorDivs[index].children[0].innerText = color;

      updateTextUI(index);

      const sliders = colorDivs[index].querySelectorAll('.sliders input');
      const hueSlider = sliders[0];
      const ligSlider = sliders[1];
      const satSlider = sliders[2];

      colorizeSliders(chroma(color), hueSlider, satSlider, ligSlider);
    });

    resetInputs();
  });

  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(paletteBtn);

  libraryContainer.children[0].appendChild(palette);
}

function saveToLocal(palette) {
  let localPalettes;
  if (localStorage.getItem('palettes') === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem('palettes'));
  }
  localPalettes.push(palette);
  localStorage.setItem('palettes', JSON.stringify(localPalettes));
}

function getLocal() {
  if (localStorage.getItem('palettes') === null) {
    localPalettes = [];
  } else {
    const localPalettes = JSON.parse(localStorage.getItem('palettes'));
    savedPalettes = [...localPalettes];

    localPalettes.forEach((palette) => {
      crateItemLibrary(palette);
    });
  }
}

//event listeners

sliders.forEach((slider) => {
  slider.addEventListener('input', hslControls); //actualiza colores cambiar nombre luego
});

colorDivs.forEach((div, index) => {
  div.addEventListener('change', () => {
    updateTextUI(index);
  });
});

currentHexes.forEach((hex) => {
  hex.addEventListener('click', function () {
    copyToClipboard(this);
  });
});

copyContainer.addEventListener('transitionend', function () {
  copyContainer.children[0].classList.remove('active');
  copyContainer.classList.remove('active');
});

adjustButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    openAdjustmentPanel(index);
  });
});

closeAdjustmentButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    closeAdjustmentPanel(index);
  });
});

lockButtons.forEach((button, index) => {
  button.addEventListener('click', (e) => {
    lockLayer(e, index);
  });
});

libraryBtn.addEventListener('click', openLibrary);
closeLibraryBtn.addEventListener('click', closeLibrary);
generateBtn.addEventListener('click', randomColors);
saveBtn.addEventListener('click', openSavePalette);
closeSave.addEventListener('click', closeSavePalette);
submitSave.addEventListener('click', savePalette);

getLocal();
randomColors();
