// JavaScript para pedido-repuestos.html - Sistema de solicitud y gestión de repuestos

// Variables globales
let tablaPedidos;
let pedidosData = [
    {
        id: 1,
        ordenTrabajo: 'OT-2024-001',
        tecnico: 'Juan Pérez',
        repuesto: 'Pantalla LCD 15.6"',
        cantidad: 1,
        prioridad: 'Alta',
        estado: 'Pendiente',
        fechaSolicitud: '2024-01-15',
    },
    {
        id: 2,
        ordenTrabajo: 'OT-2024-002',
        tecnico: 'María García',
        repuesto: 'Memoria RAM DDR4 8GB',
        cantidad: 2,
        prioridad: 'Media',
        estado: 'En proceso',
        fechaSolicitud: '2024-01-14',
    },
    {
        id: 3,
        ordenTrabajo: 'OT-2024-003',
        tecnico: 'Carlos López',
        repuesto: 'Disco SSD 500GB',
        cantidad: 1,
        prioridad: 'Baja',
        estado: 'Completado',
        fechaSolicitud: '2024-01-13',
    }
];

// Inicialización cuando el documento esté listo
$(document).ready(function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    initializeDataTable();
    cargarPedidos();
    setupTabSwitching();
}

// Configurar event listeners
function setupEventListeners() {
    // Formulario de solicitud de técnicos
    $('#formSolicitudTecnico').on('submit', handleSolicitudTecnico);
    
    // Filtros de recepción
    $('#filtroEstado').on('change', filtrarPedidos);
    $('#filtroPrioridad').on('change', filtrarPedidos);
    $('#filtroTecnico').on('change', filtrarPedidos);
    
    // Botón limpiar filtros
    $('#btnLimpiarFiltros').on('click', limpiarFiltros);
    
    // Modal de gestión de pedidos
    $('#btnGuardarPedido').on('click', guardarCambiosPedido);
}

// Configurar cambio de pestañas
function setupTabSwitching() {
    $('.nav-tabs a').on('click', function(e) {
        e.preventDefault();
        $(this).tab('show');
        
        // Actualizar tabla cuando se cambie a la pestaña de recepción
        if ($(this).attr('href') === '#recepcion-tab') {
            if (tablaPedidos) {
                tablaPedidos.ajax.reload();
            }
        }
    });
}

// Inicializar DataTable
function initializeDataTable() {
    tablaPedidos = $('#tablaPedidos').DataTable({
        language: {
            url: 'https://cdn.datatables.net/plug-ins/1.11.5/i18n/es-ES.json'
        },
        responsive: true,
        pageLength: 10,
        order: [[0, 'desc']],
        columnDefs: [
            {
                targets: [5], // Columna de prioridad
                render: function(data, type, row) {
                    const badgeClass = {
                        'Alta': 'badge-danger',
                        'Media': 'badge-warning',
                        'Baja': 'badge-success'
                    };
                    return `<span class="badge ${badgeClass[data] || 'badge-secondary'}">${data}</span>`;
                }
            },
            {
                targets: [6], // Columna de estado
                render: function(data, type, row) {
                    const badgeClass = {
                        'Pendiente': 'badge-warning',
                        'En proceso': 'badge-info',
                        'Completado': 'badge-success'
                    };
                    return `<span class="badge ${badgeClass[data] || 'badge-secondary'}">${data}</span>`;
                }
            },
            {
                targets: [9], // Columna de acciones
                orderable: false,
                render: function(data, type, row) {
                    return generateActionButtons(row.id, row.estado);
                }
            }
        ]
    });
}

// Cargar pedidos en la tabla
function cargarPedidos() {
    if (!tablaPedidos) return;
    
    tablaPedidos.clear();
    
    pedidosData.forEach(pedido => {
        const row = [
            pedido.id,
            pedido.ordenTrabajo,
            pedido.tecnico,
            pedido.repuesto,
            pedido.cantidad,
            pedido.prioridad,
            pedido.estado,
            formatDate(pedido.fechaSolicitud),
            truncateText(pedido.observaciones, 30),
            generateActionButtons(pedido.id, pedido.estado)
        ];
        tablaPedidos.row.add(row);
    });
    
    tablaPedidos.draw();
}

// Generar botones de acción
function generateActionButtons(id, estado) {
    let buttons = `
        <button class="btn btn-sm btn-info" onclick="verPedido(${id})" title="Ver detalles">
            <i class="fas fa-eye"></i>
        </button>
        <button class="btn btn-sm btn-primary" onclick="gestionarPedido(${id})" title="Gestionar">
            <i class="fas fa-edit"></i>
        </button>
    `;
    
    if (estado !== 'Completado') {
        buttons += `
            <button class="btn btn-sm btn-success" onclick="marcarCompletado(${id})" title="Marcar como completado">
                <i class="fas fa-check"></i>
            </button>
        `;
    }
    
    return buttons;
}

// Manejar solicitud de técnico
function handleSolicitudTecnico(e) {
    e.preventDefault();
    
    const formData = {
        ordenTrabajo: $('#ordenTrabajo').val(),
        tecnico: $('#tecnicoSolicitante').val(),
        repuesto: $('#repuestoRequerido').val(),
        cantidad: parseInt($('#cantidadRequerida').val()),
        prioridad: $('#prioridadSolicitud').val(),
        observaciones: $('#observacionesSolicitud').val()
    };
    
    // Validar campos requeridos
    if (!formData.ordenTrabajo || !formData.tecnico || !formData.repuesto || !formData.cantidad) {
        mostrarAlerta('Por favor complete todos los campos obligatorios', 'warning');
        return;
    }
    
    // Crear nueva solicitud
    const nuevaSolicitud = {
        id: pedidosData.length + 1,
        ...formData,
        estado: 'Pendiente',
        fechaSolicitud: new Date().toISOString().split('T')[0],
        proveedor: 'Por asignar'
    };
    
    // Agregar a los datos
    pedidosData.push(nuevaSolicitud);
    
    // Limpiar formulario
    $('#formSolicitudTecnico')[0].reset();
    
    // Mostrar mensaje de éxito
    mostrarAlerta('Solicitud enviada exitosamente', 'success');
    
    // Actualizar tabla si está visible
    if (tablaPedidos) {
        cargarPedidos();
    }
}

// Ver detalles del pedido
function verPedido(id) {
    const pedido = pedidosData.find(p => p.id === id);
    if (!pedido) return;
    
    const detalles = `
        <div class="row">
            <div class="col-md-6">
                <p><strong>Orden de Trabajo:</strong> ${pedido.ordenTrabajo}</p>
                <p><strong>Técnico:</strong> ${pedido.tecnico}</p>
                <p><strong>Repuesto:</strong> ${pedido.repuesto}</p>
                <p><strong>Cantidad:</strong> ${pedido.cantidad}</p>
            </div>
            <div class="col-md-6">
                <p><strong>Prioridad:</strong> <span class="badge badge-${getPriorityClass(pedido.prioridad)}">${pedido.prioridad}</span></p>
                <p><strong>Estado:</strong> <span class="badge badge-${getStatusClass(pedido.estado)}">${pedido.estado}</span></p>
                <p><strong>Fecha:</strong> ${formatDate(pedido.fechaSolicitud)}</p>
                <p><strong>Proveedor:</strong> ${pedido.proveedor}</p>
            </div>
        </div>
        <div class="row">
            <div class="col-12">
                <p><strong>Observaciones:</strong></p>
                <p>${pedido.observaciones || 'Sin observaciones'}</p>
            </div>
        </div>
    `;
    
    $('#modalDetallesPedido .modal-body').html(detalles);
    $('#modalDetallesPedido').modal('show');
}

// Gestionar pedido
function gestionarPedido(id) {
    const pedido = pedidosData.find(p => p.id === id);
    if (!pedido) return;
    
    // Llenar el modal con los datos del pedido
    $('#pedidoId').val(pedido.id);
    $('#estadoPedido').val(pedido.estado);
    $('#proveedorAsignado').val(pedido.proveedor);
    $('#observacionesGestion').val(pedido.observaciones);
    
    $('#modalGestionPedido').modal('show');
}

// Guardar cambios del pedido
function guardarCambiosPedido() {
    const id = parseInt($('#pedidoId').val());
    const pedido = pedidosData.find(p => p.id === id);
    
    if (!pedido) return;
    
    // Actualizar datos
    pedido.estado = $('#estadoPedido').val();
    pedido.proveedor = $('#proveedorAsignado').val();
    pedido.observaciones = $('#observacionesGestion').val();
    
    // Cerrar modal
    $('#modalGestionPedido').modal('hide');
    
    // Actualizar tabla
    cargarPedidos();
    
    mostrarAlerta('Pedido actualizado exitosamente', 'success');
}

// Marcar pedido como completado
function marcarCompletado(id) {
    if (confirm('¿Está seguro de marcar este pedido como completado?')) {
        const pedido = pedidosData.find(p => p.id === id);
        if (pedido) {
            pedido.estado = 'Completado';
            cargarPedidos();
            mostrarAlerta('Pedido marcado como completado', 'success');
        }
    }
}

// Filtrar pedidos
function filtrarPedidos() {
    const estadoFiltro = $('#filtroEstado').val();
    const prioridadFiltro = $('#filtroPrioridad').val();
    const tecnicoFiltro = $('#filtroTecnico').val();
    
    let datosFiltrados = pedidosData;
    
    if (estadoFiltro) {
        datosFiltrados = datosFiltrados.filter(p => p.estado === estadoFiltro);
    }
    
    if (prioridadFiltro) {
        datosFiltrados = datosFiltrados.filter(p => p.prioridad === prioridadFiltro);
    }
    
    if (tecnicoFiltro) {
        datosFiltrados = datosFiltrados.filter(p => p.tecnico.toLowerCase().includes(tecnicoFiltro.toLowerCase()));
    }
    
    // Actualizar tabla con datos filtrados
    tablaPedidos.clear();
    datosFiltrados.forEach(pedido => {
        const row = [
            pedido.id,
            pedido.ordenTrabajo,
            pedido.tecnico,
            pedido.repuesto,
            pedido.cantidad,
            pedido.prioridad,
            pedido.estado,
            formatDate(pedido.fechaSolicitud),
            truncateText(pedido.observaciones, 30),
            generateActionButtons(pedido.id, pedido.estado)
        ];
        tablaPedidos.row.add(row);
    });
    tablaPedidos.draw();
}

// Limpiar filtros
function limpiarFiltros() {
    $('#filtroEstado').val('');
    $('#filtroPrioridad').val('');
    $('#filtroTecnico').val('');
    cargarPedidos();
}

// Funciones auxiliares
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
}

function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

function getPriorityClass(prioridad) {
    const classes = {
        'Alta': 'danger',
        'Media': 'warning',
        'Baja': 'success'
    };
    return classes[prioridad] || 'secondary';
}

function getStatusClass(estado) {
    const classes = {
        'Pendiente': 'warning',
        'En proceso': 'info',
        'Completado': 'success'
    };
    return classes[estado] || 'secondary';
}

function mostrarAlerta(mensaje, tipo) {
    const alertClass = {
        'success': 'alert-success',
        'warning': 'alert-warning',
        'danger': 'alert-danger',
        'info': 'alert-info'
    };
    
    const alerta = `
        <div class="alert ${alertClass[tipo]} alert-dismissible fade show" role="alert">
            ${mensaje}
            <button type="button" class="close" data-dismiss="alert">
                <span>&times;</span>
            </button>
        </div>
    `;
    
    $('#alertContainer').html(alerta);
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        $('.alert').fadeOut();
    }, 5000);
}