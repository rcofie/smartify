AFRAME.registerComponent("models", {
  schema: {
    soil: { type: "string", default: "" },
    packet: { type: "string", default: "" },
    seed: { type: "string", default: "" },
    wateringCan: { type: "string", default: "" },
    raindrop: { type: "string", default: "" },
    sunflower: { type: "string", default: "" },
    wateringAnimationComplete: { type: "boolean", default: false },
  },

  init: function () {
    const el = this.el;
    const data = this.data;

    this.loader = new THREE.GLTFLoader();
    this.marker = document.querySelector("a-marker");
    this.sun = document.getElementById("sun");
    this.sunText = document.getElementById("sun-text"); // Reference to the DOM element
    this.parentSoil = document.getElementById("parentSoil");

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
      if (this.soil && this.sunText.textContent === "Tap to place soil") {
        this.soil.visible = true;
        this.sunText.textContent = "Tap to plant a seed";
        this.seedAnimation();
      }
    });
  },

  seedAnimation: function () {
    const packet = document.createElement("a-entity");
    packet.setAttribute("id", "packet");
    this.parentSoil.appendChild(packet);

    const seed = document.createElement("a-entity");
    seed.setAttribute("id", "seed");
    this.parentSoil.appendChild(seed);

    setTimeout(() => {
      this.loader.load(
        this.data.packet,
        (gltf) => {
          this.packet = gltf.scene;
          this.packet.scale.set(0.5, 0.5, 0.5);
          this.packet.position.set(-0.1, 0.3, 0);
          this.packet.rotation.set(0, 0, -0.5);
          packet.object3D.add(this.packet);

          if (this.sunText.textContent === "Tap to plant a seed") {
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
                  seed.object3D.add(this.seed);

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
                    if (this.data.wateringAnimationComplete === false)
                      this.wateringCanAnimation();
                  }, 500);

                  setTimeout(() => {
                    this.packet.visible = false;
                  }, 2000);
                },
                undefined,
                (error) => {
                  console.error("Error loading seed model:", error);
                }
              );
            });
          }
        },
        undefined,
        (error) => {
          console.error("Error loading packet model:", error);
        }
      );
    }, 1000);
  },

  wateringCanAnimation: function () {
    const can = document.createElement("a-entity");
    can.setAttribute("id", "can");
    this.parentSoil.appendChild(can);

    setTimeout(() => {
      this.loader.load(
        this.data.wateringCan,
        (gltf) => {
          this.wateringCan = gltf.scene;
          this.wateringCan.scale.set(0.3, 0.3, 0.3);
          this.wateringCan.position.set(-0.07, 0.3, 0);
          this.wateringCan.rotation.set(-0.15, 1.2, 0.4);
          can.object3D.add(this.wateringCan);

          if (this.wateringCan) {
            this.sunText.textContent = "Tap to water the seed";
          }
        },
        undefined,
        (error) => {
          console.error("Error loading GLTF model:", error);
        }
      );
    }, 2000);
    this.sun.addEventListener("click", () => {
      console.log("trigger watering can animation");
      let progress = 0;
      for (let i = 0; i < 10; i++) {
        const raindrop = document.createElement("a-entity");
        raindrop.setAttribute("id", `raindrop-${i}`);
        this.parentSoil.appendChild(raindrop);

        this.loader.load(
          this.data.raindrop,
          (gltf) => {
            this.raindrop = gltf.scene;
            this.raindrop.scale.set(0.00008, 0.00008, 0.00008);

            this.raindrop.traverse((node) => {
              if (node.isMesh) {
                node.material.color.set("#0561FF");
              }
            });
            raindrop.object3D.add(this.raindrop);
          },
          undefined,
          (error) => {
            console.error("Error loading raindrop model:", error);
          }
        );

        // Calculate the x position for the raindrop
        const xPosition = i % 2 === 0 ? 0 : 0.005;

        // Add more delay for each raindrop to make the cascading effect clear
        setTimeout(() => {
          raindrop.setAttribute("animation__raindrop", {
            property: "position",
            from: `${xPosition} 0.35 0`,
            to: `${xPosition} 0 0`,
            dur: "1500",
            dir: "normal",
            easing: "easeInOutQuad",
            loop: false,
          });
        }, i * 300); // Stagger increased to 300ms
      }
      this.data.wateringAnimationComplete = true;

      // Start the progress bar updates
      this.sunText.textContent = `${progress}%`;

      const progressInterval = setInterval(() => {
        progress += 10;
        if (progress >= 100) {
          clearInterval(progressInterval);
          this.sunText.textContent = "Watering complete!";
          setTimeout(() => {
            this.sunflowerGrow();
          }, 1000);
        } else {
          this.sunText.textContent = `${progress}%`;
        }
      }, 300);
    });
  },
  sunflowerGrow: function () {
    console.log("trigger sunflower animation");
    this.sunText.textContent = "Watch your flower grow!";
    const sunflower = document.createElement("a-entity");
    sunflower.setAttribute("id", "sunflower");
    this.parentSoil.appendChild(sunflower);

    document.getElementById("can").setAttribute("visible", "false");

    this.sun.style.pointerEvents = "none";

    // load sunflower file
    this.loader.load(
      this.data.sunflower,
      (gltf) => {
        this.sunflower = gltf.scene;
        this.sunflower.scale.set(0.1, 0.1, 0.1);
        sunflower.object3D.add(this.sunflower);
      },
      undefined,
      (error) => {
        console.error("Error loading sunflower model:", error);
      }
    );

    // trigger growth animation
    sunflower.setAttribute("animation__sunflower", {
      property: "scale",
      from: `0.1 0.1 0.1`,
      to: `7 7 7`,
      dur: "2000",
      dir: "normal",
      easing: "easeInOutQuad",
      loop: false,
    });
  },
});
