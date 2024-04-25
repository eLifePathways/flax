const searchInput = document.querySelector("#search");
const searchIcon = document.querySelector("#searchIcon");
let content;

if (document.querySelector("template")) {
content = document.querySelector("template").innerHTML
} else {
    const template = document.createElement('template');
    template.innerHTML = document.querySelector('main').innerHTML;
}
const resultSpace = document.querySelector(".results");
let queryList = new Set();
searchInput.addEventListener("change", search);
searchIcon.addEventListener("click", search);

let result = document.createElement("div");

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
      resultSpace.innerHTML = `<p>Please fill the input to search (2 letters min)</p>`;
    }
  });

// if one expression word search
function search() {
  if (searchInput.value.length < 2) {
    return;
  }
  result.innerHTML = "";
  //   empty  resultSpace
  resultSpace.innerHTML = "";

  //   split search with ,
  let searches = searchInput.value.trim().split(/\s?,\s?/);

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
    if (!result.innerHTML.length > 0) {
      result.innerHTML = content.replace(
        regex,
        `<mark class=query-${index}>$1</mark>`
      );
    } else {
      result.innerHTML = result.innerHTML.replace(
        regex,
        `<mark class=query-${index}>$1</mark>`
      );
    }
  });

  result.querySelectorAll("section").forEach((section, index) => {
    if (section.querySelector("mark")) {
      
      
      resultSpace.insertAdjacentHTML(
        "beforeend",
        `<h3 class="search-title"><span>in</span> component ${index} — ${
          section.querySelector("h1").innerHTML
        }</h3>`
      );

      section.querySelectorAll("mark").forEach((mark) => {
        let markParent = mark.closest("p, figure, table, blockquote, h2, h3");
        
        if (markParent.dataset.done != "true") { 
            let markparentID = markParent.id.replace(/<mark class=\query-\d+\>/, '')
            markparentID = markparentID.replace('</mark>', "");
            console.log(markparentID);
            
          markParent.insertAdjacentHTML(
            "beforeend", 
            `<a class="link-away" target="_blank" href="../chap${minTwoDigits(index + 1)}/index.html${markParent.id ? '#' + markparentID : ""}"><svg class="checkquery" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg><span class="hover">open chapter in a new page</span></a>`
          );
          markParent.dataset.done = "true";
        }
        if (document.querySelector("#or").checked) {
          console.log(mark.closest("p, figure, table, blockquote, h2, h3"));
        } else {
          resultSpace.insertAdjacentElement("beforeend", markParent);
        }
      });
    }
  });
}


function minTwoDigits(n) {
    return (n < 10 ? '0' : '') + n;
  }
  