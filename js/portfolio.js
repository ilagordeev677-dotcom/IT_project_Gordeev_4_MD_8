// ===== PORTFOLIO MAIN PAGE =====
// Uses shared projectsData from projects-data.js

// Small 3D Card Scene
class SmallCard3DScene {
  constructor(canvas, modelPath, fallbackType = 'torus') {
    this.canvas = canvas;
    this.modelPath = modelPath;
    this.fallbackType = fallbackType;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.model = null;
    this.animationId = null;
    this.isInView = true;

    this.init();
  }

  init() {
    if (typeof THREE === 'undefined') return;

    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf5f5f5);

    // Get canvas dimensions
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width || 140;
    const height = rect.height || 180;

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

    // Load model
    this.loadModel();

    // Handle resize
    window.addEventListener('resize', () => this.onResize());

    // Start animation
    this.animate();
  }

  async loadModel() {
    // Try to load GLB model
    if (this.modelPath && this.modelPath.endsWith('.glb') && window.modelLoader) {
      try {
        window.modelLoader.init();
        const model = await window.modelLoader.load(this.modelPath, {
          scale: 1.5,
          color: 0x333333,
          applyMaterial: true
        });
        this.model = model;
        this.scene.add(this.model);
        this.centerModel();
        return;
      } catch (error) {
        console.log('[v0] Model load failed, using fallback:', this.modelPath);
      }
    }
    // Fallback to geometry
    this.createFallback();
  }

  createFallback() {
    let geometry;
    switch (this.fallbackType) {
      case 'skull':
        geometry = new THREE.IcosahedronGeometry(0.8, 0);
        break;
      case 'cube':
        geometry = new THREE.BoxGeometry(1, 1, 1);
        break;
      case 'torus':
        geometry = new THREE.TorusKnotGeometry(0.5, 0.2, 64, 8);
        break;
      case 'cone':
        geometry = new THREE.ConeGeometry(0.6, 1.2, 8);
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(0.5, 0.5, 1.2, 16);
        break;
      default:
        geometry = new THREE.SphereGeometry(0.7, 16, 12);
    }

    const material = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.5,
      roughness: 0.4,
      flatShading: true
    });

    this.model = new THREE.Mesh(geometry, material);
    this.scene.add(this.model);
  }

  centerModel() {
    if (!this.model) return;
    const box = new THREE.Box3().setFromObject(this.model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    this.model.position.sub(center);
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 1.5 / maxDim;
    this.model.scale.setScalar(scale);
  }

  onResize() {
    if (!this.canvas || !this.camera || !this.renderer) return;
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width || 140;
    const height = rect.height || 180;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    if (this.model && this.isInView) {
      this.model.rotation.y += 0.01;
    }
    if (this.renderer && this.scene && this.camera) {
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

// ===== VIDEO SWITCHER WITH PROJECT DATA =====
class VideoSwitcher {
  constructor() {
    this.video = document.getElementById('project-video');
    this.placeholder = document.getElementById('video-placeholder');
    this.cardsContainer = document.querySelector('.small-projects');
    this.viewProjectBtn = document.getElementById('btn-view-current-project');
    this.currentProjectIndex = 0;
    this.scenes = [];
    this.autoSwitchEnabled = true;

    this.init();
  }

  init() {
    // Wait for projectsData to be available
    if (!window.projectsData) {
      console.warn('[v0] projectsData not loaded yet');
      return;
    }

    // Generate cards from projectsData
    this.generateCards();

    // Select first project by default
    this.switchProject(0);

    // Listen for video end to auto-switch
    if (this.video) {
      this.video.addEventListener('ended', () => {
        if (this.autoSwitchEnabled) {
          this.nextProject();
        }
      });
    }

    // Update view project button link
    this.updateViewProjectButton();
  }

  updateViewProjectButton() {
    if (this.viewProjectBtn && window.projectsData[this.currentProjectIndex]) {
      const project = window.projectsData[this.currentProjectIndex];
      this.viewProjectBtn.href = `project.html?id=${project.id}`;
    }
  }

  generateCards() {
    if (!this.cardsContainer) return;

    // Clear existing cards
    this.cardsContainer.innerHTML = '';

    // Create cards for each project (limit to first 3 for main page)
    const projectsToShow = window.projectsData.slice(0, 3);
    
    projectsToShow.forEach((project, index) => {
      const card = document.createElement('div');
      card.className = 'small-project-card';
      card.dataset.project = index;
      card.dataset.video = project.heroVideo;
      card.dataset.model = project.cardModel;
      card.dataset.id = project.id;
      card.innerHTML = `<canvas class="small-project-canvas"></canvas>`;
      
      this.cardsContainer.appendChild(card);

      // Initialize 3D scene
      const canvas = card.querySelector('.small-project-canvas');
      if (canvas) {
        const scene = new SmallCard3DScene(canvas, project.cardModel, project.fallbackType);
        this.scenes.push(scene);
      }

      // Add click handler
      card.addEventListener('click', () => {
        this.switchProject(index);
      });
    });
  }

  switchProject(index) {
    const cards = document.querySelectorAll('.small-project-card');
    const project = window.projectsData[index];
    
    if (!project) return;

    // Update active state
    cards.forEach((c, i) => c.classList.toggle('active', i === index));

    const videoSrc = project.heroVideo;

    // Switch video
    if (videoSrc && this.video) {
      this.video.src = videoSrc;
      this.video.load();
      this.video.play().then(() => {
        if (this.placeholder) {
          this.placeholder.classList.add('hidden');
        }
      }).catch(() => {
        // Video not available, show placeholder
        if (this.placeholder) {
          this.placeholder.classList.remove('hidden');
          this.placeholder.innerHTML = `<span>${project.title}</span>`;
        }
      });
    } else {
      // No video, show placeholder
      if (this.placeholder) {
        this.placeholder.classList.remove('hidden');
        this.placeholder.innerHTML = `<span>${project.title}</span>`;
      }
    }

    this.currentProjectIndex = index;
    
    // Update view project button
    this.updateViewProjectButton();
  }

  nextProject() {
    const nextIndex = (this.currentProjectIndex + 1) % Math.min(window.projectsData.length, 3);
    this.switchProject(nextIndex);
  }
}

// ===== SMOOTH SCROLL =====
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// ===== NAV SCROLL HIGHLIGHTING =====
function initNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function highlightNav() {
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', highlightNav);
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
  // Initialize model loader
  if (window.modelLoader) {
    window.modelLoader.init();
  }

  // Initialize video switcher with 3D cards
  new VideoSwitcher();

  // Initialize interactions
  initSmoothScroll();
  initNavHighlight();
});
