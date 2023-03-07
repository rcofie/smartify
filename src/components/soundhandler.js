AFRAME.registerComponent("soundhandler", {
  init: function () {
    this.soundEl = document.querySelector("[sound]");
    this.marker = document.querySelector("a-marker");
  },
  tick: function () {
    if (this.marker.object3D.visible) {
      this.soundEl.components.sound.playSound();
    }
  },
});
