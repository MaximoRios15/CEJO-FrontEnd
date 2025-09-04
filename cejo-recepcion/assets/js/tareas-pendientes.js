// JavaScript específico para tareas-pendientes.html

// Datos de ejemplo
let tareas = [
    {
        orden: 'ORD-2025-001',
        cliente: 'Juan Pérez',
        telefono: '+57 300 123 4567',
        equipo: 'Laptop HP Pavilion',
        problema: 'Pantalla dañada',
        estado: 'listo',
        prioridad: 'urgente',
        fechaFinalizacion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
        orden: 'ORD-2025-002',
        cliente: 'María García',
        telefono: '+57 301 987 6543',
        equipo: 'iPhone 12',
        problema: 'Batería agotada',
        estado: 'listo',
        prioridad: 'alta',
        fechaFinalizacion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
];

// Función para contactar cliente
function contactarCliente(orden) {
    const tarea = tareas.find(t => t.orden === orden);
    if (tarea) {
        document.getElementById('ordenContacto').value = tarea.orden;
        document.getElementById('clienteContacto').value = tarea.cliente;
        document.getElementById('telefonoContacto').value = tarea.telefono;
        
        const modal = new bootstrap.Modal(document.getElementById('modalContactarCliente'));
        modal.show();
    }
}

// Mostrar/ocultar fecha de recogida según resultado
document.getElementById('resultadoContacto').addEventListener('change', function() {
    const fechaGroup = document.getElementById('fechaRecogidaGroup');
    if (this.value === 'contactado') {
        fechaGroup.style.display = 'block';
    } else {
        fechaGroup.style.display = 'none';
    }
});

// Guardar contacto
function guardarContacto() {
    const orden = document.getElementById('ordenContacto').value;
    const resultado = document.getElementById('resultadoContacto').value;
    const observaciones = document.getElementById('observacionesContacto').value;
    
    if (!resultado) {
        alert('Por favor seleccione el resultado del contacto');
        return;
    }
    
    // Aquí iría la lógica para guardar en el servidor
    mostrarNotificacion(`Contacto registrado para ${orden}`);
    
    // Cerrar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalContactarCliente'));
    modal.hide();
    
    // Limpiar formulario
    document.getElementById('formContactarCliente').reset();
    document.getElementById('fechaRecogidaGroup').style.display = 'none';
}

// Ver detalles de la orden
function verDetalles(orden) {
    // Funcionalidad de órdenes de trabajo removida
    console.log(`Orden ${orden} - funcionalidad removida`);
}

// Marcar como entregado
function marcarEntregado(orden) {
    if (confirm(`¿Confirma que el equipo ${orden} ha sido entregado al cliente?`)) {
        // Aquí iría la lógica para actualizar el estado
        mostrarNotificacion(`Equipo ${orden} marcado como entregado`);
        
        // Actualizar la interfaz
        setTimeout(() => {
            location.reload();
        }, 1500);
    }
}

// Generar factura
function generarFactura(orden) {
    mostrarNotificacion(`Generando factura para ${orden}...`);
    // Aquí iría la lógica para generar la factura
}

// Mostrar notificación
function mostrarNotificacion(mensaje) {
    document.getElementById('toastMessage').textContent = mensaje;
    const toast = new bootstrap.Toast(document.getElementById('toastNotification'));
    toast.show();
}

// Aplicar filtros
function aplicarFiltros() {
    const estado = document.getElementById('filtroEstado').value;
    const prioridad = document.getElementById('filtroPrioridad').value;
    const fecha = document.getElementById('filtroFecha').value;
    const cliente = document.getElementById('buscarCliente').value.toLowerCase();
    
    // Aquí iría la lógica para filtrar las tareas
    mostrarNotificacion('Filtros aplicados');
}

// Limpiar filtros
function limpiarFiltros() {
    document.getElementById('filtroEstado').value = '';
    document.getElementById('filtroPrioridad').value = '';
    document.getElementById('filtroFecha').value = '';
    document.getElementById('buscarCliente').value = '';
    
    mostrarNotificacion('Filtros limpiados');
}

// Actualizar contadores automáticamente
function actualizarContadores() {
    // Simular actualización de datos
    const equiposListos = Math.floor(Math.random() * 10) + 1;
    const clientesPendientes = Math.floor(Math.random() * 5) + 1;
    const contactosHoy = Math.floor(Math.random() * 15) + 5;
    const tareasPendientes = Math.floor(Math.random() * 3) + 1;
    
    document.getElementById('equiposListos').textContent = equiposListos;
    document.getElementById('clientesPendientes').textContent = clientesPendientes;
    document.getElementById('contactosHoy').textContent = contactosHoy;
    document.getElementById('tareasPendientes').textContent = tareasPendientes;
    
    // Actualizar badge de notificaciones
}

// Actualizar cada 30 segundos
setInterval(actualizarContadores, 30000);

// Inicializar página
document.addEventListener('DOMContentLoaded', function() {
    // Mostrar notificación de bienvenida
    setTimeout(() => {
        mostrarNotificacion('Sistema de tareas pendientes cargado correctamente');
    }, 1000);
});