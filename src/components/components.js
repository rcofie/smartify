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

AFRAME.registerComponent("models", {
  schema: {
    soil: { type: "string", default: "" },
    packet: { type: "string", default: "" },
    seed: { type: "string", default: "" },
    wateringCan: { type: "string", default: "" },
    sunflower: { type: "string", default: "" },
  },

  init: function () {
    const el = this.el;
    const data = this.data;

    this.loader = new THREE.GLTFLoader();
    this.marker = document.querySelector("a-marker");
    this.sun = document.getElementById("sun");
    this.sunText = document.getElementById("sun-text"); // Reference to the DOM element

    // Load the ground model
    this.loader.load(
      data.soil,
      (gltf) => {
        this.soil = gltf.scene;
        this.soil.scale.set(2, 2, 2);
        el.object3D.add(this.soil);
        this.soil.visible = false;
      },
      undefined,
      (error) => {
        console.error("Error loading soil model:", error);
      }
    );
    this.sun.addEventListener("click", () => {
      if (this.soil) {
        this.soil.visible = true;
        this.sunText.textContent = "Tap to plant a seed";
        this.seedAnimation();
      }
    });
  },

  seedAnimation: function () {
    const packet = document.createElement("a-entity");
    packet.setAttribute("id", "packet");
    document.getElementById("parentSoil").appendChild(packet);

    const seed = document.createElement("a-entity");
    seed.setAttribute("id", "seed");
    document.getElementById("parentSoil").appendChild(seed);

    setTimeout(() => {
      this.loader.load(
        this.data.packet,
        (gltf) => {
          this.packet = gltf.scene;
          this.packet.scale.set(0.5, 0.5, 0.5);
          this.packet.position.set(-0.1, 0.3, 0);
          this.packet.rotation.set(0, 0, -0.5);
          document.getElementById("packet").object3D.add(this.packet);

          this.sun.addEventListener("click", () => {
            console.log("trigger seed animation");
            // load seed in gltf

            // create child entity for seed and attach the animation to that
            this.loader.load(
              this.data.seed,
              (gltf) => {
                this.seed = gltf.scene;
                this.seed.scale.set(0.5, 0.5, 0.5);
                this.seed.position.set(-0.06, 0.32, 0);
                document.getElementById("seed").object3D.add(this.seed);

                // Animate the seed's position after 1 second
                setTimeout(() => {
                  seed.setAttribute("animation__seed", {
                    property: "position",
                    from: seed.position,
                    to: "0.05 -0.33, 0",
                    dur: "1500",
                    dir: "normal",
                    easing: "easeInOutQuad",
                    loop: false,
                  });

                  this.wateringCanAnimation();
                }, 500);
              },
              undefined,
              (error) => {
                console.error("Error loading seed model:", error);
              }
            );
          });
        },
        undefined,
        (error) => {
          console.error("Error loading packet model:", error);
        }
      );
    }, 2000);
  },

  wateringCanAnimation: function () {
    const can = document.createElement("a-entity");
    can.setAttribute("id", "can");
    document.getElementById("parentSoil").appendChild(can);

    // start: "-0.04 0.3 0",
    // end: "0.05 -0.33, 0",
    // color: "#0561FF",

    const progress = "percentage";

    // line properties
    const direction = new THREE.Vector3(0.09, -0.03, 0);
    const length = direction.length();
    direction.normalize();

    // line midpoint

    const midPoint = {
      x: 0.005,
      y: -0.015,
      z: 0,
    };

    const lineCylinder = document.createElement("a-entity");
    lineCylinder.setAttribute("id", "line");
    document.getElementById("parentSoil").appendChild(lineCylinder);

    lineCylinder.setAttribute("geometry", {
      primitive: "cylinder",
      height: 0.01,
      radius: 0.1,
    });

    lineCylinder.setAttribute("position", "-0.04 0.3 0");

    lineCylinder.setAttribute("material", "color: #0561FF");
    lineCylinder.setAttribute("scale", "0.2 0.2 0.2");
    lineCylinder.setAttribute(
      "position",
      `${midPoint.x} ${midPoint.y} ${midPoint.z}`
    );
    // Calculate rotation to align with the direction vector
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0), // Default cylinder axis
      direction
    );
    const rotation = new THREE.Euler().setFromQuaternion(quaternion, "XYZ");

    lineCylinder.setAttribute(
      "rotation",
      `${THREE.MathUtils.radToDeg(rotation.x)} ${THREE.MathUtils.radToDeg(
        rotation.y
      )} ${THREE.MathUtils.radToDeg(rotation.z)}`
    );

    setTimeout(() => {
      document.getElementById("packet").setAttribute("visible", "false");
      this.loader.load(
        this.data.wateringCan,
        (gltf) => {
          this.wateringCan = gltf.scene;
          this.wateringCan.scale.set(0.3, 0.3, 0.3);
          this.wateringCan.position.set(-0.07, 0.3, 0);
          this.wateringCan.rotation.set(-0.15, 1.2, 0.4);
          document.getElementById("can").object3D.add(this.wateringCan);

          this.sun.addEventListener("click", () => {
            console.log("trigger watering can animation");

            // Animate the height to grow dynamically
            lineCylinder.setAttribute("animation", {
              property: "geometry.height",
              to: length,
              dur: 2000,
              easing: "easeInOutQuad",
            });

            // set progress percentage of sunText
            this.sunText.color = "#0561FF";
            this.sunText = `${progress}%`;
          });
        },
        undefined,
        (error) => {
          console.error("Error loading GLTF model:", error);
        }
      );
    }, 2000);
  },
});
