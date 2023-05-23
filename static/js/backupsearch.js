(function (window, document) {
  "use strict";


  const search = (e) => {
    const results = window.searchIndex.search(e.target.value, {
      bool: "OR",
      expand: true,
    });

    var index = elasticlunr(function () {
      this.pipeline.add(function (token, tokenIndex, tokens) {
        // text processing in here
      })
  
      this.pipeline.after(lunr.stopWordFilter, function (token, tokenIndex, tokens) {
        // text processing in here
      })
    })


    const resEl = document.getElementById("searchResults");
    const noResultsEl = document.getElementById("noResultsFound");

    resEl.innerHTML = "";




    if (results) {


// how to get the node?

      noResultsEl.style.display = "none";
      results.map((r) => {
        const { id, title, chapnum} = r.doc;
        const el = document.createElement("li");
        resEl.appendChild(el);
        console.log(r.doc)
        const h3 = document.createElement("h3");
        el.appendChild(h3);

        const a = document.createElement("a");
        a.setAttribute("href", id);
        a.innerHTML = `<span class="chapnum">chapter ${chapnum}.</span> <span class="searchtitle">${title}</span>`;
        h3.appendChild(a);
      });
    } else {
      noResultsEl.style.display = "block";
    }
  };

  fetch("../content.json").then((response) =>
    response.json().then((rawIndex) => {
      window.searchIndex = elasticlunr.Index.load(rawIndex);
      document.getElementById("searchField").addEventListener("input", search);
    })
  );
})(window, document);
