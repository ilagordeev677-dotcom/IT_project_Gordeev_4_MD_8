// =====================================================
// SHARED PROJECTS DATA
// This file is used by all pages: index.html, projects.html, project.html
// Add your projects here and they will appear everywhere
// =====================================================

const projectsData = [

    {
        id: 'environment',
        title: 'Flasc',
        category: 'Личный проект',
        participants: 'Гордеев Илья',
        client: 'Личный проект',
        year: '2024',
        heroVideo: '/models/video/flask.mkv',
        briefText: 'Создание модели флакона духов. Данная работа была на выставке форума «СмартДизайн». При разработке модели флакона было решено сделать основной акцент на форме. Благодаря совмещению острых форм и эффекта натянутой пленки достигается динамичность формы. ',
        tzText: 'При разработке модели флакона было решено сделать основной акцент на форме. Благодаря совмещению острых форм и эффекта натянутой пленки достигается динамичность формы.',
        cardModel: 'models/flask/флакон2.glb',
        mainModel: 'models/flask/флакон2.glb',
        models: [
            { name: 'Здание', path: 'models/flask/флакон2.glb' },

        ],
        software: ['blender', 'photoshop', 'substance'],
        stages: [
            { software: 'blender', image: '/models/flask/скрины/1.png', description: 'Блокинг формы' },
            { software: 'photoshop', image: '/models/flask/скрины/3.png', description: 'Детализацтя формы' },
            { software: 'substance', image: '/models/flask/скрины/2.png', description: 'Текстурирование' },

        ],
        fallbackType: 'cube'
    },
    {
        id: 'props',
        title: 'Банка',
        category: 'личный проект',
        participants: 'Автор',
        client: 'Личный проект',
        year: '2024',
        heroVideo: '/models/video/банка.mkv',
        briefText: 'Данный объект был разработан в ходе работы на Балтийский берег, использовалась в внутренних презентациях компании, после стала обоснованием необходимости заказа 3д рекламы в крупном рекламном агентстве. ',
        tzText: 'Данная модель повторяет формы и упаковку оригинала, имеет оптимальное количество полигонов, благодаря этому может использоваться как в рекламе, так и в реалистичных рендерах.',
        cardModel: 'models/балт/поза.glb',
        mainModel: 'models/балт/поза.glb',
        models: [
            { name: 'Контейнер', path: 'models/балт/поза.glb' },

        ],
        software: ['blender', 'substance', 'marmoset'],
        stages: [
            { software: 'blender', image: '/models/балт/скрины/1.png', description: 'Моделирование' },
            { software: 'substance', image: '/models/балт/скрины/2.png', description: 'Текстурирование' },
            { software: 'marmoset', image: '/models/балт/скрины/3.png', description: 'Рендер' }
        ],
        fallbackType: 'torus'
    },
        {
        id: 'textures',
        title: 'Animation',
        category: 'личный проект',
        participants: 'Автор',
        client: 'Личный проект',
        year: '2026',
        heroVideo: '/models/video/анимация.mkv',
        briefText: 'В ходе выполнения работы была сделана локация с несколькими точками интереса. Данная локация может быть использована для видеоигры, анимации и рендера.',
        tzText: 'Локация создана в стилистике будущего, имеет множество районов, от богатых кварталов с множеством парков и чистотой до подземных районов с порванными проводами и антисанитарией. В ходе анимации дрон пролетает через все районы, показывая контраст между слоями населения.',
        cardModel: 'models/anim/drone.glb',
        mainModel: 'models/anim/drone.glb',
        models: [
            { name: 'Сфера 1', path: 'models/anim/drone.glb' },
            { name: 'Сфера 2', path: 'models/anim/old_bild.glb' }
        ],
        software: ['blender', 'substance', 'unreal', 'marmoset'],
        stages: [
            { software: 'blender', image: 'models/anim/скрины/1.png', description: 'Скетч' },
            { software: 'substance', image: 'models/anim/скрины/2.png', description: 'Блокинг' },
            { software: 'unreal', image: 'models/anim/скрины/3.png', description: 'Рендер' },
            { software: 'marmoset', image: 'models/anim/скрины/4.png', description: 'Рендер' }
        ],
        fallbackType: 'cylinder'
    },
    {
        id: 'animation',
        title: 'Face animation',
        category: 'Личный проект',
        participants: 'Автор',
        client: 'Личный проект',
        year: '2026',
        heroVideo: '/models/video/face.mp4',
        briefText: 'Данная работа была выполнена с целью ознакомления с новым программным обеспечением. Результатом работы является лицо полностью готовое к анимации. Данная модель поддерживает Motion Capture.',
        tzText: 'Модель разрабатывалась в несколько этапов — от блокинга до высокополигонального моделирования и последующей анимации. В процессе работы форма и силуэт неоднократно уточнялись с целью достижения требуемых характеристик лицевых черт.',
        cardModel: 'models/face/face.glb',
        mainModel: 'models/face/face.glb',
        models: [
            { name: 'Персонаж 1', path: 'models/face/face.glb' },
  
        ],
        software: ['zbrush', 'blender', 'unreal', 'marmoset'],
        stages: [
            { software: 'zbrush', image: 'models/face/скрины/2.png', description: 'Скульптинг' },
            { software: 'blender', image: 'models/face/скрины/1.png', description: 'Ретопология' },
            { software: 'unreal', image: 'models/face/скрины/4.png', description: 'Перенос в unreal engine' },
            { software: 'marmoset', image: 'models/face/скрины/3.png', description: 'Финальный результат' }
        ],
        fallbackType: 'cone'
    },
    {
        id: 'low-poly-character',
        title: 'Fly',
        category: 'личный проект',
        participants: 'Автор',
        client: 'Личный проект',
        year: '2024',
        // Video paths - replace with your own videos
        heroVideo: '/models/video/fly.mp4',
        briefText: 'Данная работа является одной из первых и выполнялась в рамках образовательного процесса.',
        tzText: 'При разработке трехмерной модели был сделан основной упор на топологию. Дизайн модели направлен на минимализм. Модели присущи плавные формы, отсутствие лишних элементов и лаконичность. Сайт дает возможность оценить качество сетки.',
        // 3D model for card preview (on projects page and index page)
        cardModel: 'models/low-poly-character/fly.glb',
        // Main large 3D model for project page brief section
        mainModel: 'models/low-poly-character/fly.glb',
        // 3D model paths for small cards in project page
        models: [
            { name: 'Персонаж', path: 'models/low-poly-character/fly.glb' },

        ],
        software: ['blender', 'photoshop'],
        stages: [
            { software: 'blender', image: '/models/low-poly-character/скрины/1.png', description: 'Блокинг' },
            { software: 'photoshop', image: '/models/low-poly-character/скрины/2.png', description: 'Ретопология' }
        ],
        fallbackType: 'sphere'
    }


];

// Make it available globally
window.projectsData = projectsData;
