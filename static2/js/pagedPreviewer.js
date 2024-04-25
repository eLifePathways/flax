(() => {
  // js/modules/config.js
  var config;
  var config_default = config = window.pagedMakerConfig || {
    content: "body",
    stylesheet: void 0,
    hooks: void 0,
    button: ".pagedPreviewer-button-modal",
    features: [
      "pageSize",
      "pageMargins",
      "fontFamily",
      "fontSize",
      "lineHeight",
      "backgroundColor",
      "textColor"
    ],
    uicolor: void 0
  };

  // js/modules/utils.js
  async function delay(time) {
    return new Promise((resolve, reject) => {
      if (isNaN(time)) {
        reject(new Error("delay requires a valid number"));
      } else {
        setTimeout(resolve, time);
      }
    });
  }
  function print2(e) {
    e.preventDefault();
    var t = document.querySelector(".pagedPreviewer-previewFrame").contentWindow;
    t.focus(), t.print();
  }

  // js/modules/getValues.js
  function getValue(input) {
    const suffix = input.dataset.sizing || "";
    return `${input.dataset.cssProp}: ${input.value}${suffix};`;
  }
  function getMargins() {
    let marginObject = "@page { margin: ";
    document.querySelectorAll(".pagedPreviewer-marginUpdate").forEach((mr) => {
      marginObject = marginObject + ` ${mr.value + mr.dataset.sizing}`;
    });
    marginObject = marginObject + "}";
    return marginObject;
  }
  function getPageSize() {
    let pageSize2 = `@page { size: ${document.querySelector("select.pagedSize").value}; }`;
    return pageSize2;
  }

  // js/modules/baseStylesheet.js
  var baseStylesheet_default = `

@import url('https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,400;0,500;1,400;1,500&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&display=swap');
@media print {

.pagedPreviewer-modal, .pagedPreviewer-button-modal {
    display: none;
}

body, html {
    margin: 0;
    padding: 0;
}

body { 
    ${config_default.features.includes("fontFamily") ? "font-family: var(--fontBody, sans-serif);" : ""}
    ${config_default.features.includes("fontSize") ? "font-size: var(--fontSize, 14px);" : ""}
    ${config_default.features.includes("lineHeight") ? "line-height: var(--lineHeight, 1.4);" : ""}
    ${config_default.features.includes("textColor") ? "color: var(--body-color);" : ""}

    
    
     
} 
 
@page { 
    ${config_default.features.includes("backgroundColor") ? "background: var(--background-color);" : ""}
    @bottom-right{
        content: counter(page) "/" counter(pages);
    }
    @bottom-left {
        content: string(text)
    }
}

title {
    string-set: title string(text);
}



h1,h2 { 
    
    text-transform: uppercase;
    border-bottom: 1px solid black;
}

}

`;

  // js/modules/pagedmakerCSS.js
  var pagedmakerCSS_default = `


/* Change the look */
:root{
    --color-background:  transparent;
    --color-pageBox: #666;
    --color-paper: white;
    --color-marginBox: transparent;
  }
  
  
  /* To define how the book look on the screen: */
  @media screen {
    body {
        background-color: var(--color-background);
    }
    .pagedjs_pages {
        display: flex;
        width: calc(var(--pagedjs-width) * 2);
        flex: 0;
        flex-wrap: wrap;
        margin: 0 auto;
    }
    .pagedjs_page {
        box-shadow: 0 0 0 1px var(--color-pageBox);
        margin: 0;
        flex-shrink: 0;
        flex-grow: 0;
        margin-top: 10mm;
    }
    .pagedjs_first_page {
        margin-left: var(--pagedjs-width);
    }
  
    .pagedjs_page:last-of-type{ 
        margin-bottom: 10mm;
    }
  
  
    /* show the margin-box */
  
    .pagedjs_margin-top-left-corner-holder,
    .pagedjs_margin-top,
    .pagedjs_margin-top-left,
    .pagedjs_margin-top-center,
    .pagedjs_margin-top-right,
    .pagedjs_margin-top-right-corner-holder,
    .pagedjs_margin-bottom-left-corner-holder,
    .pagedjs_margin-bottom,
    .pagedjs_margin-bottom-left,
    .pagedjs_margin-bottom-center,
    .pagedjs_margin-bottom-right,
    .pagedjs_margin-bottom-right-corner-holder,
    .pagedjs_margin-right,
    .pagedjs_margin-right-top,
    .pagedjs_margin-right-middle,
    .pagedjs_margin-right-bottom,
    .pagedjs_margin-left,
    .pagedjs_margin-left-top,
    .pagedjs_margin-left-middle,
    .pagedjs_margin-left-bottom{
        box-shadow: 0 0 0 1px inset var(--color-marginBox);
    }
  
  }
  
  
  
  
  
  @media screen {
  
      .pagedjs_pages {
          flex-direction: column;
          width: 100%;
      }
    
      .pagedjs_first_page {
          margin-left: 0;
      }
    
      .pagedjs_page {
          margin: 10mm auto 5mm;          
      }
    
    }

    /*   to show/hide page number in the margin boxes  */

    body {
        --color-margins: orange;
    }


    .pagedjs_margin-top-left-corner:hover, 
    .pagedjs_margin-top-right-corner:hover,
    .pagedjs_margin-bottom-left-corner:hover, 
    .pagedjs_margin-bottom-right-corner:hover,

    .pagedjs_margin-top-left:hover,
    .pagedjs_margin-top-center:hover,
    .pagedjs_margin-top-right:hover,

    .pagedjs_margin-bottom-left:hover, 
    .pagedjs_margin-bottom-center:hover,
    .pagedjs_margin-bottom-right:hover,
    
    .pagedjs_margin-left-top:hover, 
    .pagedjs_margin-left-middle:hover,
    .pagedjs_margin-left-bottom:hover, 
    
    .pagedjs_margin-right-top:hover,
    .pagedjs_margin-right-middle:hover,
    .pagedjs_margin-right-bottom:hover {
        background: grey;
    }
`;

  // js/modules/uicss.js
  var uicss_default = `
@import url('https://fonts.googleapis.com/css2?family=Jost:wght@100&display=swap');



.pagedPreviewer-modal {
  color: black;
  font-family: sans-serif;
  font-weight:400;
  font-size: 18px;
  display: grid;
  position: fixed;
  margin: auto;
  top: 5vh;
  right: 5vw; 
  bottom: 5vh;
  left: 5vw;
  /* border: 2px solid black; */
  grid-template-columns: 1fr 5fr;
  padding: 0;
  background: white;
  z-index: 99999999999999999999999999999;
  background: white;
  border: 3px solid black;
  box-shadow: 0 0 0 10vw rgba(0,0,0,0.6);
  overflow-y: hidden;
}

.pagedPreviewer-modal .logo {
    height: 40px;
}

.pagedPreviewer-button-close {
    position: absolute;
    right: 2em;
    top: 2em;
}

.pagedPreviewer-hidden {
  display: none;
}

.pagedPreviewer-blocked {
     overflow: hidden;
}




.pagedPreviewer-item {
    margin-bottom: 2em;
}

.pagedPreviewer-modal label  {
    text-transform: uppercase;
    display: block;
}

.pagedPreviewer-preview {
}

.pagedPreviewer-previewFrame {
    border: none;
  height: 100%;
  width: 100%;
  max-width: unset;
  max-height: unset;
}

.pagedPreviewer-form {
    padding: 2em;
}

.pagedMaker-hyde {
  display: none;  
}
`;

  // js/modules/features/class.js
  var Control = class {
    constructor(name, render) {
      this.name = name;
      this.render = render;
    }
    updateControl() {
      this.addEventListener("change", console.log(value));
    }
  };

  // js/modules/features/pageSize.js
  var pageSize = new Control();
  pageSize.name = "pageSize";
  pageSize.render = `<label class="pagedSize" for="page-size">page size</label>
<select name="page-size" id="page-size" class="pagedSize">
    <option value="A4">A4</option>
    <option value="A5">A5</option>
    <option value="letter">Letter</option>
    <option value="6in 9in">atla</option>
    <option value="200mm 200mm">20cm \xD7 20cm</option>
</select>`;
  var pageSize_default = pageSize;

  // js/modules/features/pageMargins.js
  var pageMargins = new Control();
  pageMargins.name = "pageMargins";
  pageMargins.render = `<label for="marginTop">margin-top</label>
    <input class="pagedPreviewer-marginUpdate" id="margin-top" name="marginTop" value="10" data-sizing="mm">
    <label for="marginRight">margin-right</label>
    <input class="pagedPreviewer-marginUpdate" id="margin-right" name="marginRight" value="10" data-sizing="mm">
    <label for="marginBottom">margin-bottom</label>
    <input class="pagedPreviewer-marginUpdate" id="margin-bottom" name="marginBottom" value="10" data-sizing="mm">
    <label for="marginLeft">margin-left</label>
    <input class="pagedPreviewer-marginUpdate" id="margin-left" name="marginLeft" value="10" data-sizing="mm">`;
  var pageMargins_default = pageMargins;

  // js/modules/features/fontFamily.js
  var fontFamily = new Control();
  fontFamily.name = "fontFamily";
  fontFamily.render = `
<label for="fontFamily">font-family</label>
<select id="fontFamily" name="fontfamily" data-css-prop="--fontBody">
    <option value="Spectral" selected>Spectral</option>
    <option value="'Courier Prime'">Courier Prime</option>
    <option value="sans-serif">sans serif</option>
</select>`;
  var fontFamily_default = fontFamily;

  // js/modules/features/fontSize.js
  var fontSize = new Control();
  fontSize.name = "fontSize";
  fontSize.render = `
<label for="fontSize">font-size</label>
<input class="cssVarUpdate" id="fontSize" name="fontSize" data-css-prop="--fontSize" type="range" min="12" max="20" data-sizing="px">
`;
  var fontSize_default = fontSize;

  // js/modules/features/lineHeight.js
  var lineHeight = new Control();
  lineHeight.name = "lineHeight";
  lineHeight.render = `  <div class="pagedPreviewer-item">
<label for="lineHeight">line-height</label>
<input class="cssVarUpdate" id="lineHeight" step="0.1" name="lineHeight" data-css-prop="--lineHeight" type="range" min=".8" max="3"  >
</div>`;
  var lineHeight_default = lineHeight;

  // js/modules/features.js
  var featureList = [fontFamily_default, pageSize_default, pageMargins_default, fontSize_default, lineHeight_default];
  var features_default = featureList;

  // js/modules/pagedjsLogo.js
  var pagedjsLogo_default = `<svg width="81" height="99" viewBox="0 0 81 99" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.299988 92.6V98.2H37.6L68.5 73.4C75.8 67.6 80.2 61.8 80.2 52.3V8.70001V0.200012H0.299988V92.6V92.6ZM8.79999 9.10001H47.5C64.8 9.10001 72.6 19.6 72.6 34.8C72.6 61.3 56.4 67.5 30.7 63.3V89.2H8.70001V9.10001H8.79999Z" fill="black"/></svg>`;

  // js/modules/ui.js
  var features = "";
  config_default.features.forEach((feat) => {
    features_default.forEach((module) => {
      if (module.name == feat) {
        features += module.render;
      } else {
      }
    });
  });
  var ui_default = `
${config_default.button == ".pagedPreviewer-button-modal" ? '<button class="pagedPreviewer-button-modal">Start pagedjs</button>' : ""} 

<div class="pagedPreviewer-modal pagedPreviewer-hidden">
    <div class="pagedPreviewer-form">
        <figure class="pagedPreviewer-logo">
            ${pagedjsLogo_default}
            <figcaption>paged.js <span>previewer</span></figcaption>
        </figure>
      
        ${features} 
    
     
        <div class="pagedPreviewer-item">
        <button class="pagedPreviewer-button-print">print</button>
    </div>
        <div class="pagedPreviewer-item">
        <button class="pagedPreviewer-button-preview">preview</button>
    </div>
    <div class="pagedPreviewer-item">
        <button class="pagedPreviewer-button-close">close</button>
    </div>
    </div>

    <div class="pagedPreviewer-zonePreview">
    
    </iframe>  
    </div>
</div>`;

  // js/main.js
  window.onload = document.body.insertAdjacentHTML("afterbegin", ui_default);
  document.querySelector("body").addEventListener("click", function(e) {
    if (e.target === document.querySelector(`${config_default.button}`) || e.target.classList.contains("pagedPreviewer-button-close")) {
      toggleModal(document.querySelector(".pagedPreviewer-modal"));
    }
  });
  var uicsscontent = document.createElement("style");
  uicsscontent.textContent = uicss_default;
  document.head.append(uicsscontent);
  var inputs = document.querySelectorAll(".cssVarUpdate");
  var selects = document.querySelectorAll("select");
  inputs.forEach((input) => {
    input.addEventListener("change", populatePagedMaker2);
  });
  selects.forEach((select) => {
    select.addEventListener("change", populatePagedMaker2);
  });
  document.querySelectorAll(".pagedPreviewer-marginUpdate").forEach((mr) => {
    mr.addEventListener("change", populatePagedMaker2);
  });
  document.querySelector(".pagedPreviewer-button-preview").addEventListener("click", populatePagedMaker2);
  document.querySelector(".pagedPreviewer-button-print").addEventListener("click", print2);
  function toggleModal(modal) {
    modal.classList.toggle("pagedPreviewer-hidden");
    document.body.classList.remove("pagedPreviewer-blocked");
    if (!document.querySelector(".pagedPreviewer-modal").classList.contains("pagedPreviewer-hidden")) {
      document.body.classList.add("pagedPreviewer-blocked");
      populatePagedMaker2();
    }
  }
  async function populatePagedMaker2() {
    if (document.querySelector(".pagedPreviewer-previewFrame")) {
      document.querySelector(".pagedPreviewer-previewFrame").remove();
    }
    createFrame();
    await delay(100);
    let interfacecss = document.createElement("style");
    interfacecss.textContent = pagedmakerCSS_default;
    document.querySelector(".pagedPreviewer-previewFrame").contentDocument.head.appendChild(interfacecss);
    let styleElement = document.querySelector(".pagedPreviewer-previewFrame").contentDocument.createElement("style");
    styleElement.textContent = baseStylesheet_default + getMargins() + getPageSize();
    console.log(getPageSize);
    let articleContent = document.querySelector(".pagedPreviewer-previewFrame").contentDocument.createElement("article");
    if (config_default.content == void 0) {
      articleContent.innerHTML = document.body.innerHTML;
    } else {
      articleContent.innerHTML = document.querySelector(`${config_default.content}`).innerHTML;
    }
    document.querySelector(".pagedPreviewer-previewFrame").contentDocument.body.appendChild(articleContent);
    getAllValues(styleElement);
    document.querySelector(".pagedPreviewer-previewFrame").contentDocument.head.appendChild(styleElement);
    if (config_default.stylesheet != void 0) {
      let stylesheetConf = document.createElement("link");
      stylesheetConf.href = `${config_default.stylesheet}`;
      stylesheetConf.rel = "stylesheet";
      document.querySelector(".pagedPreviewer-previewFrame").contentDocument.head.appendChild(stylesheetConf);
    }
    let pagedjsscript = document.createElement("script");
    pagedjsscript.src = "https://unpkg.com/pagedjs/dist/paged.polyfill.js";
    document.querySelector(".pagedPreviewer-previewFrame").contentDocument.head.appendChild(pagedjsscript);
  }
  function getAllValues(styleElement) {
    let values = "";
    selects.forEach((input) => {
      if (!input.classList.contains("pagedSize")) {
        values = values + getValue(input);
      }
    });
    inputs.forEach((input) => {
      values = values + getValue(input);
      console.log(values);
    });
    values = `body {${values}}`;
    return styleElement.textContent = styleElement.textContent + values;
  }
  function createFrame() {
    const pagedMaker = document.createElement("iframe");
    pagedMaker.classList.add("pagedPreviewer-previewFrame");
    document.querySelector(".pagedPreviewer-zonePreview").appendChild(pagedMaker);
  }
})();
