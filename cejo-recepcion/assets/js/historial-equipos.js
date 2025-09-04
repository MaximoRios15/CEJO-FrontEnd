// TechRepair Historial de Equipos - JavaScript Functions

let tablaEquipos;
let equiposData = [];

$(document).ready(function() {
    // Initialize the application
    initializeApp();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize DataTable with a small delay to ensure DOM is ready
    setTimeout(function() {
        initializeDataTable();
        // Load initial data after DataTable is initialized
        cargarEquipos();
    }, 100);
});

function initializeApp() {
    console.log('Historial de Equipos initialized');
    
    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    $('#filtroFechaHasta').val(today.toISOString().split('T')[0]);
    $('#filtroFechaDesde').val(thirtyDaysAgo.toISOString().split('T')[0]);
    
    // Setup form validation
    setupFormValidation();
}

function setupEventListeners() {
    // Buscar equipos
    $('#buscarEquipos').on('click', function() {
        buscarEquipos();
    });
    
    // Limpiar filtros
    $('#limpiarFiltros').on('click', function() {
        limpiarFiltros();
    });
    
    // Exportar a Excel
    $('#exportarExcel').on('click', function() {
        exportarExcel();
    });
    
    // Cambiar estado
    $('#cambiarEstado').on('click', function() {
        const equipoId = $('#detalleOrden').text();
        mostrarModalCambiarEstado(equipoId);
    });
    

    
    // Form submit para cambiar estado
    $('#formCambiarEstado').on('submit', function(e) {
        e.preventDefault();
        guardarCambioEstado();
    });
    
    // Filtros en tiempo real
    $('#filtroOrden, #filtroCliente').on('keyup', function() {
        if (tablaEquipos) {
            tablaEquipos.draw();
        }
    });
    
    $('#filtroTipoEquipo, #filtroEstado, #filtroTecnico, #filtroGarantia').on('change', function() {
        if (tablaEquipos) {
            tablaEquipos.draw();
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
    tablaEquipos = $('#tablaEquipos').DataTable({
        language: {
            url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
        },
        responsive: true,
        pageLength: 25,
        order: [[8, 'desc']], // Ordenar por fecha de ingreso descendente
        columnDefs: [
            {
                targets: [9], // Columna de acciones
                orderable: false,
                searchable: false
            },
            {
                targets: [5], // Columna de estado
                render: function(data, type, row) {
                    return getEstadoBadge(data);
                }
            },
            {
                targets: [7], // Columna de garantía
                render: function(data, type, row) {
                    return getGarantiaBadge(data);
                }
            }
        ],
        drawCallback: function() {
            // Actualizar contador
            const info = this.api().page.info();
            $('#totalEquiposTabla').text(`${info.recordsDisplay} equipos`);
        }
    });
    
    // Custom search function
    $.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
        if (settings.nTable.id !== 'tablaEquipos') {
            return true;
        }
        
        const filtroOrden = $('#filtroOrden').val().toLowerCase();
        const filtroCliente = $('#filtroCliente').val().toLowerCase();
        const filtroTipoEquipo = $('#filtroTipoEquipo').val();
        const filtroEstado = $('#filtroEstado').val();
        const filtroTecnico = $('#filtroTecnico').val();
        const filtroGarantia = $('#filtroGarantia').val();
        const filtroFechaDesde = $('#filtroFechaDesde').val();
        const filtroFechaHasta = $('#filtroFechaHasta').val();
        
        const orden = data[0].toLowerCase();
        const cliente = data[1].toLowerCase();
        const tipo = data[2].toLowerCase();
        const estado = data[5].toLowerCase();
        const tecnico = data[6] ? data[6].toLowerCase() : '';
        const fechaIngreso = data[7];
        
        // Get equipment data for guarantee filter
        const equipoData = equiposData.find(e => e.orden === data[0]);
        const garantia = equipoData ? equipoData.garantia : '';
        
        // Filter by text fields
        if (filtroOrden !== '' && !orden.includes(filtroOrden)) return false;
        if (filtroCliente !== '' && !cliente.includes(filtroCliente)) return false;
        if (filtroTipoEquipo !== '' && !tipo.includes(filtroTipoEquipo)) return false;
        if (filtroEstado !== '' && !estado.includes(filtroEstado)) return false;
        if (filtroTecnico !== '' && !tecnico.includes(filtroTecnico.toLowerCase())) return false;
        if (filtroGarantia !== '' && garantia !== filtroGarantia) return false;
        
        // Filter by date range
        if (filtroFechaDesde !== '' || filtroFechaHasta !== '') {
            const fecha = new Date(fechaIngreso.split('/').reverse().join('-'));
            const fechaDesde = filtroFechaDesde ? new Date(filtroFechaDesde) : null;
            const fechaHasta = filtroFechaHasta ? new Date(filtroFechaHasta) : null;
            
            if (fechaDesde && fecha < fechaDesde) return false;
            if (fechaHasta && fecha > fechaHasta) return false;
        }
        
        return true;
    });
}

function cargarEquipos() {
    // Check if DataTable is initialized
    if (!tablaEquipos) {
        console.error('DataTable not initialized yet');
        return;
    }
    
    // Show loading state
    showLoading(true);
    
    // Simulate API call - replace with actual API endpoint
    setTimeout(() => {
        // Mock data
        equiposData = [
            {
                id: 1,
                orden: 'TR240115001',
                cliente: 'Juan Carlos Pérez García',
                clienteDocumento: 'RFC123456789',
                clienteTelefono: '+52 555 123 4567',
                clienteEmail: 'juan.perez@email.com',
                tipo: 'laptop',
                marca: 'HP',
                modelo: 'Pavilion 15',
                problema: 'No enciende, posible problema con la fuente de poder',
                estado: 'reparacion',
                tecnico: 'juan_perez',
                garantia: 'vigente',
                fechaIngreso: '2024-01-15',
                fotos: ['foto1.jpg', 'foto2.jpg']
            },
            {
                id: 2,
                orden: 'TR240120002',
                cliente: 'María Elena Rodríguez López',
                clienteDocumento: 'RFC987654321',
                clienteTelefono: '+52 555 987 6543',
                clienteEmail: 'maria.rodriguez@email.com',
                tipo: 'smartphone',
                marca: 'Apple',
                modelo: 'iPhone 12',
                problema: 'Pantalla rota, táctil no responde',
                estado: 'diagnostico',
                tecnico: 'maria_garcia',
                garantia: 'vencida',
                fechaIngreso: '2024-01-20',
                fotos: ['foto3.jpg']
            },
            {
                id: 3,
                orden: 'TR240201003',
                cliente: 'Carlos Alberto Martínez Sánchez',
                clienteDocumento: 'RFC456789123',
                clienteTelefono: '+52 555 456 7890',
                clienteEmail: 'carlos.martinez@email.com',
                tipo: 'desktop',
                marca: 'Dell',
                modelo: 'OptiPlex 7090',
                problema: 'Lentitud extrema, posible virus',
                estado: 'completado',
                tecnico: 'carlos_rodriguez',
                garantia: 'vigente',
                fechaIngreso: '2024-02-01',
                fotos: []
            },
            {
                id: 4,
                orden: 'TR240210004',
                cliente: 'Ana Sofía González Hernández',
                clienteDocumento: 'RFC789123456',
                clienteTelefono: '+52 555 789 0123',
                clienteEmail: 'ana.gonzalez@email.com',
                tipo: 'tablet',
                marca: 'Samsung',
                modelo: 'Galaxy Tab S8',
                problema: 'No carga la batería',
                estado: 'pruebas',
                tecnico: 'ana_martinez',
                garantia: 'sin_garantia',
                fechaIngreso: '2024-02-10',
                fotos: ['foto4.jpg', 'foto5.jpg', 'foto6.jpg']
            },
            {
                id: 5,
                orden: 'TR240215005',
                cliente: 'Roberto Miguel Flores Castro',
                clienteDocumento: 'RFC321654987',
                clienteTelefono: '+52 555 321 6549',
                clienteEmail: 'roberto.flores@email.com',
                tipo: 'impresora',
                marca: 'Canon',
                modelo: 'PIXMA G3110',
                problema: 'No imprime, error de tinta',
                estado: 'recibido',
                tecnico: '',
                garantia: 'vigente',
                fechaIngreso: '2024-02-15',
                fotos: ['foto7.jpg']
            }
        ];
        
        // Clear existing data
        tablaEquipos.clear();
        
        // Add new data
        equiposData.forEach(equipo => {
            const row = [
                equipo.orden,
                equipo.cliente,
                getTipoEquipoText(equipo.tipo),
                `${equipo.marca} ${equipo.modelo}`,
                truncateText(equipo.problema, 50),
                equipo.estado,
                equipo.tecnico || 'Sin asignar',
                equipo.garantia,
                formatDate(equipo.fechaIngreso),
                generateActionButtons(equipo.id)
            ];
            tablaEquipos.row.add(row);
        });
        
        // Redraw table
        tablaEquipos.draw();
        
        // Update statistics
        actualizarEstadisticas();
        
        showLoading(false);
        showAlert('Equipos cargados exitosamente', 'success');
    }, 1000);
}

function actualizarEstadisticas() {
    const total = equiposData.length;
    const enProceso = equiposData.filter(e => ['diagnostico', 'reparacion', 'pruebas'].includes(e.estado)).length;
    const completados = equiposData.filter(e => ['completado', 'entregado'].includes(e.estado)).length;
    const pendientes = equiposData.filter(e => e.estado === 'recibido').length;
    
    $('#totalEquipos').text(total);
    $('#equiposEnProceso').text(enProceso);
    $('#equiposCompletados').text(completados);
    $('#equiposPendientes').text(pendientes);
}

function generateActionButtons(equipoId) {
    return `
        <div class="btn-group" role="group">
            <button type="button" class="btn btn-sm btn-info" onclick="verDetalleEquipo(${equipoId})" title="Ver detalles">
                <i class="fas fa-eye"></i>
            </button>
            <button type="button" class="btn btn-sm btn-warning" onclick="cambiarEstadoEquipo(${equipoId})" title="Cambiar estado">
                <i class="fas fa-edit"></i>
            </button>

        </div>
    `;
}

function verDetalleEquipo(equipoId) {
    const equipo = equiposData.find(e => e.id === equipoId);
    
    if (!equipo) {
        showAlert('Equipo no encontrado', 'error');
        return;
    }
    
    // Fill modal with equipment data
    $('#detalleOrden').text(equipo.orden);
    $('#detalleTipo').text(getTipoEquipoText(equipo.tipo));
    $('#detalleMarca').text(equipo.marca);
    $('#detalleModelo').text(equipo.modelo);
    $('#detalleProblema').text(equipo.problema);
    $('#detalleEstado').html(getEstadoBadge(equipo.estado));
    $('#detalleTecnico').text(equipo.tecnico || 'Sin asignar');
    $('#detalleFechaIngreso').text(formatDate(equipo.fechaIngreso));
    
    // Fill client data
    $('#detalleClienteNombre').text(equipo.cliente);
    $('#detalleClienteDocumento').text(equipo.clienteDocumento);
    $('#detalleClienteTelefono').text(equipo.clienteTelefono);
    $('#detalleClienteEmail').text(equipo.clienteEmail);
    
    // Load photos
    cargarFotosEquipo(equipo.fotos);
    
    // Load status history
    cargarHistorialEstados(equipoId);
    
    // Show modal
    $('#modalDetalleEquipo').modal('show');
}

function cargarFotosEquipo(fotos) {
    const $container = $('#fotosEquipo');
    $container.empty();
    
    if (fotos.length === 0) {
        $container.html('<p class="text-muted">No hay fotos disponibles</p>');
        return;
    }
    
    fotos.forEach((foto, index) => {
        const html = `
            <div class="col-md-4 col-sm-6 mb-2">
                <img src="assets/img/equipos/${foto}" class="img-fluid img-thumbnail" 
                     alt="Foto ${index + 1}" style="height: 150px; object-fit: cover; cursor: pointer;"
                     onclick="mostrarFotoCompleta('assets/img/equipos/${foto}')">
            </div>
        `;
        $container.append(html);
    });
}

function cargarHistorialEstados(equipoId) {
    // Mock status history data
    const historial = [
        {
            fecha: '2024-01-15 09:00',
            estado: 'recibido',
            tecnico: 'Recepcionista',
            observaciones: 'Equipo recibido en recepción'
        },
        {
            fecha: '2024-01-15 14:30',
            estado: 'diagnostico',
            tecnico: 'Juan Técnico',
            observaciones: 'Iniciando diagnóstico del problema'
        },
        {
            fecha: '2024-01-16 10:15',
            estado: 'reparacion',
            tecnico: 'Juan Técnico',
            observaciones: 'Problema identificado: fuente de poder dañada. Iniciando reparación'
        }
    ];
    
    let html = '<div class="timeline">';
    historial.forEach(item => {
        const estadoClass = getEstadoClass(item.estado);
        html += `
            <div class="timeline-item">
                <span class="time"><i class="fas fa-clock"></i> ${item.fecha}</span>
                <h3 class="timeline-header">
                    <span class="badge badge-${estadoClass}">${getEstadoText(item.estado)}</span>
                    <span class="float-right text-muted">${item.tecnico}</span>
                </h3>
                <div class="timeline-body">
                    ${item.observaciones}
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    $('#historialEstados').html(html);
}

function cambiarEstadoEquipo(equipoId) {
    mostrarModalCambiarEstado(equipoId);
}

function mostrarModalCambiarEstado(equipoId) {
    const equipo = equiposData.find(e => e.id === equipoId || e.orden === equipoId);
    
    if (!equipo) {
        showAlert('Equipo no encontrado', 'error');
        return;
    }
    
    // Fill form
    $('#equipoId').val(equipo.id);
    $('#nuevoEstado').val(equipo.estado);
    $('#tecnicoAsignado').val(equipo.tecnico);
    $('#observaciones').val('');
    
    // Hide detail modal if open
    $('#modalDetalleEquipo').modal('hide');
    
    // Show change status modal
    $('#modalCambiarEstado').modal('show');
}

function guardarCambioEstado() {
    // Validate form
    if (!validateForm('#formCambiarEstado')) {
        showAlert('Por favor complete todos los campos requeridos', 'error');
        return;
    }
    
    const equipoId = parseInt($('#equipoId').val());
    const equipoIndex = equiposData.findIndex(e => e.id === equipoId);
    
    if (equipoIndex === -1) {
        showAlert('Equipo no encontrado', 'error');
        return;
    }
    
    // Show loading state
    const $btn = $('#formCambiarEstado button[type="submit"]');
    const originalText = $btn.html();
    $btn.html('<i class="fas fa-spinner fa-spin"></i> Guardando...').prop('disabled', true);
    
    // Simulate API call
    setTimeout(() => {
        // Update equipment data
        equiposData[equipoIndex] = {
            ...equiposData[equipoIndex],
            estado: $('#nuevoEstado').val(),
            tecnico: $('#tecnicoAsignado').val()
        };
        
        // Update table row
        const equipo = equiposData[equipoIndex];
        const rowIndex = tablaEquipos.rows().indexes().filter(function(index) {
            return tablaEquipos.row(index).data()[0] === equipo.orden;
        })[0];
        
        if (rowIndex !== undefined) {
            tablaEquipos.row(rowIndex).data([
                equipo.orden,
                equipo.cliente,
                getTipoEquipoText(equipo.tipo),
                `${equipo.marca} ${equipo.modelo}`,
                truncateText(equipo.problema, 50),
                equipo.estado,
                equipo.tecnico || 'Sin asignar',
                formatDate(equipo.fechaIngreso),
                generateActionButtons(equipo.id)
            ]).draw();
        }
        
        // Update statistics
        actualizarEstadisticas();
        
        // Hide modal
        $('#modalCambiarEstado').modal('hide');
        
        // Show success message
        showAlert('Estado del equipo actualizado exitosamente', 'success');
        
        // Restore button
        $btn.html(originalText).prop('disabled', false);
    }, 1500);
}



function buscarEquipos() {
    if (tablaEquipos) {
        tablaEquipos.draw();
    }
    showAlert('Búsqueda aplicada', 'info');
}

function limpiarFiltros() {
    $('#filtroOrden, #filtroCliente').val('');
    $('#filtroTipoEquipo, #filtroEstado, #filtroTecnico, #filtroGarantia').val('');
    $('#filtroFechaDesde, #filtroFechaHasta').val('');
    
    if (tablaEquipos) {
        tablaEquipos.draw();
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

// Utility functions
function getTipoEquipoText(tipo) {
    const tipos = {
        'laptop': 'Laptop',
        'desktop': 'PC Escritorio',
        'tablet': 'Tablet',
        'smartphone': 'Smartphone',
        'impresora': 'Impresora',
        'otro': 'Otro'
    };
    return tipos[tipo] || tipo;
}

function getEstadoText(estado) {
    const estados = {
        'recibido': 'Recibido',
        'diagnostico': 'En Diagnóstico',
        'reparacion': 'En Reparación',
        'pruebas': 'En Pruebas',
        'completado': 'Completado',
        'entregado': 'Entregado',
        'cancelado': 'Cancelado'
    };
    return estados[estado] || estado;
}

function getEstadoClass(estado) {
    const clases = {
        'recibido': 'secondary',
        'diagnostico': 'info',
        'reparacion': 'warning',
        'pruebas': 'primary',
        'completado': 'success',
        'entregado': 'success',
        'cancelado': 'danger'
    };
    return clases[estado] || 'secondary';
}

function getEstadoBadge(estado) {
    const clase = getEstadoClass(estado);
    const texto = getEstadoText(estado);
    return `<span class="badge badge-${clase}">${texto}</span>`;
}

function getGarantiaBadge(garantia) {
    let clase = '';
    let icono = '';
    
    switch(garantia) {
        case 'Vigente':
            clase = 'success';
            icono = '<i class="fas fa-shield-alt"></i> ';
            break;
        case 'Vencida':
            clase = 'danger';
            icono = '<i class="fas fa-shield-alt"></i> ';
            break;
        case 'Sin Garantía':
            clase = 'secondary';
            icono = '<i class="fas fa-times"></i> ';
            break;
        default:
            clase = 'secondary';
            icono = '<i class="fas fa-question"></i> ';
    }
    
    return `<span class="badge badge-${clase}">${icono}${garantia}</span>`;
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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

function mostrarFotoCompleta(src) {
    // Create modal to show full size photo
    const modal = `
        <div class="modal fade" id="modalFoto" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Foto del Equipo</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center">
                        <img src="${src}" class="img-fluid" alt="Foto completa">
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    $('#modalFoto').remove();
    
    // Add and show modal
    $('body').append(modal);
    $('#modalFoto').modal('show');
    
    // Remove modal when hidden
    $('#modalFoto').on('hidden.bs.modal', function() {
        $(this).remove();
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