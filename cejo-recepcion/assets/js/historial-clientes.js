// TechRepair Historial de Clientes - JavaScript Functions

let tablaClientes;
let clientesData = [];

$(document).ready(function() {
    // Initialize the application
    initializeApp();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize DataTable
    initializeDataTable();
    
    // Load initial data
    cargarClientes();
});

function initializeApp() {
    console.log('Historial de Clientes initialized');
    
    // Setup form validation
    setupFormValidation();
}

function setupEventListeners() {
    // Buscar clientes
    $('#buscarClientes').on('click', function() {
        buscarClientes();
    });
    
    // Limpiar filtros
    $('#limpiarFiltros').on('click', function() {
        limpiarFiltros();
    });
    
    // Exportar a Excel
    $('#exportarExcel').on('click', function() {
        exportarExcel();
    });
    
    // Editar cliente
    $('#editarCliente').on('click', function() {
        const clienteId = $('#detalleDocumento').text();
        mostrarModalEditar(clienteId);
    });
    
    // Form submit para editar cliente
    $('#formEditarCliente').on('submit', function(e) {
        e.preventDefault();
        guardarCambiosCliente();
    });
    
    // Filtros en tiempo real
    $('#filtroDocumento, #filtroNombre, #filtroTelefono, #filtroEmail').on('keyup', function() {
        if (tablaClientes) {
            tablaClientes.draw();
        }
    });
}

function setupFormValidation() {
    // Add custom validation styles
    $('form').addClass('needs-validation');
    
    // Real-time validation
    $('input[required], textarea[required], select[required]').on('blur', function() {
        validateField(this);
    });
}

function validateField(field) {
    const $field = $(field);
    const value = $field.val().trim();
    
    if (value === '') {
        $field.addClass('is-invalid').removeClass('is-valid');
        return false;
    } else {
        $field.addClass('is-valid').removeClass('is-invalid');
        return true;
    }
}

function initializeDataTable() {
    tablaClientes = $('#tablaClientes').DataTable({
        language: {
            url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
        },
        responsive: true,
        pageLength: 25,
        order: [[5, 'desc']], // Ordenar por fecha de registro descendente
        columnDefs: [
            {
                targets: [7], // Columna de acciones
                orderable: false,
                searchable: false
            }
        ],
        drawCallback: function() {
            // Actualizar contador
            const info = this.api().page.info();
            $('#totalClientes').text(`${info.recordsDisplay} clientes`);
        }
    });
    
    // Custom search function
    $.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
        if (settings.nTable.id !== 'tablaClientes') {
            return true;
        }
        
        const filtroDocumento = $('#filtroDocumento').val().toLowerCase();
        const filtroNombre = $('#filtroNombre').val().toLowerCase();
        const filtroTelefono = $('#filtroTelefono').val().toLowerCase();
        const filtroEmail = $('#filtroEmail').val().toLowerCase();
        
        const documento = data[1].toLowerCase();
        const nombre = data[2].toLowerCase();
        const telefono = data[3].toLowerCase();
        const email = data[4].toLowerCase();
        
        return (filtroDocumento === '' || documento.includes(filtroDocumento)) &&
               (filtroNombre === '' || nombre.includes(filtroNombre)) &&
               (filtroTelefono === '' || telefono.includes(filtroTelefono)) &&
               (filtroEmail === '' || email.includes(filtroEmail));
    });
}

function cargarClientes() {
    // Show loading state
    showLoading(true);
    
    // Simulate API call - replace with actual API endpoint
    setTimeout(() => {
        // Mock data
        clientesData = [
            {
                id: 1,
                documento: 'RFC123456789',
                nombre: 'Juan Carlos Pérez García',
                telefono: '+52 555 123 4567',
                email: 'juan.perez@email.com',
                direccion: 'Calle Reforma #123, Col. Centro, CDMX',
                fechaRegistro: '2024-01-15',
                servicios: 3
            },
            {
                id: 2,
                documento: 'RFC987654321',
                nombre: 'María Elena Rodríguez López',
                telefono: '+52 555 987 6543',
                email: 'maria.rodriguez@email.com',
                direccion: 'Av. Insurgentes #456, Col. Roma Norte, CDMX',
                fechaRegistro: '2024-01-20',
                servicios: 1
            },
            {
                id: 3,
                documento: 'RFC456789123',
                nombre: 'Carlos Alberto Martínez Sánchez',
                telefono: '+52 555 456 7890',
                email: 'carlos.martinez@email.com',
                direccion: 'Calle Madero #789, Col. Centro Histórico, CDMX',
                fechaRegistro: '2024-02-01',
                servicios: 5
            },
            {
                id: 4,
                documento: 'RFC789123456',
                nombre: 'Ana Sofía González Hernández',
                telefono: '+52 555 789 0123',
                email: 'ana.gonzalez@email.com',
                direccion: 'Av. Chapultepec #321, Col. Juárez, CDMX',
                fechaRegistro: '2024-02-10',
                servicios: 2
            },
            {
                id: 5,
                documento: 'RFC321654987',
                nombre: 'Roberto Miguel Flores Castro',
                telefono: '+52 555 321 6549',
                email: 'roberto.flores@email.com',
                direccion: 'Calle Hidalgo #654, Col. Doctores, CDMX',
                fechaRegistro: '2024-02-15',
                servicios: 4
            }
        ];
        
        // Clear existing data
        tablaClientes.clear();
        
        // Add new data
        clientesData.forEach(cliente => {
            const row = [
                cliente.id,
                cliente.documento,
                cliente.nombre,
                cliente.telefono,
                cliente.email,
                formatDate(cliente.fechaRegistro),
                `<span class="badge badge-info">${cliente.servicios}</span>`,
                generateActionButtons(cliente.id)
            ];
            tablaClientes.row.add(row);
        });
        
        // Redraw table
        tablaClientes.draw();
        
        showLoading(false);
        showAlert('Clientes cargados exitosamente', 'success');
    }, 1000);
}

function generateActionButtons(clienteId) {
    return `
        <div class="btn-group" role="group">
            <button type="button" class="btn btn-sm btn-info" onclick="verDetalleCliente(${clienteId})" title="Ver detalles">
                <i class="fas fa-eye"></i>
            </button>
            <button type="button" class="btn btn-sm btn-warning" onclick="editarCliente(${clienteId})" title="Editar">
                <i class="fas fa-edit"></i>
            </button>
            <button type="button" class="btn btn-sm btn-success" onclick="nuevoServicio(${clienteId})" title="Nuevo servicio">
                <i class="fas fa-plus"></i>
            </button>
        </div>
    `;
}

function verDetalleCliente(clienteId) {
    const cliente = clientesData.find(c => c.id === clienteId);
    
    if (!cliente) {
        showAlert('Cliente no encontrado', 'error');
        return;
    }
    
    // Fill modal with client data
    $('#detalleDocumento').text(cliente.documento);
    $('#detalleNombre').text(cliente.nombre);
    $('#detalleTelefono').text(cliente.telefono);
    $('#detalleEmail').text(cliente.email);
    $('#detalleDireccion').text(cliente.direccion);
    $('#detalleFechaRegistro').text(formatDate(cliente.fechaRegistro));
    
    // Load service history
    cargarHistorialServicios(clienteId);
    
    // Show modal
    $('#modalDetalleCliente').modal('show');
}

function cargarHistorialServicios(clienteId) {
    // Mock service history data
    const servicios = [
        {
            orden: 'TR240115001',
            fecha: '2024-01-15',
            equipo: 'Laptop HP Pavilion',
            problema: 'No enciende',
            estado: 'Completado',
            tecnico: 'Juan Técnico'
        },
        {
            orden: 'TR240120002',
            fecha: '2024-01-20',
            equipo: 'iPhone 12',
            problema: 'Pantalla rota',
            estado: 'En proceso',
            tecnico: 'María Técnico'
        }
    ];
    
    let html = '';
    if (servicios.length === 0) {
        html = '<p class="text-muted">No hay servicios registrados</p>';
    } else {
        html = '<div class="timeline">';
        servicios.forEach(servicio => {
            const estadoClass = servicio.estado === 'Completado' ? 'success' : 
                               servicio.estado === 'En proceso' ? 'warning' : 'info';
            
            html += `
                <div class="timeline-item">
                    <span class="time"><i class="fas fa-clock"></i> ${formatDate(servicio.fecha)}</span>
                    <h3 class="timeline-header">
                        <strong>Orden: ${servicio.orden}</strong>
                        <span class="badge badge-${estadoClass} float-right">${servicio.estado}</span>
                    </h3>
                    <div class="timeline-body">
                        <p><strong>Equipo:</strong> ${servicio.equipo}</p>
                        <p><strong>Problema:</strong> ${servicio.problema}</p>
                        <p><strong>Técnico:</strong> ${servicio.tecnico}</p>
                    </div>
                </div>
            `;
        });
        html += '</div>';
    }
    
    $('#historialServicios').html(html);
}

function editarCliente(clienteId) {
    mostrarModalEditar(clienteId);
}

function mostrarModalEditar(clienteId) {
    const cliente = clientesData.find(c => c.id === clienteId || c.documento === clienteId);
    
    if (!cliente) {
        showAlert('Cliente no encontrado', 'error');
        return;
    }
    
    // Fill edit form
    $('#editClienteId').val(cliente.id);
    $('#editDocumento').val(cliente.documento);
    $('#editNombre').val(cliente.nombre);
    $('#editTelefono').val(cliente.telefono);
    $('#editEmail').val(cliente.email);
    $('#editDireccion').val(cliente.direccion);
    
    // Hide detail modal if open
    $('#modalDetalleCliente').modal('hide');
    
    // Show edit modal
    $('#modalEditarCliente').modal('show');
}

function guardarCambiosCliente() {
    // Validate form
    if (!validateForm('#formEditarCliente')) {
        showAlert('Por favor complete todos los campos requeridos', 'error');
        return;
    }
    
    const clienteId = parseInt($('#editClienteId').val());
    const clienteIndex = clientesData.findIndex(c => c.id === clienteId);
    
    if (clienteIndex === -1) {
        showAlert('Cliente no encontrado', 'error');
        return;
    }
    
    // Show loading state
    const $btn = $('#formEditarCliente button[type="submit"]');
    const originalText = $btn.html();
    $btn.html('<i class="fas fa-spinner fa-spin"></i> Guardando...').prop('disabled', true);
    
    // Simulate API call
    setTimeout(() => {
        // Update client data
        clientesData[clienteIndex] = {
            ...clientesData[clienteIndex],
            documento: $('#editDocumento').val(),
            nombre: $('#editNombre').val(),
            telefono: $('#editTelefono').val(),
            email: $('#editEmail').val(),
            direccion: $('#editDireccion').val()
        };
        
        // Update table row
        const cliente = clientesData[clienteIndex];
        const rowIndex = tablaClientes.rows().indexes().filter(function(index) {
            return tablaClientes.row(index).data()[0] == clienteId;
        })[0];
        
        if (rowIndex !== undefined) {
            tablaClientes.row(rowIndex).data([
                cliente.id,
                cliente.documento,
                cliente.nombre,
                cliente.telefono,
                cliente.email,
                formatDate(cliente.fechaRegistro),
                `<span class="badge badge-info">${cliente.servicios}</span>`,
                generateActionButtons(cliente.id)
            ]).draw();
        }
        
        // Hide modal
        $('#modalEditarCliente').modal('hide');
        
        // Show success message
        showAlert('Cliente actualizado exitosamente', 'success');
        
        // Restore button
        $btn.html(originalText).prop('disabled', false);
    }, 1500);
}

function nuevoServicio(clienteId) {
    // Redirect to reception page with client data
    const cliente = clientesData.find(c => c.id === clienteId);
    if (cliente) {
        // Store client data in sessionStorage
        sessionStorage.setItem('clienteSeleccionado', JSON.stringify(cliente));
        // Redirect to reception page
        window.location.href = 'recepcion.html';
    }
}

function buscarClientes() {
    if (tablaClientes) {
        tablaClientes.draw();
    }
    showAlert('Búsqueda aplicada', 'info');
}

function limpiarFiltros() {
    $('#filtroDocumento, #filtroNombre, #filtroTelefono, #filtroEmail').val('');
    if (tablaClientes) {
        tablaClientes.draw();
    }
    showAlert('Filtros limpiados', 'info');
}

function exportarExcel() {
    // Show loading state
    const $btn = $('#exportarExcel');
    const originalText = $btn.html();
    $btn.html('<i class="fas fa-spinner fa-spin"></i> Exportando...').prop('disabled', true);
    
    // Simulate export process
    setTimeout(() => {
        // In a real application, this would generate and download an Excel file
        showAlert('Archivo Excel generado exitosamente', 'success');
        
        // Restore button
        $btn.html(originalText).prop('disabled', false);
    }, 2000);
}

function validateForm(formSelector) {
    let isValid = true;
    
    $(`${formSelector} input[required], ${formSelector} textarea[required], ${formSelector} select[required]`).each(function() {
        if (!validateField(this)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

function showLoading(show) {
    if (show) {
        $('.content').addClass('loading');
    } else {
        $('.content').removeClass('loading');
    }
}

function showAlert(message, type) {
    const alertClass = {
        'success': 'alert-success',
        'error': 'alert-danger',
        'warning': 'alert-warning',
        'info': 'alert-info'
    }[type] || 'alert-info';
    
    const alertHtml = `
        <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    // Remove existing alerts
    $('.alert').remove();
    
    // Add new alert at the top of content
    $('.content-header').after(alertHtml);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        $('.alert').fadeOut();
    }, 5000);
}

function logout() {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
        // Clear any stored data
        sessionStorage.clear();
        localStorage.clear();
        
        // Redirect to login
        window.location.href = '../index.html';
    }
}