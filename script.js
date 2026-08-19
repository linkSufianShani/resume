(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------ */
  /* Footer year                                                        */
  /* ------------------------------------------------------------------ */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------ */
  /* Mobile menu                                                        */
  /* ------------------------------------------------------------------ */
  var burger = document.getElementById("burgerBtn");
  var mobileMenu = document.getElementById("mobileMenu");
  if (burger && mobileMenu) {
    burger.addEventListener("click", function () {
      var isOpen = mobileMenu.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    mobileMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mobileMenu.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Scroll reveal for timeline cards & project cards                   */
  /* ------------------------------------------------------------------ */
  var revealTargets = document.querySelectorAll(".timeline__card, .project-card");
  if ("IntersectionObserver" in window && revealTargets.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ------------------------------------------------------------------ */
  /* Hero topology diagram                                              */
  /* Hub = ".NET CORE" — satellites = the tools that hang off it        */
  /* ------------------------------------------------------------------ */
  var svg = document.getElementById("topology");
  if (svg) {
    var SVGNS = "http://www.w3.org/2000/svg";
    var cx = 300, cy = 300;
    var hubR = 56;
    var satR = 44;
    var orbit = 214;

    var satellites = [
      { label: ["AZURE"], angle: -90 },
      { label: ["REST", "API"], angle: -30 },
      { label: ["SQL", "SERVER"], angle: 30 },
      { label: ["MICRO", "SERVICES"], angle: 90 },
      { label: ["REACT /", "ANGULAR"], angle: 150 },
      { label: ["AGILE", "TEAM"], angle: 210 }
    ];

    var linesGroup = document.getElementById("topo-lines");
    var pulsesGroup = document.getElementById("topo-pulses");
    var nodesGroup = document.getElementById("topo-nodes");

    function polar(angleDeg, radius) {
      var rad = (angleDeg * Math.PI) / 180;
      return {
        x: cx + radius * Math.cos(rad),
        y: cy + radius * Math.sin(rad)
      };
    }

    function makeText(x, y, lines, extraClass) {
      var t = document.createElementNS(SVGNS, "text");
      if (extraClass) t.setAttribute("class", extraClass);
      var lineHeight = 13;
      var startY = y - ((lines.length - 1) * lineHeight) / 2 + 4;
      lines.forEach(function (line, i) {
        var tspan = document.createElementNS(SVGNS, "tspan");
        tspan.setAttribute("x", x);
        tspan.setAttribute("y", startY + i * lineHeight);
        tspan.textContent = line;
        t.appendChild(tspan);
      });
      return t;
    }

    // Hub node
    var hubG = document.createElementNS(SVGNS, "g");
    hubG.setAttribute("class", "topo-node hub");
    var hubCircle = document.createElementNS(SVGNS, "circle");
    hubCircle.setAttribute("cx", cx);
    hubCircle.setAttribute("cy", cy);
    hubCircle.setAttribute("r", hubR);
    hubCircle.setAttribute("class", "node-ring");
    hubG.appendChild(hubCircle);
    hubG.appendChild(makeText(cx, cy, [".NET CORE"]));
    nodesGroup.appendChild(hubG);

    satellites.forEach(function (sat, i) {
      var pos = polar(sat.angle, orbit);
      var edgeStart = polar(sat.angle, hubR + 2);
      var edgeEnd = polar(sat.angle, orbit - satR - 2);

      // connecting path (used both for the line and for the pulse to travel along)
      var pathId = "topo-path-" + i;
      var path = document.createElementNS(SVGNS, "path");
      path.setAttribute(
        "d",
        "M " + edgeStart.x.toFixed(1) + " " + edgeStart.y.toFixed(1) +
        " L " + edgeEnd.x.toFixed(1) + " " + edgeEnd.y.toFixed(1)
      );
      path.setAttribute("id", pathId);
      path.setAttribute("class", "topo-line topo-line--active");
      path.style.animationDelay = (i * -0.5).toFixed(2) + "s";
      linesGroup.appendChild(path);

      // pulse traveling along the path
      if (!reduceMotion) {
        var pulse = document.createElementNS(SVGNS, "circle");
        pulse.setAttribute("r", "3.2");
        pulse.setAttribute("class", "topo-pulse");
        var animMotion = document.createElementNS(SVGNS, "animateMotion");
        animMotion.setAttribute("dur", (3.2 + (i % 3) * 0.6).toFixed(1) + "s");
        animMotion.setAttribute("repeatCount", "indefinite");
        animMotion.setAttribute("begin", (i * 0.45).toFixed(2) + "s");
        animMotion.setAttribute("rotate", "auto");
        var mpath = document.createElementNS(SVGNS, "mpath");
        mpath.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#" + pathId);
        mpath.setAttribute("href", "#" + pathId);
        animMotion.appendChild(mpath);
        pulse.appendChild(animMotion);
        pulsesGroup.appendChild(pulse);
      }

      // satellite node
      var satG = document.createElementNS(SVGNS, "g");
      satG.setAttribute("class", "topo-node");
      var satCircle = document.createElementNS(SVGNS, "circle");
      satCircle.setAttribute("cx", pos.x.toFixed(1));
      satCircle.setAttribute("cy", pos.y.toFixed(1));
      satCircle.setAttribute("r", satR);
      satCircle.setAttribute("class", "node-ring");
      satG.appendChild(satCircle);
      satG.appendChild(makeText(pos.x, pos.y, sat.label));
      nodesGroup.appendChild(satG);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Active nav link highlighting on scroll                             */
  /* ------------------------------------------------------------------ */
  var sections = document.querySelectorAll(".section[id]");
  var navLinks = document.querySelectorAll(".nav__links a");
  if ("IntersectionObserver" in window && sections.length && navLinks.length) {
    var navIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute("id");
            navLinks.forEach(function (link) {
              link.style.color = link.getAttribute("href") === "#" + id
                ? "var(--text-primary)"
                : "";
            });
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach(function (s) { navIO.observe(s); });
  }
})();
