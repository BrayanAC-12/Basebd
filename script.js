// DATOS INICIALES - RÉPLICA EXACTA DE TU DISEÑO
const initialWeeksData = [
    { 
        id: 1, 
        title: "Diagrama y Práctica", 
        files: ["WEEK_01.DXE"], 
        status: "completed", 
        content: "Contenido completo de diagramas y prácticas de la semana 1.\n\nIncluye:\n- Diagramas conceptuales\n- Ejercicios prácticos\n- Casos de estudio\n- Material complementario",
        elements: ["COMPLETADO", "Diagrama", "Práctica"],
        fileData: []
    },
    { 
        id: 2, 
        title: "Modelo Relacional", 
        files: [], 
        status: "pending", 
        content: "",
        elements: [],
        fileData: []
    },
    { 
        id: 3, 
        title: "Tablas", 
        files: [], 
        status: "pending", 
        content: "",
        elements: [],
        fileData: []
    }
];

// Generar semanas 4-16
for (let i = 4; i <= 16; i++) {
    initialWeeksData.push({ 
        id: i, 
        title: `Semana ${i}`, 
        files: [], 
        status: "pending", 
        content: "",
        elements: [],
        fileData: []
    });
}

// ESTADO DE LA APLICACIÓN
let currentUser = null;
let isAdmin = false;
let weeksData = [];
let currentWeekViewing = null;
let filesToUpload = [];

// INICIALIZAR APLICACIÓN
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

// FUNCIÓN PRINCIPAL DE INICIALIZACIÓN
function initApp() {
    loadData();
    setupNavigation();
    setupEventListeners();
    renderWeeks();
    populateWeekSelect();
    checkAuthStatus();
    
    console.log('Sistema iniciado correctamente');
}

// CARGAR DATOS
function loadData() {
    const savedWeeks = localStorage.getItem('weeksData');
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedWeeks) {
        weeksData = JSON.parse(savedWeeks);
    } else {
        weeksData = JSON.parse(JSON.stringify(initialWeeksData));
    }
    
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        isAdmin = currentUser.role === 'admin';
    }
}

// GUARDAR DATOS
function saveData() {
    localStorage.setItem('weeksData', JSON.stringify(weeksData));
}

// CONFIGURAR NAVEGACIÓN CORREGIDA
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            mostrarSeccion(targetId);
        });
    });
    
    // Mostrar sección inicial
    mostrarSeccion('inicio');
}

// CONFIGURAR EVENT LISTENERS
function setupEventListeners() {
    // Botones de login/logout
    document.getElementById('loginBtn').addEventListener('click', function() {
        abrirModal('loginModal');
    });
    
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Formularios
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('adminForm').addEventListener('submit', handleSaveContent);
    
    // Botones admin
    document.getElementById('deleteContent').addEventListener('click', handleDeleteContent);
    document.getElementById('clearForm').addEventListener('click', clearAdminForm);
    
    // Upload de archivos
    document.getElementById('fileUpload').addEventListener('change', handleFileSelect);
    
    // Cerrar modales
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                cerrarModal(modal.id);
            }
        });
    });
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            cerrarModal(e.target.id);
        }
    });
}

// MOSTRAR SECCIÓN CORREGIDA
function mostrarSeccion(sectionId) {
    // Oculta todas las secciones
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remueve active de todos los links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Muestra la sección seleccionada
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Activa el link correspondiente
    const targetLink = document.querySelector(`a[href="#${sectionId}"]`);
    if (targetLink) {
        targetLink.classList.add('active');
    }
    
    // Scroll suave a la sección
    if (targetSection) {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// RENDERIZAR SEMANAS
function renderWeeks() {
    const weeksContainer = document.getElementById('weeksContainer');
    if (!weeksContainer) return;
    
    weeksContainer.innerHTML = '';
    
    weeksData.forEach(week => {
        const card = document.createElement('div');
        card.className = 'trabajo-card';
        
        const statusClass = week.status === 'completed' ? 'status-completed' : 'status-pending';
        const statusText = week.status === 'completed' ? 'COMPLETADO' : 'PENDIENTE';
        
        card.innerHTML = `
            <div class="trabajo-header">
                <div class="week-number">${week.id.toString().padStart(2, '0')}</div>
                <div class="status ${statusClass}">${statusText}</div>
            </div>
            
            <div class="week-title">${week.title}</div>
            
            ${week.files.length > 0 ? `
                <ul class="week-files">
                    ${week.files.map(file => `<li>${file}</li>`).join('')}
                </ul>
            ` : ''}
            
            ${week.elements.length > 0 ? `
                <ul class="week-files">
                    ${week.elements.map(element => `<li>${element}</li>`).join('')}
                </ul>
            ` : '<p style="color: #6c757d; font-style: italic;">No hay contenido disponible</p>'}
            
            <div class="trabajo-actions">
                <button class="btn-primary ver-trabajo" data-week="${week.id}">
                    👁️ Ver Trabajo
                </button>
                ${isAdmin ? `
                    <button class="btn-secondary editar-trabajo" data-week="${week.id}">
                    ✏️ Editar
                    </button>
                ` : ''}
            </div>
        `;
        
        weeksContainer.appendChild(card);
    });
    
    // Event listeners para botones dinámicos
    document.querySelectorAll('.ver-trabajo').forEach(btn => {
        btn.addEventListener('click', function() {
            const weekId = parseInt(this.getAttribute('data-week'));
            verTrabajo(weekId);
        });
    });
    
    if (isAdmin) {
        document.querySelectorAll('.editar-trabajo').forEach(btn => {
            btn.addEventListener('click', function() {
                const weekId = parseInt(this.getAttribute('data-week'));
                editarTrabajo(weekId);
            });
        });
    }
}

// LLENAR SELECTOR DE SEMANAS
function populateWeekSelect() {
    const weekSelect = document.getElementById('weekSelect');
    if (!weekSelect) return;
    
    weekSelect.innerHTML = '<option value="">-- Elegir semana --</option>';
    weeksData.forEach(week => {
        const option = document.createElement('option');
        option.value = week.id;
        option.textContent = `Semana ${week.id.toString().padStart(2, '0')} - ${week.title}`;
        weekSelect.appendChild(option);
    });
}

// VERIFICAR AUTENTICACIÓN
function checkAuthStatus() {
    updateUI();
}

// ACTUALIZAR INTERFAZ
function updateUI() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminNavLink = document.getElementById('adminNavLink');
    
    if (!loginBtn || !logoutBtn || !adminNavLink) return;
    
    if (isAdmin) {
        loginBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        adminNavLink.classList.remove('hidden');
    } else if (currentUser) {
        loginBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        adminNavLink.classList.add('hidden');
    } else {
        loginBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
        adminNavLink.classList.add('hidden');
    }
    
    renderWeeks();
}

// MANEJAR LOGIN
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    let message = '';
    let type = 'success';
    
    if (username === 'admin' && password === 'admin123') {
        currentUser = { username: 'admin', role: 'admin' };
        isAdmin = true;
        message = '✅ Login exitoso como administrador';
    } else if (username === 'usuario' && password === 'user123') {
        currentUser = { username: 'usuario', role: 'user' };
        isAdmin = false;
        message = '✅ Login exitoso como usuario';
    } else {
        message = '❌ Credenciales incorrectas';
        type = 'error';
    }
    
    if (type === 'success') {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateUI();
        cerrarModal('loginModal');
        mostrarSeccion('trabajos');
    }
    
    mostrarMensaje('loginMessage', message, type);
}

// CERRAR SESIÓN
function logout() {
    currentUser = null;
    isAdmin = false;
    localStorage.removeItem('currentUser');
    updateUI();
    mostrarSeccion('inicio');
    mostrarMensaje('loginMessage', '👋 Sesión cerrada correctamente', 'success');
}

// ABRIR MODAL
function abrirModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

// CERRAR MODAL
function cerrarModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// VER TRABAJO COMPLETO
function verTrabajo(weekId) {
    const week = weeksData.find(w => w.id === weekId);
    
    if (!week || week.status === 'pending') {
        mostrarMensaje('loginMessage', '📭 Esta semana no tiene contenido disponible', 'error');
        return;
    }
    
    currentWeekViewing = weekId;
    document.getElementById('modalTitle').textContent = `Semana ${weekId.toString().padStart(2, '0')} - ${week.title}`;
    
    let contentHTML = `
        <div class="contenido-semana">
            <h4>📋 Descripción del trabajo:</h4>
            <div class="contenido-texto">
                ${week.content.replace(/\n/g, '<br>')}
            </div>
    `;
    
    if (week.files.length > 0) {
        contentHTML += `
            <h4>📁 Archivos adjuntos:</h4>
            <ul>
                ${week.files.map(file => `<li>${file}</li>`).join('')}
            </ul>
        `;
    }
    
    contentHTML += `</div>`;
    
    document.getElementById('modalBody').innerHTML = contentHTML;
    
    // Configurar descargas
    setupDownloadOptions(week);
    
    abrirModal('contentModal');
}

// CONFIGURAR OPCIONES DE DESCARGA
function setupDownloadOptions(week) {
    const fileDownloads = document.getElementById('fileDownloads');
    if (!fileDownloads) return;
    
    fileDownloads.innerHTML = '';
    
    if (week.files.length > 0) {
        week.files.forEach(fileName => {
            const downloadLink = document.createElement('a');
            downloadLink.href = '#';
            downloadLink.className = 'download-link';
            downloadLink.textContent = `📥 ${fileName}`;
            downloadLink.onclick = (e) => {
                e.preventDefault();
                descargarArchivoSimulado(fileName, week.content);
            };
            fileDownloads.appendChild(downloadLink);
        });
    }
}

// DESCARGAR ARCHIVO SIMULADO
function descargarArchivoSimulado(fileName, content) {
    const contenido = `Archivo: ${fileName}\n\nDescripción:\n${content}\n\nGenerado automáticamente por el sistema.`;
    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// MANEJAR SELECCIÓN DE ARCHIVOS
function handleFileSelect(e) {
    filesToUpload = Array.from(e.target.files);
    updateFilePreview();
}

// ACTUALIZAR VISTA PREVIA DE ARCHIVOS
function updateFilePreview() {
    const fileList = document.getElementById('fileList');
    const uploadPreview = document.getElementById('uploadPreview');
    
    if (!fileList || !uploadPreview) return;
    
    fileList.innerHTML = '';
    
    if (filesToUpload.length > 0) {
        uploadPreview.classList.remove('hidden');
        filesToUpload.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <span>📄 ${file.name}</span>
                <button onclick="removeFile(${index})" class="btn-danger" style="padding: 0.2rem 0.5rem; font-size: 0.8rem;">×</button>
            `;
            fileList.appendChild(fileItem);
        });
    } else {
        uploadPreview.classList.add('hidden');
    }
}

// ELIMINAR ARCHIVO DE LA LISTA
function removeFile(index) {
    filesToUpload.splice(index, 1);
    document.getElementById('fileUpload').value = '';
    updateFilePreview();
}

// EDITAR TRABAJO
function editarTrabajo(weekId) {
    const week = weeksData.find(w => w.id === weekId);
    if (!week) return;
    
    document.getElementById('weekSelect').value = week.id;
    document.getElementById('contentTitle').value = week.title;
    document.getElementById('contentDescription').value = week.content;
    
    filesToUpload = [];
    updateFilePreview();
    
    if (week.status === 'completed') {
        document.getElementById('deleteContent').classList.remove('hidden');
    } else {
        document.getElementById('deleteContent').classList.add('hidden');
    }
    
    mostrarSeccion('admin');
}

// GUARDAR CONTENIDO
function handleSaveContent(e) {
    e.preventDefault();
    
    const weekId = parseInt(document.getElementById('weekSelect').value);
    const title = document.getElementById('contentTitle').value;
    const description = document.getElementById('contentDescription').value;
    
    if (!weekId || !title) {
        mostrarMensaje('adminMessage', '❌ Completa todos los campos obligatorios', 'error');
        return;
    }
    
    const weekIndex = weeksData.findIndex(w => w.id === weekId);
    if (weekIndex === -1) return;
    
    // Actualizar datos
    weeksData[weekIndex].title = title;
    weeksData[weekIndex].content = description;
    weeksData[weekIndex].status = 'completed';
    
    // Procesar archivos
    if (filesToUpload.length > 0) {
        const newFiles = filesToUpload.map(file => file.name);
        weeksData[weekIndex].files = newFiles;
        weeksData[weekIndex].elements = ["COMPLETADO", ...newFiles.map(f => f.split('.')[0]), "Práctica"];
    }
    
    saveData();
    renderWeeks();
    populateWeekSelect();
    document.getElementById('deleteContent').classList.remove('hidden');
    
    mostrarMensaje('adminMessage', '✅ Contenido guardado exitosamente', 'success');
    
    // Limpiar después de guardar
    setTimeout(() => {
        clearAdminForm();
        mostrarSeccion('trabajos');
    }, 2000);
}

// ELIMINAR CONTENIDO
function handleDeleteContent() {
    const weekId = parseInt(document.getElementById('weekSelect').value);
    const weekIndex = weeksData.findIndex(w => w.id === weekId);
    
    if (weekIndex !== -1 && confirm('¿Estás seguro de eliminar el contenido de esta semana?')) {
        weeksData[weekIndex] = {
            ...weeksData[weekIndex],
            files: [],
            fileData: [],
            status: 'pending',
            content: '',
            elements: []
        };
        
        saveData();
        renderWeeks();
        populateWeekSelect();
        clearAdminForm();
        
        mostrarMensaje('adminMessage', '✅ Contenido eliminado correctamente', 'success');
    }
}

// LIMPIAR FORMULARIO
function clearAdminForm() {
    document.getElementById('adminForm').reset();
    filesToUpload = [];
    updateFilePreview();
    document.getElementById('deleteContent').classList.add('hidden');
}

// MOSTRAR MENSAJES
function mostrarMensaje(elementId, mensaje, tipo) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `<div style="padding: 10px; border-radius: 5px; margin: 10px 0; background: ${tipo === 'success' ? '#d4edda' : '#f8d7da'}; color: ${tipo === 'success' ? '#155724' : '#721c24'}; border: 1px solid ${tipo === 'success' ? '#c3e6cb' : '#f5c6cb'};">${mensaje}</div>`;
        setTimeout(() => {
            if (element) element.innerHTML = '';
        }, 3000);
    }
}

// Hacer funciones globales para HTML
window.mostrarSeccion = mostrarSeccion;
window.cerrarModal = cerrarModal;
window.removeFile = removeFile;
window.abrirModal = abrirModal;