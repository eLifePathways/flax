// nightmode

// let address =
//   window.location.origin +
//   window.location.pathname +
//   window.location.search +
//   window.location.hash;

document.addEventListener(
  "click",
  function (event) {
    // If user either clicks X button OR clicks outside the modal window, then close modal by calling closeModal()

    if (
      document.querySelector("#showtoc") &&
      document.querySelector("#showtoc").classList.contains("show")
    ) {
      if (!event.target.closest(".book-toc")) {
        toggleTOC();
      }
    }
  },
  false
);

function toggleTOC() {
  document.querySelector(".book-toc").classList.toggle("show");
}

if (document.querySelector("#showtoc")) {
  document.querySelector("#showtoc").addEventListener("click", function () {
    toggleTOC();
  });
}

function nightModeToggle() {
  if (document.documentElement.classList.contains("nightmode")) {
    //   remove night mode

    document.documentElement.classList.remove("nightmode");

    localStorage.setItem("nightmode", false);
  } else if (!document.documentElement.classList.contains("nightmode")) {
    //   add night mode

    document.documentElement.classList.add("nightmode");
    localStorage.setItem("nightmode", true);
  }
}

if (document.querySelector("#nightmode")) {
  document
    .querySelector("#nightmode")
    .addEventListener("click", nightModeToggle);
}

if (document.querySelector("#zoomplus")) {
  document.querySelector("#zoomplus").addEventListener("click", function () {
    const content = document.querySelector("main");
    let contentStyles = getComputedStyle(content);
    let colorValue = contentStyles.getPropertyValue("--text-zoom");
    colorValue = parseFloat(colorValue) + 0.1;
    content.style.setProperty(`--text-zoom`, `${colorValue}em`);
    localStorage.setItem("text-zoom", colorValue);
  });
}

if (document.querySelector("#zoomminus")) {
  document.querySelector("#zoomminus").addEventListener("click", function () {
    const content = document.querySelector("main");
    let contentStyles = getComputedStyle(content);
    let colorValue = contentStyles.getPropertyValue("--text-zoom");
    colorValue = parseFloat(colorValue) - 0.1;
    content.style.setProperty(`--text-zoom`, `${colorValue}em`);
    localStorage.setItem("text-zoom", colorValue);
  });
}
if (document.querySelector("#zoomnone")) {
  document.querySelector("#zoomnone").addEventListener("click", function () {
    const content = document.querySelector("main");
    content.style.setProperty(`--text-zoom`, `0em`);
    localStorage.setItem("text-zoom", 0);
  });
}

// if (document.querySelector("#downloads")) {
//   document.querySelector("#downloads").addEventListener("click", function () {

//   });
// }

window.onload = function () {
  if (localStorage.getItem("text-zoom")) {
    document
      .querySelector("main")
      .style.setProperty(
        `--text-zoom`,
        `${localStorage.getItem("text-zoom")}em`
      );
  }
};

if (document.querySelector("#showSearch")) {
  document
    .querySelector("#showSearch")
    .addEventListener("click", showSearchBox);
}

function showSearchBox() {
  document.querySelector(".searchbox").classList.toggle("active");
}
let booktoc = document.querySelector('.book-toc');

if (booktoc) {
  dragElement(booktoc);
}

let searchbox = document.querySelector(".searchbox");
if (searchbox) {
  dragElement(searchbox);

}
// Make the DIV element draggable:
function dragElement(elmnt) {
  var pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  if (elmnt.querySelector(".button-move")) {
    // if present, the header is where you move the DIV from:
    elmnt.querySelector(".button-move").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = elmnt.offsetTop - pos2 + "px";
    elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// ondragover="onDragOver(event);"
