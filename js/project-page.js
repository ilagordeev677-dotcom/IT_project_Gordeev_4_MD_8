// Project Page JavaScript
// Uses shared projectsData from projects-data.js

document.addEventListener('DOMContentLoaded', () => {
    // Wait for projectsData to be available
    if (!window.projectsData) {
        console.error('projectsData not loaded');
        return;
    }

    // Get current project ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id') || window.projectsData[0].id;
    
    let currentProjectIndex = window.projectsData.findIndex(p => p.id === projectId);
    if (currentProjectIndex === -1) currentProjectIndex = 0;

    let currentProject = window.projectsData[currentProjectIndex];
    let currentStageIndex = 0;
    let showTopology = false;
    let modelViewers = [];
    let mainModelViewer = null;
    let selectedModelIndex = 0;

    // Initialize page
    function initPage() {
        updateProjectContent();
        initModelsRow();
        initEventListeners();
        updateVideos();
    }

    // Update videos for current project
    function updateVideos() {
        const heroVideo = document.getElementById('hero-video');
        
        if (heroVideo && currentProject.heroVideo) {
            heroVideo.innerHTML = `<source src="${currentProject.heroVideo}" type="video/mp4">`;
            heroVideo.load();
            heroVideo.play().catch(() => {});
        }
    }

    // Update page content
    function updateProjectContent() {
        document.getElementById('project-title').textContent = currentProject.title;
        document.getElementById('project-participants').textContent = currentProject.participants;
        document.getElementById('project-client').textContent = currentProject.client;
        document.getElementById('project-year').textContent = currentProject.year;
        document.getElementById('brief-text').textContent = currentProject.briefText;
        document.getElementById('tz-text').textContent = currentProject.tzText;
        
        document.title = `${currentProject.title} - PORTFOLIO`;
        
        updateSoftwareButtons();
        updateStageContent();
    }

    // Update software buttons
    function updateSoftwareButtons() {
        const container = document.getElementById('stage-software');
        const buttons = container.querySelectorAll('.software-btn');
        
        buttons.forEach(btn => {
            const software = btn.dataset.software;
            if (currentProject.software.includes(software)) {
                btn.style.display = 'flex';
            } else {
                btn.style.display = 'none';
            }
        });

        // Set first available as active
        const visibleButtons = Array.from(buttons).filter(btn => btn.style.display !== 'none');
        visibleButtons.forEach((btn, i) => btn.classList.toggle('active', i === 0));
        currentStageIndex = 0;
        updateStageContent();
    }

    // Update stage content
    function updateStageContent() {
        if (currentProject.stages && currentProject.stages[currentStageIndex]) {
            const stage = currentProject.stages[currentStageIndex];
            const stageImage = document.getElementById('stage-image');
            const stageDescription = document.getElementById('stage-description');
            
            if (stageImage) {
                stageImage.src = stage.image || '/placeholder.svg?height=400&width=600';
            }
            if (stageDescription) {
                stageDescription.textContent = stage.description;
            }
        }
    }

    // Initialize main large 3D model with manual rotation only
    function initMainModel(modelPath, fallbackType) {
        const container = document.getElementById('main-model-container');
        if (!container || typeof THREE === 'undefined') return;

        // Clear previous
        container.innerHTML = '<canvas id="main-model-canvas"></canvas>';
        const canvas = document.getElementById('main-model-canvas');

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf5f5f5);

        const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.set(0, 0, 4);

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        const backLight = new THREE.DirectionalLight(0xffffff, 0.4);
        backLight.position.set(-5, -5, -5);
        scene.add(backLight);

        // Fallback geometries
        const fallbackGeometries = {
            'sphere': new THREE.SphereGeometry(1, 32, 24),
            'cube': new THREE.BoxGeometry(1.5, 1.5, 1.5),
            'torus': new THREE.TorusKnotGeometry(0.8, 0.3, 100, 16),
            'cone': new THREE.ConeGeometry(1, 2, 8),
            'cylinder': new THREE.CylinderGeometry(0.8, 0.8, 2, 16),
            'skull': new THREE.IcosahedronGeometry(1.2, 0)
        };

        const geometry = fallbackGeometries[fallbackType] || fallbackGeometries['sphere'];
        
        // Materials
        const renderMaterial = new THREE.MeshStandardMaterial({
            color: 0x666666,
            roughness: 0.4,
            metalness: 0.6,
            flatShading: true
        });
        
        const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            wireframe: true
        });

        let mesh = new THREE.Mesh(geometry, showTopology ? wireframeMaterial : renderMaterial);
        scene.add(mesh);

        // Manual rotation variables
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        let rotationVelocity = { x: 0, y: 0 };

        // Mouse/touch event handlers for manual rotation
        canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
            canvas.style.cursor = 'grabbing';
        });

        canvas.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;
            
            rotationVelocity.x = deltaY * 0.01;
            rotationVelocity.y = deltaX * 0.01;
            
            if (mesh) {
                mesh.rotation.y += deltaX * 0.01;
                mesh.rotation.x += deltaY * 0.01;
            }
            
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        canvas.addEventListener('mouseup', () => {
            isDragging = false;
            canvas.style.cursor = 'grab';
        });

        canvas.addEventListener('mouseleave', () => {
            isDragging = false;
            canvas.style.cursor = 'grab';
        });

        // Touch events
        canvas.addEventListener('touchstart', (e) => {
            isDragging = true;
            previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        });

        canvas.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            
            const deltaX = e.touches[0].clientX - previousMousePosition.x;
            const deltaY = e.touches[0].clientY - previousMousePosition.y;
            
            if (mesh) {
                mesh.rotation.y += deltaX * 0.01;
                mesh.rotation.x += deltaY * 0.01;
            }
            
            previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        });

        canvas.addEventListener('touchend', () => {
            isDragging = false;
        });

        // Store viewer data
        mainModelViewer = { 
            scene, 
            camera, 
            renderer, 
            mesh, 
            renderMaterial, 
            wireframeMaterial,
            container
        };

        // Try to load actual model
        if (modelPath && window.modelLoader) {
            window.modelLoader.init();
            window.modelLoader.load(modelPath, {
                scale: 2,
                color: 0x666666,
                applyMaterial: true
            }).then((model) => {
                scene.remove(mesh);
                
                // Apply appropriate material based on topology state
                model.traverse((child) => {
                    if (child.isMesh) {
                        child.material = showTopology ? wireframeMaterial : renderMaterial;
                    }
                });
                
                mesh = model;
                scene.add(mesh);
                
                // Center model
                const box = new THREE.Box3().setFromObject(mesh);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 2.5 / maxDim;
                mesh.scale.setScalar(scale);
                mesh.position.sub(center.multiplyScalar(scale));
                
                // Update reference
                mainModelViewer.mesh = mesh;
            }).catch(() => {
                // Keep fallback
            });
        }

        // Animation loop - no auto rotation, just render
        function animate() {
            requestAnimationFrame(animate);
            
            // Apply inertia when not dragging
            if (!isDragging && mesh) {
                rotationVelocity.x *= 0.95;
                rotationVelocity.y *= 0.95;
                mesh.rotation.x += rotationVelocity.x;
                mesh.rotation.y += rotationVelocity.y;
            }
            
            renderer.render(scene, camera);
        }
        animate();

        // Handle resize
        const resizeObserver = new ResizeObserver(() => {
            const width = container.clientWidth;
            const height = container.clientHeight;
            if (width && height) {
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
            }
        });
        resizeObserver.observe(container);
    }

    // Initialize 3D models row (small cards without labels)
    function initModelsRow() {
        const container = document.getElementById('brief-models-row');
        if (!container) return;

        container.innerHTML = '';
        modelViewers = [];
        selectedModelIndex = 0;

        // Create model cards based on project models
        const models = currentProject.models || [];
        
        // Initialize first model as the main viewer
        if (models.length > 0) {
            initMainModel(models[0].path, models[0].fallbackType || currentProject.fallbackType);
        } else {
            initMainModel(currentProject.mainModel, currentProject.fallbackType);
        }
        
        for (let i = 0; i < models.length; i++) {
            const model = models[i];
            const card = document.createElement('div');
            card.className = 'brief-model-card' + (i === 0 ? ' active' : '');
            card.innerHTML = `
                <canvas class="brief-model-canvas" data-index="${i}" data-model="${model.path}"></canvas>
            `;
            container.appendChild(card);

            // Add click event to switch main model
            card.addEventListener('click', () => {
                document.querySelectorAll('.brief-model-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                selectedModelIndex = i;
                
                // Update the large model to show the selected model
                initMainModel(model.path, model.fallbackType || currentProject.fallbackType);
            });

            // Initialize 3D for each card
            const canvas = card.querySelector('canvas');
            initModelViewer(canvas, i, model.path, model.fallbackType);
        }
    }

    // Initialize individual model viewer (small cards)
    function initModelViewer(canvas, index, modelPath, fallbackType) {
        if (!canvas || typeof THREE === 'undefined') return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf5f5f5);

        const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
        camera.position.set(0, 0, 2.5);

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setSize(canvas.clientWidth || 150, canvas.clientHeight || 150);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(3, 3, 3);
        scene.add(directionalLight);

        // Fallback geometries for small cards
        const geometries = {
            'sphere': new THREE.SphereGeometry(0.8, 32, 24),
            'cube': new THREE.BoxGeometry(1, 1, 1),
            'torus': new THREE.TorusKnotGeometry(0.5, 0.2, 64, 16),
            'cone': new THREE.ConeGeometry(0.6, 1.2, 8),
            'cylinder': new THREE.CylinderGeometry(0.5, 0.5, 1.2, 16),
            'skull': new THREE.IcosahedronGeometry(0.8, 0)
        };

        const geometry = geometries[fallbackType] || geometries['sphere'];
        
        // Create both render and wireframe materials
        const renderMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x888888,
            roughness: 0.4,
            metalness: 0.6
        });
        
        const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            wireframe: true
        });

        let mesh = new THREE.Mesh(geometry, showTopology ? wireframeMaterial : renderMaterial);
        scene.add(mesh);

        // Store viewer data
        const viewerData = {
            scene,
            camera,
            renderer,
            mesh,
            renderMaterial,
            wireframeMaterial,
            isWireframe: showTopology,
            modelPath
        };
        modelViewers.push(viewerData);

        // Try to load actual model if path provided
        if (modelPath && window.modelLoader) {
            window.modelLoader.init();
            window.modelLoader.load(modelPath, {
                scale: 1.2,
                color: 0x888888,
                applyMaterial: true
            }).then((model) => {
                scene.remove(mesh);
                
                // Apply appropriate material based on topology state
                model.traverse((child) => {
                    if (child.isMesh) {
                        child.material = showTopology ? wireframeMaterial : renderMaterial;
                    }
                });
                
                mesh = model;
                scene.add(mesh);
                
                // Center and scale the model
                const box = new THREE.Box3().setFromObject(mesh);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 1.2 / maxDim;
                mesh.scale.setScalar(scale);
                mesh.position.sub(center.multiplyScalar(scale));
                
                viewerData.mesh = mesh;
            }).catch(() => {
                // Model load failed, keep fallback geometry
            });
        }

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            if (mesh) {
                mesh.rotation.y += 0.01;
  
            }
            renderer.render(scene, camera);
        }
        animate();

        // Handle resize
        const resizeObserver = new ResizeObserver(() => {
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            if (width && height) {
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
            }
        });
        resizeObserver.observe(canvas);
    }

    // Toggle between render and topology view
    function toggleTopology(isTopology) {
        showTopology = isTopology;
        
        // Update all small model viewers
        modelViewers.forEach(viewer => {
            if (viewer.mesh) {
                viewer.mesh.traverse((child) => {
                    if (child.isMesh) {
                        child.material = isTopology ? viewer.wireframeMaterial : viewer.renderMaterial;
                    }
                });
                viewer.isWireframe = isTopology;
            }
        });
        
        // Update main large model
        if (mainModelViewer && mainModelViewer.mesh) {
            mainModelViewer.mesh.traverse((child) => {
                if (child.isMesh) {
                    child.material = isTopology ? mainModelViewer.wireframeMaterial : mainModelViewer.renderMaterial;
                }
            });
        }
    }

    // Navigate to project
    function navigateToProject(index) {
        currentProjectIndex = index;
        currentProject = window.projectsData[currentProjectIndex];
        currentStageIndex = 0;
        showTopology = false;
        
        // Reset topology buttons
        const btnRender = document.getElementById('btn-render');
        const btnTopology = document.getElementById('btn-topology');
        btnRender?.classList.add('btn-toggle-active');
        btnTopology?.classList.remove('btn-toggle-active');
        
        // Update URL without reload
        const newUrl = `?id=${currentProject.id}`;
        window.history.pushState({}, '', newUrl);
        
        // Update all content
        updateProjectContent();
        initModelsRow();
        updateVideos();
        
        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Initialize event listeners
    function initEventListeners() {
        // Navigation arrows - SWITCH BETWEEN PROJECTS
        document.getElementById('prev-project')?.addEventListener('click', () => {
            const newIndex = (currentProjectIndex - 1 + window.projectsData.length) % window.projectsData.length;
            navigateToProject(newIndex);
        });

        document.getElementById('next-project')?.addEventListener('click', () => {
            const newIndex = (currentProjectIndex + 1) % window.projectsData.length;
            navigateToProject(newIndex);
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                const newIndex = (currentProjectIndex - 1 + window.projectsData.length) % window.projectsData.length;
                navigateToProject(newIndex);
            } else if (e.key === 'ArrowRight') {
                const newIndex = (currentProjectIndex + 1) % window.projectsData.length;
                navigateToProject(newIndex);
            }
        });

        // Render/Topology toggle
        const btnRender = document.getElementById('btn-render');
        const btnTopology = document.getElementById('btn-topology');

        btnRender?.addEventListener('click', function() {
            this.classList.add('btn-toggle-active');
            btnTopology?.classList.remove('btn-toggle-active');
            toggleTopology(false);
        });

        btnTopology?.addEventListener('click', function() {
            this.classList.add('btn-toggle-active');
            btnRender?.classList.remove('btn-toggle-active');
            toggleTopology(true);
        });

        // Software buttons
        document.querySelectorAll('.software-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                const software = btn.dataset.software;
                const stageIndex = currentProject.stages.findIndex(s => s.software === software);
                
                if (stageIndex !== -1) {
                    currentStageIndex = stageIndex;
                    
                    // Update active state
                    document.querySelectorAll('.software-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    updateStageContent();
                }
            });
        });
    }

    // Start
    initPage();
});
