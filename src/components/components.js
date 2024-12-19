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

AFRAME.registerComponent("custom-camera", {
  schema: {
    position: { type: "vec3", default: { x: 0, y: 1.6, z: 0 } }, // Default camera position
    fov: { type: "number", default: 75 }, // Field of View
    lookControls: { type: "boolean", default: true }, // Enable look-controls
  },

  init: function () {
    const data = this.data;

    // Create a Perspective Camera
    const camera = new THREE.PerspectiveCamera(
      data.fov,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    // Set camera position
    camera.position.set(data.position.x, data.position.y, data.position.z);

    // Add the camera to the entity's object3D
    this.el.object3D.add(camera);

    // Handle look-controls if enabled
    if (data.lookControls) {
      this.el.setAttribute("look-controls", ""); // A-Frame built-in behavior
    }

    // Replace A-Frame's default camera with this custom camera
    const rendererSystem = this.el.sceneEl.systems.renderer;
    rendererSystem.camera = camera;

    // Adjust aspect ratio on window resize
    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    });
  },
});

AFRAME.registerComponent("ground-soil", {
  schema: {
    src: { type: "string", default: "" },
    scale: { type: "vec3", default: { x: 2, y: 2, z: 2 } },
    sensitivity: { type: "number", default: 0.1 }, // Adjust movement speed
    position: { type: "vec3", default: { x: 0, y: 1.6, z: -0.75 } }, // Adjust movement speed
  },

  init: function () {
    const loader = new THREE.GLTFLoader();
    const el = this.el;
    const data = this.data;

    const sensitivity = this.data.sensitivity;
    let startAlpha = null;

    // Load the GLTF model
    loader.load(
      data.src,
      (gltf) => {
        this.model = gltf.scene;
        // Apply scaling
        this.model.scale.set(data.scale.x, data.scale.y, data.scale.z);

        // Add the model to the entity
        el.object3D.add(this.model);
      },
      undefined,
      (error) => {
        console.error("Error loading GLTF model:", error);
      }
    );

    // Listen for device orientation events
    window.addEventListener("deviceorientation", (event) => {
      // Get alpha, beta, gamma values
      const alpha = event.alpha || 0; // Z-axis rotation
      const beta = event.beta || 0; // X-axis tilt
      const gamma = event.gamma || 0; // Y-axis tilt

      // Normalize alpha to use as a base offset
      if (startAlpha === null) startAlpha = alpha;
      const adjustedAlpha = alpha - startAlpha;

      // Compute offsets based on orientation
      const offsetX = gamma * sensitivity; // Side-to-side controls x
      const offsetY = (beta * sensitivity) / 200; // Scale down Y-axis movement
      const offsetZ = (adjustedAlpha * sensitivity) / 100; // Scale down Z-axis movement

      // Calculate new position relative to the starting position
      const newPosition = {
        x: data.position.x + offsetX,
        y: data.position.y + offsetY,
        z: data.position.z + offsetZ,
      };

      // Apply the position to the entity
      el.setAttribute("position", newPosition);

      // Debug: log the position for testing
      console.log(
        `Position -> X: ${newPosition.x}, Y: ${newPosition.y}, Z: ${newPosition.z}`
      );
    });
  },
});