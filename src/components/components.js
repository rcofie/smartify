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
    src: { type: "string", default: "" },
    scale: { type: "vec3", default: { x: 2, y: 2, z: 2 } },
    markerId: { type: "string", default: "marker" },
  },

  init: function () {
    const el = this.el;
    const data = this.data;

    const loader = new THREE.GLTFLoader();
    this.sunText = document.getElementById("sun-text");

    // Load the GLTF model
    loader.load(
      data.src,
      (gltf) => {
        this.model = gltf.scene;
        this.model.scale.set(data.scale.x, data.scale.y, data.scale.z);
        this.model.visible = false; // Initially hidden
        el.object3D.add(this.model);
      },
      undefined,
      (error) => {
        console.error("Error loading GLTF model:", error);
      }
    );

    if (navigator.xr) {
      console.log("WebXR supported: Using ground detection");
      this.setupWebXR();
    } else {
      console.log("WebXR not supported: Falling back to AR.js markers");
      this.setupMarkerFallback();
    }
  },

  setupWebXR: function () {
    const el = this.el;
    const model = this.model;
    let hitTestSource = null;
    let sessionStarted = false;

    if (!navigator.xr || sessionStarted) return;
    sessionStarted = true;

    navigator.xr
      .requestSession("immersive-ar", { requiredFeatures: ["hit-test"] })
      .then((session) => {
        const sceneEl = el.sceneEl;

        sceneEl.renderer.xr.setSession(session);

        session
          .requestReferenceSpace("local")
          .then((refSpace) => session.requestHitTestSource({ space: refSpace }))
          .then((source) => {
            hitTestSource = source;
          })
          .catch((error) => {
            console.error("Error setting up hit test:", error);
            if (this.sunText) {
              this.sunText.textContent = "Ground not detected! Try again";
            }
          });

        session.addEventListener("end", () => {
          hitTestSource = null;
          sessionStarted = false;
        });

        sceneEl.renderer.xr.addEventListener("frame", (event) => {
          if (!hitTestSource || !model) return;

          const frame = event.frame;
          const referenceSpace = sceneEl.renderer.xr.getReferenceSpace();
          const hitTestResults = frame.getHitTestResults(hitTestSource);

          if (hitTestResults.length > 0) {
            const pose = hitTestResults[0].getPose(referenceSpace);
            if (pose) {
              model.position.set(
                pose.transform.position.x,
                pose.transform.position.y,
                pose.transform.position.z
              );
              this.sunText.textContent = "Tap to place down soil";
              window.addEventListener("touchstart", () => {
                model.visible = true; // Make the model visible
              });
            }
          } else {
            if (this.sunText) {
              this.sunText.textContent = "Ground not detected! Try again";
            }
          }
        });
      });
  },

  setupMarkerFallback: function () {
    const data = this.data;
    const marker = document.querySelector(`#${data.markerId}`);

    if (!marker) {
      console.error(`Marker with ID "${data.markerId}" not found.`);
      if (this.sunText) {
        this.sunText.textContent = "Ground not detected! Try again";
      }
      return;
    } else if (this.model) {
      marker.object3D.add(this.model);
      this.sunText.textContent = "Tap to place down soil";
      window.addEventListener("touchstart", () => {
        this.model.visible = true; // Show the model
      });
    }
  },
});
