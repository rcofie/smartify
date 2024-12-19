function importAll(r) {
  r.keys().forEach(r);
}

importAll(require.context("./components", false, /\.js$/));
require("aframe-extras");

function byId(id) {
  return document.getElementById(id);
}

document.addEventListener("DOMContentLoaded", () => {
  byId("button").addEventListener("click", () => {
    byId("onboarding").style.display = "none";
  });
});
