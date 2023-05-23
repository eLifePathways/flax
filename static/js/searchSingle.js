const searchInput = document.querySelector("#search");
const searchIcon = document.querySelector("#searchIcon");
let content;

if (!document.querySelector("template")) {
  const template = document.createElement("template");
  template.innerHTML = document.querySelector("main").innerHTML;
  document.body.insertAdjacentElement("afterbegin", template);
}

content = document.querySelector("template").innerHTML;

const resultSpace = document.querySelector("main");
let queryList = new Set();
searchInput.addEventListener("change", search);
searchIcon.addEventListener("click", search);

// button used to store previous queries
document
  .querySelector(".previousSearch")
  .addEventListener("click", function (event) {
    if (event.target.className.includes("previousQuery")) {
      searchInput.value = event.target.textContent;

      search();
    }
    if (event.target.className == "clearPrevious") {
      queryList.clear();
      this.innerHTML = `<button class="clearPrevious">clear previous queries</button>`;
      resultSpace.innerHTML = content;
    }
  });

// if one expression word search
function search() {
  if (searchInput.value.length < 2) {
    return;
  }

  //   split search with ,
  let searches = searchInput.value.trim().split(/\s?,\s?/);
  resultSpace.innerHTML = content;
  //   for each experssion search
  searches.forEach((query, index) => {
    let regex = new RegExp(`(${query})`, "gis");

    // update list of previous searches
    if (queryList.has(query)) {
      document.querySelectorAll(`.previousQuery`).forEach((previous) => {
        if (previous.textContent == query) {
          previous.classList.add("multiple");

          previous.dataset.searched
            ? (previous.dataset.searched =
                parseInt(previous.dataset.searched, 10) + 1)
            : (previous.dataset.searched = 2);
        }
      });
    } else {
      document
        .querySelector(".previousSearch")
        .insertAdjacentHTML(
          "afterbegin",
          `<button class="previousQuery">${query}</button>`
        );
      queryList.add(query);
    }
    //mark results

    resultSpace.innerHTML = resultSpace.innerHTML.replace(
      regex,
      `<mark class=query-${index}>$1</mark>`
    );
  });

  resultSpace.querySelectorAll(".chap-content > *").forEach((el) => {
    el.classList.add("search-hide");
  });

  resultSpace.querySelectorAll("mark").forEach((mark) => {
    let markParent = mark.closest("p, figure, table, blockquote, h2, h3");
    markParent.classList.remove("search-hide");
  });
}

// if (document.querySelector("#or").checked) {
//   console.log(mark.closest("p, figure, table, blockquote, h2, h3"));
// } else {
//   resultSpace.insertAdjacentElement("beforeend", markParent);
// }
//   });
// }

function minTwoDigits(n) {
  return (n < 10 ? "0" : "") + n;
}
