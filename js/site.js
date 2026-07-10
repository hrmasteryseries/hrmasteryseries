/* ============ HR Mastery Series — shared site logic ============ */
(function () {
  var D = window.SITE_DATA;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function qs(name) {
    return new URLSearchParams(window.location.search).get(name);
  }
  function bookById(id) {
    return D.books.filter(function (b) { return b.id === id; })[0];
  }
  function resById(id) {
    return D.resources.filter(function (r) { return r.id === id; })[0];
  }
  function storeClass(store) {
    var s = store.toLowerCase();
    if (s.indexOf("amazon") > -1 || s.indexOf("kindle") > -1) return "amazon";
    if (s.indexOf("pothi") > -1) return "pothi";
    return "";
  }

  /* ---------- Header / footer ---------- */
  function renderChrome(active) {
    var header = document.getElementById("site-header");
    if (header) {
      header.innerHTML =
        '<div class="nav-wrap">' +
        '<a class="brand" href="index.html"><div class="b1">THE <em>HR MASTERY</em> SERIES</div>' +
        '<div class="b2">by ' + esc(D.site.author) + "</div></a>" +
        '<nav class="main">' +
        ["index:Home", "books:Books", "resources:Resources", "about:About the Author"]
          .map(function (x) {
            var p = x.split(":");
            return '<a href="' + p[0] + '.html"' + (active === p[0] ? ' class="active"' : "") + ">" + p[1] + "</a>";
          })
          .join("") +
        "</nav></div>";
    }
    var footer = document.getElementById("site-footer");
    if (footer) {
      footer.innerHTML =
        '<div class="flinks"><a href="books.html">Books</a><a href="resources.html">Resources</a><a href="about.html">About the Author</a></div>' +
        "<div>&copy; " + new Date().getFullYear() + " " + esc(D.site.author) +
        ". All rights reserved.</div>" +
        '<div style="margin-top:6px;font-size:.78rem;">The books in this series are educational material only and do not constitute professional or legal advice.</div>';
    }
  }

  /* ---------- Book card ---------- */
  function bookCard(b) {
    var avail = b.status === "available" && b.buyLinks && b.buyLinks.length;
    return (
      '<div class="book-card">' +
      '<a class="cover-wrap" href="book.html?id=' + esc(b.id) + '"><img class="cover" src="' + esc(b.cover) + '" alt="' + esc(b.title) + ' cover"></a>' +
      '<div class="body">' +
      '<span class="badge ' + (avail ? "avail" : "soon") + '">' + (avail ? "Available now" : "Coming soon") + "</span>" +
      "<h3>" + esc(b.title) + "</h3>" +
      '<p class="sub">' + esc(b.subtitle) + "</p>" +
      '<div class="card-actions">' +
      '<a class="btn btn-navy btn-sm" href="book.html?id=' + esc(b.id) + '">View book</a>' +
      (b.sampleId || (b.sampleParas && b.sampleParas.length) ? '<a class="btn btn-sm" style="border:1.5px solid var(--navy);color:var(--navy);" href="sample.html?id=' + esc(b.id) + '">Read sample</a>' : "") +
      "</div></div></div>"
    );
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    if (!("IntersectionObserver" in window)) return;
    document.body.classList.add("js-anim");
    var els = document.querySelectorAll(".book-card, .res-card, .section-head, .detail, .reader");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    els.forEach(function (el, i) {
      el.classList.add("rv");
      el.style.transitionDelay = (i % 4) * 70 + "ms";
      io.observe(el);
    });
  }

  /* ---------- Page renderers ---------- */
  window.PAGE = {
    home: function () {
      renderChrome("index");
      var el = document.getElementById("featured-books");
      if (el) el.innerHTML = D.books.slice(0, 4).map(bookCard).join("");
      var count = document.getElementById("book-count");
      if (count) count.textContent = D.books.length;
    },

    books: function () {
      renderChrome("books");
      document.getElementById("all-books").innerHTML = D.books.map(bookCard).join("");
    },

    book: function () {
      renderChrome("books");
      var b = bookById(qs("id")) || D.books[0];
      document.title = b.title + " — The HR Mastery Series";
      var links = (b.buyLinks || []).filter(function (l) { return l.url; });
      var buyHtml;
      if (links.length) {
        buyHtml =
          '<div class="buy-box"><h4>Get your copy</h4><div class="store-links">' +
          links.map(function (l) {
            return '<a class="store-btn ' + storeClass(l.store) + '" href="' + esc(l.url) + '" target="_blank" rel="noopener">Buy on ' + esc(l.store) + "</a>";
          }).join("") +
          "</div></div>";
      } else {
        buyHtml = '<div class="buy-box"><h4>Get your copy</h4><div class="coming-note">Coming soon — this book is in final preparation for publication. Check back shortly.</div></div>';
      }
      var resHtml = "";
      var rel = (b.relatedResources || []).map(resById).filter(Boolean);
      if (rel.length) {
        resHtml =
          '<div class="buy-box"><h4>Free resources for this book</h4>' +
          rel.map(function (r) {
            var href = r.file || r.url || "#";
            return '<p style="margin-bottom:8px;"><a href="' + esc(href) + '" target="_blank" rel="noopener">' + esc(r.title) + "</a> — " + esc(r.type) + "</p>";
          }).join("") +
          "</div>";
      }
      document.getElementById("book-detail").innerHTML =
        '<div class="detail">' +
        '<div class="cover-col"><img src="' + esc(b.cover) + '" alt="' + esc(b.title) + ' cover"></div>' +
        "<div>" +
        "<h1>" + esc(b.title) + "</h1>" +
        '<p class="subtitle">' + esc(b.subtitle) + "</p>" +
        '<p class="series">' + esc(b.series) + "</p>" +
        '<p class="desc">' + esc(b.description) + "</p>" +
        '<ul class="highlights">' + (b.highlights || []).map(function (h) { return "<li>" + esc(h) + "</li>"; }).join("") + "</ul>" +
        buyHtml +
        resHtml +
        (b.sampleId || (b.sampleParas && b.sampleParas.length) ? '<a class="btn btn-gold" href="sample.html?id=' + esc(b.id) + '">Read a free sample chapter</a>' : "") +
        "</div></div>";
    },

    sample: function () {
      renderChrome("books");
      var b = bookById(qs("id")) || D.books[0];
      document.title = "Sample — " + b.title;
      var paras = (window.SAMPLES && window.SAMPLES[b.sampleId]) || b.sampleParas || [];
      var body = paras.map(function (t) {
        var isHead = t.length < 70 && t === t.toUpperCase() && /[A-Z]/.test(t);
        return '<p class="' + (isHead ? "h" : "") + '">' + esc(t) + "</p>";
      }).join("");
      document.getElementById("sample-reader").innerHTML =
        '<div class="reader">' +
        "<h1>" + esc(b.title) + "</h1>" +
        '<div class="from">A free sample from ' + esc(b.series) + " &middot; by " + esc(D.site.author) + "</div>" +
        body +
        '<div class="reader-end"><p>&mdash; End of free sample &mdash;</p>' +
        '<a class="btn btn-gold" href="book.html?id=' + esc(b.id) + '">Get the full book</a></div>' +
        "</div>";
    },

    resources: function () {
      renderChrome("resources");
      var el = document.getElementById("res-list");
      if (!D.resources.length) {
        el.innerHTML = '<p style="text-align:center;color:var(--muted);">Free resources are on their way — check back soon.</p>';
        return;
      }
      el.innerHTML = D.resources.map(function (r) {
        var b = r.relatedBook ? bookById(r.relatedBook) : null;
        var href = r.file || r.url || "#";
        return (
          '<div class="res-card">' +
          '<span class="type">' + esc(r.type) + "</span>" +
          "<h3>" + esc(r.title) + "</h3>" +
          "<p>" + esc(r.description) + "</p>" +
          '<a class="btn btn-navy btn-sm" href="' + esc(href) + '" target="_blank" rel="noopener">Download free</a>' +
          (b ? ' &nbsp;<a class="btn btn-sm" style="border:1.5px solid var(--navy);color:var(--navy);" href="book.html?id=' + esc(b.id) + '">Related book: ' + esc(b.title) + "</a>" : "") +
          "</div>"
        );
      }).join("");
    },

    about: function () {
      renderChrome("about");
      var a = D.about;
      document.getElementById("about-body").innerHTML =
        '<div class="about-grid">' +
        '<div class="author-plate"><div class="monogram">MK</div><h3>' + esc(a.name) + '</h3><div class="role">' + esc(a.role) + "</div></div>" +
        '<div class="about-text">' +
        a.bio.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") +
        '<p><strong>Contact:</strong> <a href="mailto:' + esc(a.email) + '">' + esc(a.email) + "</a></p>" +
        "</div></div>";
    }
  };

  // Run scroll-reveal after whichever page renderer executes
  Object.keys(window.PAGE).forEach(function (k) {
    var f = window.PAGE[k];
    window.PAGE[k] = function () { f(); initReveal(); };
  });
})();
