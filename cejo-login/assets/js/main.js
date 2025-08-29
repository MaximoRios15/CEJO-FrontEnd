document.getElementById("loginForm").addEventListener("submit", function(e){
  e.preventDefault();

  const usuario = document.getElementById("usuario").value.trim();
  const pass = document.getElementById("password").value.trim();

  if(usuario === "" || pass === ""){
    alert("Por favor completa todos los campos");
    return;
  }

  // Conexión con el backend de CodeIgniter 4
  const formData = new FormData();
  formData.append('usuario', usuario);
  formData.append('password', pass);

  // Mostrar indicador de carga
  const submitBtn = document.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Iniciando sesión...';
  submitBtn.disabled = true;

  fetch('http://localhost/CEJO/CEJO-BackEnd/public/login', {
    method: 'POST',
    body: formData,
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Error en la respuesta del servidor');
    }
    
    // Intentar parsear como JSON primero
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    } else {
      return response.text();
    }
  })
  .then(data => {
    console.log('Respuesta del backend:', data);
    
    // Si la respuesta es JSON
    if (typeof data === 'object' && data !== null) {
      if (data.success) {
        alert(`Login exitoso ✅\nRol: ${data.rol}`);
        
        // Redirigir según el rol
        if (data.redirect_url) {
          window.location.href = data.redirect_url;
        }
      } else {
        alert(data.message || 'Credenciales incorrectas ❌');
      }
    } else {
      // Si la respuesta es texto (fallback)
      if (data.includes('success') || data.includes('dashboard') || data.includes('bienvenido')) {
        alert('Login exitoso ✅');
      } else {
        alert('Credenciales incorrectas ❌');
      }
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Error de conexión con el servidor ❌\nVerifica que XAMPP esté ejecutándose');
  })
  .finally(() => {
    // Restaurar botón
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  });
});

// Validación simple para cambio de contraseña
document.addEventListener("DOMContentLoaded", () => {
  console.log("Sistema de Seguridad cargado.");
});