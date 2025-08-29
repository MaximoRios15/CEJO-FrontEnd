// TechRepair Órdenes de Trabajo - JavaScript Functions

let tablaOrdenes;
let ordenesData = [];

$(document).ready(function() {
    // Initialize the application
    initializeApp();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize DataTable
    initializeDataTable();
    
    // Load initial data
    cargarOrdenes();
    
    // Check if there's a specific order to show
    checkForSpecificOrder();
});

function initializeApp() {
    console.log('Órdenes de Trabajo initialized');
    
    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    $('#filtroFechaHasta').val(today.toISOString().split('T')[0]);
    $('#filtroFechaDesde').val(thirtyDaysAgo.toISOString().split('T')[0]);
    
    // Setup form validation
    setupFormValidation();
}

function setupEventListeners() {
    // Buscar órdenes
    $('#buscarOrdenes').on('click', function() {
        buscarOrdenes();
    });
    
    // Limpiar filtros
    $('#limpiarFiltros').on('click', function() {
        limpiarFiltros();
    });
    
    // Exportar a Excel
    $('#exportarExcel').on('click', function() {
        exportarExcel();
    });
    
    // Nueva orden
    $('#nuevaOrden').on('click', function() {
        window.location.href = 'recepcion.html';
    });
    
    // Editar orden
    $('#editarOrden').on('click', function() {
        const ordenId = $('#editOrdenId').val();
        if (ordenId) {
            mostrarModalEditarOrden(parseInt(ordenId));
        }
    });
    
    // Imprimir orden
    $('#imprimirOrden').on('click', function() {
        const ordenId = $('#editOrdenId').val();
        if (ordenId) {
            imprimirOrden(parseInt(ordenId));
        }
    });
    
    // Form submit para editar orden
    $('#formEditarOrden').on('submit', function(e) {
        e.preventDefault();
        guardarCambiosOrden();
    });
    
    // Filtros en tiempo real
    $('#filtroOrden, #filtroCliente').on('keyup', function() {
        if (tablaOrdenes) {
            tablaOrdenes.draw();
        }
    });
    
    $('#filtroTecnico, #filtroEstado, #filtroPrioridad').on('change', function() {
        if (tablaOrdenes) {
            tablaOrdenes.draw();
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
    tablaOrdenes = $('#tablaOrdenes').DataTable({
        language: {
            url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
        },
        responsive: true,
        pageLength: 25,
        order: [[6, 'desc']], // Ordenar por fecha de creación descendente
        columnDefs: [
            {
                targets: [8], // Columna de acciones
                orderable: false,
                searchable: false
            },
            {
                targets: [4], // Columna de estado
                render: function(data, type, row) {
                    return getEstadoBadge(data);
                }
            },
            {
                targets: [5], // Columna de prioridad
                render: function(data, type, row) {
                    return getPrioridadBadge(data);
                }
            }
        ],
        drawCallback: function() {
            // Actualizar contador
            const info = this.api().page.info();
            $('#totalOrdenesTabla').text(`${info.recordsDisplay} órdenes`);
        }
    });
    
    // Custom search function
    $.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
        if (settings.nTable.id !== 'tablaOrdenes') {
            return true;
        }
        
        const filtroOrden = $('#filtroOrden').val().toLowerCase();
        const filtroCliente = $('#filtroCliente').val().toLowerCase();
        const filtroTecnico = $('#filtroTecnico').val();
        const filtroEstado = $('#filtroEstado').val();
        const filtroPrioridad = $('#filtroPrioridad').val();
        const filtroFechaDesde = $('#filtroFechaDesde').val();
        const filtroFechaHasta = $('#filtroFechaHasta').val();
        
        const orden = data[0].toLowerCase();
        const cliente = data[1].toLowerCase();
        const tecnico = data[3].toLowerCase();
        const estado = data[4].toLowerCase();
        const prioridad = data[5].toLowerCase();
        const fechaCreacion = data[6];
        
        // Filter by text fields
        if (filtroOrden !== '' && !orden.includes(filtroOrden)) return false;
        if (filtroCliente !== '' && !cliente.includes(filtroCliente)) return false;
        if (filtroTecnico !== '' && !tecnico.includes(filtroTecnico.toLowerCase())) return false;
        if (filtroEstado !== '' && !estado.includes(filtroEstado)) return false;
        if (filtroPrioridad !== '' && !prioridad.includes(filtroPrioridad)) return false;
        
        // Filter by date range
        if (filtroFechaDesde !== '' || filtroFechaHasta !== '') {
            const fecha = new Date(fechaCreacion.split('/').reverse().join('-'));
            const fechaDesde = filtroFechaDesde ? new Date(filtroFechaDesde) : null;
            const fechaHasta = filtroFechaHasta ? new Date(filtroFechaHasta) : null;
            
            if (fechaDesde && fecha < fechaDesde) return false;
            if (fechaHasta && fecha > fechaHasta) return false;
        }
        
        return true;
    });
}

function cargarOrdenes() {
    // Show loading state
    showLoading(true);
    
    // Simulate API call - replace with actual API endpoint
    setTimeout(() => {
        // Mock data
        ordenesData = [
            {
                id: 1,
                numero: 'TR240115001',
                cliente: {
                    nombre: 'Juan Carlos Pérez García',
                    documento: 'RFC123456789',
                    telefono: '+52 555 123 4567',
                    email: 'juan.perez@email.com'
                },
                equipo: {
                    tipo: 'laptop',
                    marca: 'HP',
                    modelo: 'Pavilion 15',
                    problema: 'No enciende, posible problema con la fuente de poder'
                },
                tecnico: 'Juan Técnico',
                estado: 'en_proceso',
                prioridad: 'alta',
                fechaCreacion: '2024-01-15',
                fechaEstimada: '2024-01-22',
                diagnostico: 'Fuente de poder interna dañada. Requiere reemplazo.',
                trabajosRealizados: 'Desmontaje del equipo, diagnóstico de componentes, identificación de fuente dañada.',
                observaciones: 'Cliente autoriza reparación. Pieza en pedido.'
            },
            {
                id: 2,
                numero: 'TR240120002',
                cliente: {
                    nombre: 'María Elena Rodríguez López',
                    documento: 'RFC987654321',
                    telefono: '+52 555 987 6543',
                    email: 'maria.rodriguez@email.com'
                },
                equipo: {
                    tipo: 'smartphone',
                    marca: 'Apple',
                    modelo: 'iPhone 12',
                    problema: 'Pantalla rota, táctil no responde'
                },
                tecnico: 'María Técnico',
                estado: 'completada',
                prioridad: 'media',
                fechaCreacion: '2024-01-20',
                fechaEstimada: '2024-01-25',
                diagnostico: 'Pantalla LCD y digitalizador dañados por impacto.',
                trabajosRealizados: 'Reemplazo completo de pantalla LCD y digitalizador. Pruebas de funcionalidad.',
                observaciones: 'Reparación completada exitosamente. Equipo funcionando correctamente.'
            },
            {
                id: 3,
                numero: 'TR240201003',
                cliente: {
                    nombre: 'Carlos Alberto Martínez Sánchez',
                    documento: 'RFC456789123',
                    telefono: '+52 555 456 7890',
                    email: 'carlos.martinez@email.com'
                },
                equipo: {
                    tipo: 'desktop',
                    marca: 'Dell',
                    modelo: 'OptiPlex 7090',
                    problema: 'Lentitud extrema, posible virus'
                },
                tecnico: 'Carlos Técnico',
                estado: 'entregada',
                prioridad: 'baja',
                fechaCreacion: '2024-02-01',
                fechaEstimada: '2024-02-05',
                diagnostico: 'Sistema infectado con malware. Disco duro con sectores defectuosos.',
                trabajosRealizados: 'Limpieza completa de malware, desfragmentación, optimización del sistema.',
                observaciones: 'Equipo entregado. Cliente satisfecho con el servicio.'
            },
            {
                id: 4,
                numero: 'TR240210004',
                cliente: {
                    nombre: 'Ana Sofía González Hernández',
                    documento: 'RFC789123456',
                    telefono: '+52 555 789 0123',
                    email: 'ana.gonzalez@email.com'
                },
                equipo: {
                    tipo: 'tablet',
                    marca: 'Samsung',
                    modelo: 'Galaxy Tab S8',
                    problema: 'No carga la batería'
                },
                tecnico: 'Ana Técnico',
                estado: 'en_proceso',
                prioridad: 'urgente',
                fechaCreacion: '2024-02-10',
                fechaEstimada: '2024-02-15',
                diagnostico: 'Puerto de carga dañado y batería con capacidad reducida.',
                trabajosRealizados: 'Reemplazo del puerto de carga. Batería en proceso de reemplazo.',
                observaciones: 'Esperando llegada de batería compatible.'
            },
            {
                id: 5,
                numero: 'TR240215005',
                cliente: {
                    nombre: 'Roberto Miguel Flores Castro',
                    documento: 'RFC321654987',
                    telefono: '+52 555 321 6549',
                    email: 'roberto.flores@email.com'
                },
                equipo: {
                    tipo: 'impresora',
                    marca: 'Canon',
                    modelo: 'PIXMA G3110',
                    problema: 'No imprime, error de tinta'
                },
                tecnico: '',
                estado: 'pendiente',
                prioridad: 'media',
                fechaCreacion: '2024-02-15',
                fechaEstimada: '2024-02-20',
                diagnostico: '',
                trabajosRealizados: '',
                observaciones: 'Orden recibida, pendiente de asignación de técnico.'
            },
            {
                id: 6,
                numero: 'TR240218006',
                cliente: {
                    nombre: 'Luis Fernando Herrera Vega',
                    documento: 'RFC654987321',
                    telefono: '+52 555 654 9873',
                    email: 'luis.herrera@email.com'
                },
                equipo: {
                    tipo: 'laptop',
                    marca: 'Lenovo',
                    modelo: 'ThinkPad E15',
                    problema: 'Teclado no funciona correctamente'
                },
                tecnico: 'Juan Técnico',
                estado: 'cancelada',
                prioridad: 'baja',
                fechaCreacion: '2024-02-18',
                fechaEstimada: '2024-02-25',
                diagnostico: 'Teclado requiere reemplazo completo.',
                trabajosRealizados: '',
                observaciones: 'Cliente decidió no proceder con la reparación por costo.'
            }
        ];
        
        // Clear existing data
        tablaOrdenes.clear();
        
        // Add new data
        ordenesData.forEach(orden => {
            const row = [
                orden.numero,
                orden.cliente.nombre,
                `${getTipoEquipoText(orden.equipo.tipo)} ${orden.equipo.marca} ${orden.equipo.modelo}`,
                orden.tecnico || 'Sin asignar',
                orden.estado,
                orden.prioridad,
                formatDate(orden.fechaCreacion),
                orden.fechaEstimada ? formatDate(orden.fechaEstimada) : 'Sin fecha',
                generateActionButtons(orden.id)
            ];
            tablaOrdenes.row.add(row);
        });
        
        // Redraw table
        tablaOrdenes.draw();
        
        // Update statistics
        actualizarEstadisticas();
        
        showLoading(false);
        showAlert('Órdenes cargadas exitosamente', 'success');
    }, 1000);
}

function actualizarEstadisticas() {
    const total = ordenesData.length;
    const activas = ordenesData.filter(o => ['pendiente', 'en_proceso'].includes(o.estado)).length;
    const completadas = ordenesData.filter(o => ['completada', 'entregada'].includes(o.estado)).length;
    const pendientes = ordenesData.filter(o => o.estado === 'pendiente').length;
    
    $('#totalOrdenes').text(total);
    $('#ordenesActivas').text(activas);
    $('#ordenesCompletadas').text(completadas);
    $('#ordenesPendientes').text(pendientes);
}

function generateActionButtons(ordenId) {
    return `
        <div class="btn-group" role="group">
            <button type="button" class="btn btn-sm btn-info" onclick="verDetalleOrden(${ordenId})" title="Ver detalles">
                <i class="fas fa-eye"></i>
            </button>
            <button type="button" class="btn btn-sm btn-warning" onclick="editarOrdenDirecto(${ordenId})" title="Editar orden">
                <i class="fas fa-edit"></i>
            </button>
            <button type="button" class="btn btn-sm btn-success" onclick="imprimirOrden(${ordenId})" title="Imprimir">
                <i class="fas fa-print"></i>
            </button>
        </div>
    `;
}

function verDetalleOrden(ordenId) {
    const orden = ordenesData.find(o => o.id === ordenId);
    
    if (!orden) {
        showAlert('Orden no encontrada', 'error');
        return;
    }
    
    // Fill modal with order data
    $('#editOrdenId').val(orden.id);
    $('#detalleNumeroOrden').text(orden.numero);
    $('#detalleEstadoOrden').html(getEstadoBadge(orden.estado));
    $('#detallePrioridadOrden').html(getPrioridadBadge(orden.prioridad));
    $('#detalleTecnicoOrden').text(orden.tecnico || 'Sin asignar');
    $('#detalleFechaCreacion').text(formatDate(orden.fechaCreacion));
    $('#detalleFechaEstimada').text(orden.fechaEstimada ? formatDate(orden.fechaEstimada) : 'Sin fecha estimada');
    
    // Fill client data
    $('#detalleClienteNombre').text(orden.cliente.nombre);
    $('#detalleClienteDocumento').text(orden.cliente.documento);
    $('#detalleClienteTelefono').text(orden.cliente.telefono);
    $('#detalleClienteEmail').text(orden.cliente.email);
    
    // Fill equipment data
    $('#detalleEquipoTipo').text(getTipoEquipoText(orden.equipo.tipo));
    $('#detalleEquipoMarca').text(orden.equipo.marca);
    $('#detalleEquipoModelo').text(orden.equipo.modelo);
    $('#detalleEquipoProblema').text(orden.equipo.problema);
    
    // Fill diagnosis and work data
    $('#detalleDiagnostico').text(orden.diagnostico || 'Sin diagnóstico');
    $('#detalleTrabajosRealizados').text(orden.trabajosRealizados || 'Sin trabajos registrados');
    $('#detalleObservaciones').text(orden.observaciones || 'Sin observaciones');
    
    // Load status history
    cargarHistorialEstadosOrden(ordenId);
    
    // Show modal
    $('#modalDetalleOrden').modal('show');
}

function cargarHistorialEstadosOrden(ordenId) {
    // Mock status history data
    const historial = [
        {
            fecha: '2024-01-15 09:00',
            estado: 'pendiente',
            tecnico: 'Recepcionista',
            observaciones: 'Orden de trabajo creada'
        },
        {
            fecha: '2024-01-15 14:30',
            estado: 'en_proceso',
            tecnico: 'Juan Técnico',
            observaciones: 'Técnico asignado, iniciando diagnóstico'
        },
        {
            fecha: '2024-01-16 10:15',
            estado: 'en_proceso',
            tecnico: 'Juan Técnico',
            observaciones: 'Diagnóstico completado: fuente de poder dañada'
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
    
    $('#historialEstadosOrden').html(html);
}

function editarOrdenDirecto(ordenId) {
    mostrarModalEditarOrden(ordenId);
}

function mostrarModalEditarOrden(ordenId) {
    const orden = ordenesData.find(o => o.id === ordenId);
    
    if (!orden) {
        showAlert('Orden no encontrada', 'error');
        return;
    }
    
    // Fill form
    $('#editOrdenId').val(orden.id);
    $('#editEstado').val(orden.estado);
    $('#editPrioridad').val(orden.prioridad);
    $('#editTecnico').val(orden.tecnico);
    $('#editFechaEstimada').val(orden.fechaEstimada || '');
    $('#editDiagnostico').val(orden.diagnostico || '');
    $('#editTrabajosRealizados').val(orden.trabajosRealizados || '');
    $('#editObservaciones').val(orden.observaciones || '');
    
    // Hide detail modal if open
    $('#modalDetalleOrden').modal('hide');
    
    // Show edit modal
    $('#modalEditarOrden').modal('show');
}

function guardarCambiosOrden() {
    // Validate form
    if (!validateForm('#formEditarOrden')) {
        showAlert('Por favor complete todos los campos requeridos', 'error');
        return;
    }
    
    const ordenId = parseInt($('#editOrdenId').val());
    const ordenIndex = ordenesData.findIndex(o => o.id === ordenId);
    
    if (ordenIndex === -1) {
        showAlert('Orden no encontrada', 'error');
        return;
    }
    
    // Show loading state
    const $btn = $('#formEditarOrden button[type="submit"]');
    const originalText = $btn.html();
    $btn.html('<i class="fas fa-spinner fa-spin"></i> Guardando...').prop('disabled', true);
    
    // Simulate API call
    setTimeout(() => {
        // Update order data
        ordenesData[ordenIndex] = {
            ...ordenesData[ordenIndex],
            estado: $('#editEstado').val(),
            prioridad: $('#editPrioridad').val(),
            tecnico: $('#editTecnico').val(),
            fechaEstimada: $('#editFechaEstimada').val(),
            diagnostico: $('#editDiagnostico').val(),
            trabajosRealizados: $('#editTrabajosRealizados').val(),
            observaciones: $('#editObservaciones').val()
        };
        
        // Update table row
        const orden = ordenesData[ordenIndex];
        const rowIndex = tablaOrdenes.rows().indexes().filter(function(index) {
            return tablaOrdenes.row(index).data()[0] === orden.numero;
        })[0];
        
        if (rowIndex !== undefined) {
            tablaOrdenes.row(rowIndex).data([
                orden.numero,
                orden.cliente.nombre,
                `${getTipoEquipoText(orden.equipo.tipo)} ${orden.equipo.marca} ${orden.equipo.modelo}`,
                orden.tecnico || 'Sin asignar',
                orden.estado,
                orden.prioridad,
                formatDate(orden.fechaCreacion),
                orden.fechaEstimada ? formatDate(orden.fechaEstimada) : 'Sin fecha',
                generateActionButtons(orden.id)
            ]).draw();
        }
        
        // Update statistics
        actualizarEstadisticas();
        
        // Hide modal
        $('#modalEditarOrden').modal('hide');
        
        // Show success message
        showAlert('Orden actualizada exitosamente', 'success');
        
        // Restore button
        $btn.html(originalText).prop('disabled', false);
    }, 1500);
}

function imprimirOrden(ordenId) {
    const orden = ordenesData.find(o => o.id === ordenId);
    
    if (!orden) {
        showAlert('Orden no encontrada', 'error');
        return;
    }
    
    // Generate print content
    const printContent = generarContenidoImpresion(orden);
    
    // Create print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
    
    showAlert('Orden enviada a impresión', 'success');
}

function generarContenidoImpresion(orden) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Orden de Trabajo - ${orden.numero}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
                .section { margin: 20px 0; }
                .section h3 { background: #f5f5f5; padding: 5px; margin: 0; }
                .info-table { width: 100%; border-collapse: collapse; }
                .info-table td { padding: 5px; border: 1px solid #ddd; }
                .info-table td:first-child { font-weight: bold; width: 30%; }
                .status { padding: 3px 8px; border-radius: 3px; color: white; }
                .status.pendiente { background: #6c757d; }
                .status.en_proceso { background: #ffc107; color: #000; }
                .status.completada { background: #28a745; }
                .status.entregada { background: #17a2b8; }
                .status.cancelada { background: #dc3545; }
                .priority { padding: 3px 8px; border-radius: 3px; color: white; }
                .priority.baja { background: #28a745; }
                .priority.media { background: #ffc107; color: #000; }
                .priority.alta { background: #fd7e14; }
                .priority.urgente { background: #dc3545; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>TechRepair - Orden de Trabajo</h1>
                <h2>${orden.numero}</h2>
            </div>
            
            <div class="section">
                <h3>Información General</h3>
                <table class="info-table">
                    <tr><td>Número de Orden:</td><td>${orden.numero}</td></tr>
                    <tr><td>Estado:</td><td><span class="status ${orden.estado}">${getEstadoText(orden.estado)}</span></td></tr>
                    <tr><td>Prioridad:</td><td><span class="priority ${orden.prioridad}">${getPrioridadText(orden.prioridad)}</span></td></tr>
                    <tr><td>Técnico Asignado:</td><td>${orden.tecnico || 'Sin asignar'}</td></tr>
                    <tr><td>Fecha de Creación:</td><td>${formatDate(orden.fechaCreacion)}</td></tr>
                    <tr><td>Fecha Estimada:</td><td>${orden.fechaEstimada ? formatDate(orden.fechaEstimada) : 'Sin fecha estimada'}</td></tr>
                </table>
            </div>
            
            <div class="section">
                <h3>Información del Cliente</h3>
                <table class="info-table">
                    <tr><td>Nombre:</td><td>${orden.cliente.nombre}</td></tr>
                    <tr><td>Documento:</td><td>${orden.cliente.documento}</td></tr>
                    <tr><td>Teléfono:</td><td>${orden.cliente.telefono}</td></tr>
                    <tr><td>Email:</td><td>${orden.cliente.email}</td></tr>
                </table>
            </div>
            
            <div class="section">
                <h3>Información del Equipo</h3>
                <table class="info-table">
                    <tr><td>Tipo:</td><td>${getTipoEquipoText(orden.equipo.tipo)}</td></tr>
                    <tr><td>Marca:</td><td>${orden.equipo.marca}</td></tr>
                    <tr><td>Modelo:</td><td>${orden.equipo.modelo}</td></tr>
                    <tr><td>Problema Reportado:</td><td>${orden.equipo.problema}</td></tr>
                </table>
            </div>
            
            <div class="section">
                <h3>Diagnóstico y Reparación</h3>
                <table class="info-table">
                    <tr><td>Diagnóstico:</td><td>${orden.diagnostico || 'Sin diagnóstico'}</td></tr>
                    <tr><td>Trabajos Realizados:</td><td>${orden.trabajosRealizados || 'Sin trabajos registrados'}</td></tr>
                    <tr><td>Observaciones:</td><td>${orden.observaciones || 'Sin observaciones'}</td></tr>
                </table>
            </div>
            
            <div class="section">
                <p><strong>Fecha de Impresión:</strong> ${new Date().toLocaleString('es-ES')}</p>
            </div>
        </body>
        </html>
    `;
}

function checkForSpecificOrder() {
    const ordenSeleccionada = sessionStorage.getItem('ordenSeleccionada');
    if (ordenSeleccionada) {
        sessionStorage.removeItem('ordenSeleccionada');
        
        // Wait for data to load, then show the specific order
        setTimeout(() => {
            const orden = ordenesData.find(o => o.numero === ordenSeleccionada);
            if (orden) {
                verDetalleOrden(orden.id);
            }
        }, 1500);
    }
}

function buscarOrdenes() {
    if (tablaOrdenes) {
        tablaOrdenes.draw();
    }
    showAlert('Búsqueda aplicada', 'info');
}

function limpiarFiltros() {
    $('#filtroOrden, #filtroCliente').val('');
    $('#filtroTecnico, #filtroEstado, #filtroPrioridad').val('');
    $('#filtroFechaDesde, #filtroFechaHasta').val('');
    
    if (tablaOrdenes) {
        tablaOrdenes.draw();
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
        'pendiente': 'Pendiente',
        'en_proceso': 'En Proceso',
        'completada': 'Completada',
        'entregada': 'Entregada',
        'cancelada': 'Cancelada'
    };
    return estados[estado] || estado;
}

function getEstadoClass(estado) {
    const clases = {
        'pendiente': 'secondary',
        'en_proceso': 'warning',
        'completada': 'success',
        'entregada': 'info',
        'cancelada': 'danger'
    };
    return clases[estado] || 'secondary';
}

function getEstadoBadge(estado) {
    const clase = getEstadoClass(estado);
    const texto = getEstadoText(estado);
    return `<span class="badge badge-${clase}">${texto}</span>`;
}

function getPrioridadText(prioridad) {
    const prioridades = {
        'baja': 'Baja',
        'media': 'Media',
        'alta': 'Alta',
        'urgente': 'Urgente'
    };
    return prioridades[prioridad] || prioridad;
}

function getPrioridadClass(prioridad) {
    const clases = {
        'baja': 'success',
        'media': 'warning',
        'alta': 'orange',
        'urgente': 'danger'
    };
    return clases[prioridad] || 'secondary';
}

function getPrioridadBadge(prioridad) {
    const clase = getPrioridadClass(prioridad);
    const texto = getPrioridadText(prioridad);
    return `<span class="badge badge-${clase}">${texto}</span>`;
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