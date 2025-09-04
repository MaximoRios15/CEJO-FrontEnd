// Función para obtener y mostrar los datos del usuario actual
async function cargarDatosUsuario() {
    try {
        const response = await fetch('/CEJO/CEJO-BackEnd/public/index.php/usuario-actual', {
            method: 'GET',
            credentials: 'include', // Para incluir cookies de sesión
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener datos del usuario');
        }

        const data = await response.json();
        
        if (data.success) {
            // Actualizar el texto del dropdown con Apellidos, Nombres
            const userDropdown = document.querySelector('.nav-link.dropdown-toggle');
            if (userDropdown) {
                const userText = `${data.data.apellidos}, ${data.data.nombres}`;
                userDropdown.innerHTML = `<i class="fas fa-user"></i> ${userText}`;
            }
        } else {
            console.error('Error:', data.message);
            // Si no hay sesión activa, redirigir al login
            if (response.status === 401) {
                window.location.href = '../cejo-login/login.html';
            }
        }
    } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        // En caso de error, mantener el texto por defecto o redirigir al login
        window.location.href = '../cejo-login/login.html';
    }
}

// Cargar los datos del usuario cuando se carga la página
document.addEventListener('DOMContentLoaded', cargarDatosUsuario);