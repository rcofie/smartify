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

AFRAME.registerComponent("ground-soil-detection", {
  schema: {
    soil: { type: "string", default: "" },
    packet: { type: "string", default: "" },
    scale: { type: "vec3", default: { x: 2, y: 2, z: 2 } },
  },

  init: function () {
    const el = this.el;
    const data = this.data;

    this.loader = new THREE.GLTFLoader();
    this.marker = document.querySelector("a-marker");
    this.sunText = document.getElementById("sun-text").textContent;

    // Load the ground model
    this.loader.load(
      data.soil,
      (gltf) => {
        this.model = gltf.scene;
        this.model.scale.set(data.scale.x, data.scale.y, data.scale.z);
        el.object3D.add(this.model);
      },
      undefined,
      (error) => {
        console.error("Error loading GLTF model:", error);
      }
    );
  },
  tick: function () {
    if (this.marker.object3D.visible) {
      this.sunText = "Tap the packet to plant a seed";
      console.log("visible");

      // this.loader.load(
      //   data.packet,
      //   (gltf) => {
      //     this.model = gltf.scene;
      //     this.model.scale.set(data.scale.x, data.scale.y, data.scale.z);
      //     el.object3D.add(this.model);
      //   },
      //   undefined,
      //   (error) => {
      //     console.error("Error loading GLTF model:", error);
      //   }
      // );
    }
  },
});
