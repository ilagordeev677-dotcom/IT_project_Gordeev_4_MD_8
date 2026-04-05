// ===== PROJECTS PAGE 3D SCENES =====
// Uses shared projectsData from projects-data.js

class ProjectCard3DScene {
  constructor(canvas, modelPath, fallbackType = 'sphere') {
    this.canvas = canvas;
    this.modelPath = modelPath;
    this.fallbackType = fallbackType;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.model = null;
    this.animationId = null;
    this.isInView = false;

    this.init();
  }

  init() {
    if (typeof THREE === 'undefined') return;

    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf5f5f5);

    // Get canvas dimensions
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width || 300;
    const height = rect.height || 200;

    // Create camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 4);

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.4);
    backLight.position.set(-5, -5, -5);
    this.scene.add(backLight);

    // Try to load model or create fallback
    this.loadModel();

    // Handle resize
    window.addEventListener('resize', () => this.onResize());

    // Setup intersection observer for performance
    this.setupIntersectionObserver();

    // Start animation
    this.animate();
  }

  async loadModel() {
    // Try to load GLB model if path provided
    if (this.modelPath && this.modelPath.endsWith('.glb') && window.modelLoader) {
      try {
        window.modelLoader.init();
        const model = await window.modelLoader.load(this.modelPath, {
          scale: 0.8,
          color: 0x888888,
          applyMaterial: true
        });
        
        this.model = model;
        
        // Center and scale the model
        const box = new THREE.Box3().setFromObject(this.model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;
        
        this.model.scale.setScalar(scale);
        this.model.position.sub(center.multiplyScalar(scale));
        
        this.scene.add(this.model);
        return;
      } catch (error) {
        console.log('[v0] Model load failed, using fallback:', this.modelPath);
      }
    }
    
    // No model path or load failed, use fallback
    this.createFallbackModel();
  }

  createFallbackModel() {
    let geometry;
    
    switch (this.fallbackType) {
      case 'skull':
        geometry = new THREE.IcosahedronGeometry(1, 0);
        break;
      case 'cube':
        geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
        break;
      case 'torus':
        geometry = new THREE.TorusKnotGeometry(0.6, 0.2, 64, 8);
        break;
      case 'cone':
        geometry = new THREE.ConeGeometry(0.8, 1.6, 8);
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(0.6, 0.6, 1.4, 16);
        break;
      case 'sphere':
      default:
        geometry = new THREE.SphereGeometry(0.9, 16, 12);
    }

    const material = new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.5,
      roughness: 0.4,
      flatShading: true
    });

    this.model = new THREE.Mesh(geometry, material);
    this.scene.add(this.model);
  }

  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        this.isInView = entry.isIntersecting;
      });
    }, { threshold: 0.1 });

    observer.observe(this.canvas);
  }

  onResize() {
    if (!this.canvas || !this.camera || !this.renderer) return;
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width || 300;
    const height = rect.height || 200;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    
    // Only animate if in view
    if (this.model && this.isInView) {

      this.model.rotation.y += 0.003;
    }
    
    if (this.isInView && this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
  // Initialize model loader
  if (window.modelLoader) {
    window.modelLoader.init();
  }

  // Initialize 3D scenes for all project cards
  const canvases = document.querySelectorAll('.project-canvas');
  const scenes = [];

  canvases.forEach((canvas, index) => {
    // Get model path and fallback from data attributes or projectsData
    let modelPath = canvas.dataset.model || '';
    let fallbackType = canvas.dataset.fallback || 'sphere';
    
    // Try to get from projectsData if available
    if (window.projectsData && window.projectsData[index]) {
      modelPath = modelPath || window.projectsData[index].cardModel;
      fallbackType = window.projectsData[index].fallbackType || fallbackType;
    }

    const scene = new ProjectCard3DScene(canvas, modelPath, fallbackType);
    scenes.push(scene);
  });

  // Add hover effects
  const cards = document.querySelectorAll('.project-card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-8px)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
});
