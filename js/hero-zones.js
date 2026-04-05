// ===== HERO CURSOR ZONES WITH 3D MODELS (UPGRADED) =====

class HeroZoneModel {
  constructor(canvas, fallbackType, modelPath) {
    this.canvas = canvas;
    this.fallbackType = fallbackType;
    this.modelPath = modelPath;

    this.model = null;
    this.active = false;

    // rotation state
    this._rotX = 0;
    this._rotY = 0;
    this._targetRotX = 0;
    this._targetRotY = 0;

    this._build();
  }

  _build() {
    const THREE = window.THREE;

    const W = this.canvas.clientWidth || 300;
    const H = this.canvas.clientHeight || 300;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(100, W / H, 0.1, 100);
    this.camera.position.set(0, 0, 3); // дальше = не обрезается

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
    });

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(W, H);
    this.renderer.setClearColor(0x000000, 1);

    // LIGHT
    const amb = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(amb);

    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(3, 4, 5);
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0xffffff, 0.4);
    fill.position.set(-3, -2, -3);
    this.scene.add(fill);

    this._loadModel();
    this._startLoop();
  }

  async _loadModel() {
    const THREE = window.THREE;

    // 👉 если есть внешний loader (GLTF)
    if (this.modelPath && window.modelLoader && window.modelLoader.init()) {
      try {
        this.model = await window.modelLoader.load(this.modelPath);

        this._prepareModel(this.model);

        this.scene.add(this.model);
        return;
      } catch (e) {
        console.warn('Model load failed:', e);
      }
    }

    // fallback если нет модели
    this._buildFallback();
  }

  _prepareModel(model) {
    const THREE = window.THREE;

    // центрируем
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);

    // нормализуем размер
    const size = box.getSize(new THREE.Vector3()).length();
    const scale = 2.5 / size;
    model.scale.setScalar(scale);
  }

  _buildFallback() {
    const THREE = window.THREE;

    const shapes = {
      sphere: new THREE.SphereGeometry(1.1, 32, 24),
      cube: new THREE.BoxGeometry(1.6, 1.6, 1.6),
      torus: new THREE.TorusKnotGeometry(0.9, 0.32, 80, 12),
      cone: new THREE.ConeGeometry(1, 2, 5),
      cylinder: new THREE.CylinderGeometry(0.8, 1.0, 1.8, 6),
    };

    const geo = shapes[this.fallbackType] || shapes.sphere;

    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.2,
      roughness: 0.3,
    });

    this.model = new THREE.Mesh(geo, mat);
    this.scene.add(this.model);
  }

  onMouseMove(x, y) {
    // плавное следование курсору
    this._targetRotY = x * 0.8;
    this._targetRotX = y * 0.4;
  }

  _startLoop() {
    const tick = () => {
      requestAnimationFrame(tick);

      if (!this.active || !this.model) return;

      // плавный lerp
      this._rotX += (this._targetRotX - this._rotX) * 0.08;
      this._rotY += (this._targetRotY - this._rotY) * 0.08;

      this.model.rotation.x = this._rotX;
      this.model.rotation.y = this._rotY;

      this.renderer.render(this.scene, this.camera);
    };

    tick();
  }

  resize(w, h) {
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }
}

// ===== ZONE MANAGER =====

class HeroZoneManager {
  constructor() {
    this.hero = document.getElementById('hero');
    this.zoneEls = Array.from(document.querySelectorAll('.hero-zone'));
    this.canvases = Array.from(document.querySelectorAll('.hero-zone-canvas'));

    this.models = [];
    this.activeZone = -1;
    this.NUM_ZONES = 4;

    if (!this.hero) return;

    this.fallbackTypes = ['sphere', 'torus', 'cube', 'cylinder'];
    this.modelPaths = this._resolveModelPaths();

    this._initModels();
    this._bindEvents();
    this._observeResize();
  }

  _resolveModelPaths() {
    const data = window.projectsData || [
        { cardModel: 'models/low-poly-character/fly.glb' },
  { cardModel: 'models/low-poly-character/fly.glb' },
  { cardModel: 'models/low-poly-character/fly.glb' },
  { cardModel: '/models/watch.glb' }
    ];

    return Array.from({ length: this.NUM_ZONES }, (_, i) =>
      data[i]?.cardModel || null
    );
  }

  _initModels() {
    this.canvases.forEach((canvas, i) => {
      const model = new HeroZoneModel(
        canvas,
        this.fallbackTypes[i],
        this.modelPaths[i]
      );
      this.models.push(model);
    });
  }

  _bindEvents() {
    this.hero.addEventListener('mousemove', (e) => {
      const rect = this.hero.getBoundingClientRect();

      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;

      const normX = (relX / rect.width) * 2 - 1;
      const normY = (relY / rect.height) * 2 - 1;

      const zone = Math.min(
        this.NUM_ZONES - 1,
        Math.floor((relX / rect.width) * this.NUM_ZONES)
      );

      this._activateZone(zone);

      if (this.models[zone]) {
        this.models[zone].onMouseMove(normX, normY);
      }
    });

    this.hero.addEventListener('mouseleave', () => {
      this._activateZone(-1);
    });
  }

  _activateZone(index) {
    if (index === this.activeZone) return;

    this.activeZone = index;

    this.zoneEls.forEach((el, i) => {
      const active = i === index;

      el.classList.toggle('visible', active);

      if (this.models[i]) {
        this.models[i].active = active;
      }
    });
  }

  _observeResize() {
    const ro = new ResizeObserver(() => {
      this.canvases.forEach((canvas, i) => {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;

        if (w && h && this.models[i]) {
          this.models[i].resize(w, h);
        }
      });
    });

    ro.observe(this.hero);
  }
}

// ===== INIT =====

document.addEventListener('DOMContentLoaded', () => {
  const boot = () => {
    if (typeof THREE === 'undefined') {
      setTimeout(boot, 100);
      return;
    }

    if (window.modelLoader) window.modelLoader.init();

    new HeroZoneManager();
  };

  boot();
});