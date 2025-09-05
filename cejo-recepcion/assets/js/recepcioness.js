// URL base del backend
const BASE_URL = '/CEJO/CEJO-BackEnd/public/index.php';

$(document).ready(function() {
    console.log('Document ready - iniciando carga de datos');
    console.log('jQuery version:', $.fn.jquery);
    console.log('jQuery disponible:', typeof $ !== 'undefined');
    
    // Configurar fecha de ingreso por defecto (hoy)
    $('#fechaIngreso').val(new Date().toISOString().split('T')[0]);
    
    // Cargar categorías de equipos desde la base de datos
    console.log('Llamando cargarCategoriasEquipos...');
    cargarCategoriasEquipos();
    
    // Cargar tipos de garantías desde la base de datos
    console.log('Llamando cargarTiposGarantias...');
    cargarTiposGarantias();
    
    // Cargar marcas de equipos desde la base de datos
    console.log('Llamando cargarMarcasEquipos...');
    cargarMarcasEquipos();
    
    // Manejar búsqueda de cliente por DNI
    $('#buscarCliente').on('click', function() {
        const dni = $('#numeroDocumento').val().trim();
        if (dni) {
            buscarClientePorDNI(dni);
        } else {
            mostrarAlerta('Por favor, ingrese un número de documento para buscar.', 'warning');
        }
    });
    
    // Buscar cliente al presionar Enter en el campo DNI
    $('#numeroDocumento').on('keypress', function(e) {
        if (e.which === 13) { // Enter key
            const dni = $(this).val().trim();
            if (dni) {
                buscarClientePorDNI(dni);
            }
        }
    });
    
    // Manejar envío del formulario
    $('#servicioForm').on('submit', function(e) {
        e.preventDefault();
        guardarServicio();
    });
    
    // Manejar botón cancelar
    $('#cancelarBtn').on('click', function() {
        if (confirm('¿Está seguro de que desea cancelar? Se perderán todos los datos ingresados.')) {
            limpiarFormulario();
        }
    });
    
    // Manejar botón imprimir
    $('#imprimirBtn').on('click', function() {
        // TODO: Implementar funcionalidad de impresión
        mostrarAlerta('Funcionalidad de impresión en desarrollo.', 'info');
    });
    
    // Manejar preview de fotos
    $('#fotosEquipo').on('change', function() {
        previewFotos(this.files);
    });
    
    // Manejar cambio en el select de garantía para mostrar/ocultar datos de facturación
     $('#garantia').on('change', function() {
         const garantiaSeleccionada = $(this).find('option:selected').text();
         const datosFacturacion = $('#datosFacturacion');
         
         // Mostrar datos de facturación solo si se selecciona T2 o T3
         if (garantiaSeleccionada.includes('T2') || garantiaSeleccionada.includes('T3')) {
             datosFacturacion.slideDown();
         } else {
             datosFacturacion.slideUp();
         }
     });
});

/**
 * Cargar categorías de equipos desde la base de datos
 */
function cargarCategoriasEquipos() {
    console.log('Ejecutando cargarCategoriasEquipos - URL:', '/CEJO/CEJO-BackEnd/public/index.php/categorias-equipos');
    $.ajax({
        url: '/CEJO/CEJO-BackEnd/public/index.php/categorias-equipos',
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            console.log('SUCCESS cargarCategoriasEquipos - Response:', response);
            if (response.success && response.data) {
                const select = $('#tipoEquipo');
                select.empty().append('<option value="">Seleccionar categoría</option>');
                
                response.data.forEach(function(categoria) {
                    select.append(`<option value="${categoria.idCategorias}">${categoria.Nombres_Categorias}</option>`);
                });
            }
        },
        error: function(xhr, status, error) {
            console.error('ERROR cargarCategoriasEquipos - Status:', status, 'Error:', error, 'XHR:', xhr);
        }
    });
}

/**
 * Cargar tipos de garantías desde la base de datos
 */
function cargarTiposGarantias() {
    console.log('Ejecutando cargarTiposGarantias - URL:', '/CEJO/CEJO-BackEnd/public/index.php/garantias');
    $.ajax({
        url: '/CEJO/CEJO-BackEnd/public/index.php/garantias',
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            console.log('SUCCESS cargarTiposGarantias - Response:', response);
            if (response.success && response.data) {
                const select = $('#garantia');
                select.empty().append('<option value="">Seleccionar garantía</option>');
                
                response.data.forEach(function(garantia) {
                    select.append(`<option value="${garantia.idGarantias}">${garantia.Descripcion_Garantias}</option>`);
                });
            }
        },
        error: function(xhr, status, error) {
            console.error('ERROR cargarTiposGarantias - Status:', status, 'Error:', error, 'XHR:', xhr);
        }
    });
}

/**
 * Cargar marcas de equipos desde la tabla de proveedores
 */
function cargarMarcasEquipos() {
    console.log('Ejecutando cargarMarcasEquipos - URL:', '/CEJO/CEJO-BackEnd/public/index.php/proveedores');
    $.ajax({
        url: '/CEJO/CEJO-BackEnd/public/index.php/proveedores',
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            console.log('SUCCESS cargarMarcasEquipos - Response:', response);
            if (response.success && response.data) {
                const select = $('#marca');
                select.empty().append('<option value="">Seleccionar marca</option>');
                
                response.data.forEach(function(proveedor) {
                    select.append(`<option value="${proveedor.idProveedor}">${proveedor.Nombre_Proveedor}</option>`);
                });
            }
        },
        error: function(xhr, status, error) {
            console.error('ERROR cargarMarcasEquipos - Status:', status, 'Error:', error, 'XHR:', xhr);
        }
    });
}

/**
 * Buscar cliente por DNI
 */
function buscarClientePorDNI(dni) {
    $.ajax({
        url: `/CEJO/CEJO-BackEnd/public/index.php/clientes/buscar-dni/${dni}`,
        method: 'GET',
        dataType: 'json',
        beforeSend: function() {
            $('#buscarCliente').prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Buscando...');
        },
        success: function(response) {
            if (response.success && response.data) {
                // Cliente encontrado, llenar campos
                const cliente = response.data;
                $('#nombre').val(cliente.Nombres_Clientes || '');
                $('#apellido').val(cliente.Apellidos_Clientes || '');
                $('#telefono').val(cliente.Telefono_Clientes || '');
                $('#correoElectronico').val(cliente.Email_Clientes || '');
                $('#direccion').val(cliente.Direccion_Clientes || '');
                $('#codigoPostal').val(cliente.CodigoPostal_Clientes || '');
                $('#ciudad').val(cliente.Ciudad_Clientes || '');
                $('#provincia').val(cliente.Provincia_Clientes || '');
                
                mostrarAlerta('Cliente encontrado y datos cargados.', 'success');
            } else {
                mostrarAlerta('Cliente no encontrado. Puede registrar un nuevo cliente.', 'info');
            }
        },
        error: function() {
            mostrarAlerta('Error al buscar cliente. Intente nuevamente.', 'error');
        },
        complete: function() {
            $('#buscarCliente').prop('disabled', false).html('<i class="fas fa-search"></i> Buscar Cliente');
        }
    });
}

/**
 * Guardar servicio (cliente + equipo)
 */
function guardarServicio() {
    // Validar formulario
    if (!validarFormulario()) {
        return;
    }
    
    // Recopilar datos del cliente
    const datosCliente = {
        Nombres_Clientes: $('#nombre').val().trim(),
        Apellidos_Clientes: $('#apellido').val().trim(),
        DNI_Clientes: $('#numeroDocumento').val().trim(),
        Telefono_Clientes: $('#telefono').val().trim(),
        Email_Clientes: $('#correoElectronico').val().trim(),
        Direccion_Clientes: $('#direccion').val().trim(),
        CodigoPostal_Clientes: $('#codigoPostal').val().trim(),
        Ciudad_Clientes: $('#ciudad').val().trim(),
        Provincia_Clientes: $('#provincia').val().trim()
    };
    
    // Recopilar datos del equipo
    const datosEquipo = {
        idCategorias_Equipos: $('#tipoEquipo').val(),
        Marca_Equipo: $('#marca').val(),
        Modelo_Equipos: $('#modelo').val().trim(),
        FechaIngreso_Equipos: $('#fechaIngreso').val(),
        DescripcionProblema_Equipos: $('#descripcionProblema').val().trim(),
        idGarantias_Equipos: $('#garantia').val() || null,
        Accesorios_Equipos: $('#accesorios').val().trim(),
        NumeroBR_Equipos: $('#numeroBR').val().trim()
    };
    
    // Datos de factura (si aplica)
    const datosFactura = {
        FechaCompra_Factura: $('#fechaCompra').val() || null,
        NumeroFactura_Factura: $('#numeroFactura').val().trim(),
        Comercio_Factura: $('#comercio').val().trim(),
        Localidad_Factura: $('#localidad').val().trim(),
        Pagador_Factura: $('#pagador').val().trim()
    };
    
    // Primero, crear o actualizar cliente
    guardarCliente(datosCliente, function(clienteId) {
        // Luego, crear equipo asociado al cliente
        datosEquipo.idClientes_Equipos = clienteId;
        
        // Verificar si necesita crear factura (garantías T2 o T3)
        const garantiaSeleccionada = $('#garantia option:selected').text();
        const necesitaFactura = garantiaSeleccionada.includes('T2') || garantiaSeleccionada.includes('T3');
        
        guardarEquipo(datosEquipo, function(equipoId) {
            if (necesitaFactura && equipoId) {
                // Crear factura asociada al equipo
                datosFactura.idEquipo_Factura = equipoId;
                guardarFactura(datosFactura);
            }
        });
    });
}

/**
 * Guardar cliente
 */
function guardarCliente(datosCliente, callback) {
    $.ajax({
        url: '/CEJO/CEJO-BackEnd/public/index.php/clientes',
        method: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(datosCliente),
        beforeSend: function() {
            $('#guardarBtn').prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Guardando...');
        },
        success: function(response) {
            if (response.success && response.data) {
                callback(response.data.idCliente);
            } else {
                mostrarAlerta('Error al guardar cliente: ' + (response.message || 'Error desconocido'), 'error');
                $('#guardarBtn').prop('disabled', false).html('<i class="fas fa-save mr-2"></i>Guardar');
            }
        },
        error: function(xhr) {
            let mensaje = 'Error al guardar cliente.';
            if (xhr.responseJSON && xhr.responseJSON.message) {
                mensaje = xhr.responseJSON.message;
            }
            mostrarAlerta(mensaje, 'error');
            $('#guardarBtn').prop('disabled', false).html('<i class="fas fa-save mr-2"></i>Guardar');
        }
    });
}

/**
 * Guardar equipo
 */
function guardarEquipo(datosEquipo, callback) {
    $.ajax({
        url: '/CEJO/CEJO-BackEnd/public/index.php/equipos',
        method: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(datosEquipo),
        success: function(response) {
            if (response.success && response.data) {
                mostrarAlerta('Servicio registrado exitosamente.', 'success');
                
                // Llamar callback con el ID del equipo si se proporciona
                if (callback && typeof callback === 'function') {
                    callback(response.data.idEquipos);
                }
                
                // Opcional: limpiar formulario después de un tiempo
                setTimeout(function() {
                    if (confirm('¿Desea registrar otro servicio?')) {
                        limpiarFormulario();
                    }
                }, 2000);
            } else {
                mostrarAlerta('Error al registrar equipo: ' + (response.message || 'Error desconocido'), 'error');
            }
        },
        error: function(xhr) {
            let mensaje = 'Error al registrar equipo.';
            if (xhr.responseJSON && xhr.responseJSON.message) {
                mensaje = xhr.responseJSON.message;
            }
            mostrarAlerta(mensaje, 'error');
        },
        complete: function() {
            $('#guardarBtn').prop('disabled', false).html('<i class="fas fa-save mr-2"></i>Guardar');
        }
    });
}

/**
 * Guardar factura
 */
function guardarFactura(datosFactura) {
    $.ajax({
        url: '/CEJO/CEJO-BackEnd/public/index.php/facturas',
        method: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(datosFactura),
        success: function(response) {
            if (response.success) {
                mostrarAlerta('Factura registrada exitosamente.', 'success');
            } else {
                mostrarAlerta('Error al registrar factura: ' + (response.message || 'Error desconocido'), 'warning');
            }
        },
        error: function(xhr) {
            let mensaje = 'Error al registrar factura.';
            if (xhr.responseJSON && xhr.responseJSON.message) {
                mensaje = xhr.responseJSON.message;
            }
            mostrarAlerta(mensaje, 'warning');
        }
    });
}

/**
 * Validar formulario
 */
function validarFormulario() {
    const camposRequeridos = [
        { campo: '#nombre', nombre: 'Nombre' },
        { campo: '#apellido', nombre: 'Apellido' },
        { campo: '#numeroDocumento', nombre: 'Número de Documento' },
        { campo: '#telefono', nombre: 'Teléfono' },
        { campo: '#tipoEquipo', nombre: 'Categoría de Equipo' },
        { campo: '#marca', nombre: 'Marca' },
        { campo: '#fechaIngreso', nombre: 'Fecha de Ingreso' },
        { campo: '#descripcionProblema', nombre: 'Descripción del Problema' }
    ];
    
    for (let item of camposRequeridos) {
        const valor = $(item.campo).val().trim();
        if (!valor) {
            mostrarAlerta(`El campo "${item.nombre}" es requerido.`, 'warning');
            $(item.campo).focus();
            return false;
        }
    }
    
    // Validar formato de email si se proporciona
    const email = $('#correoElectronico').val().trim();
    if (email && !validarEmail(email)) {
        mostrarAlerta('El formato del correo electrónico no es válido.', 'warning');
        $('#correoElectronico').focus();
        return false;
    }
    
    return true;
}

/**
 * Validar formato de email
 */
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Limpiar formulario
 */
function limpiarFormulario() {
    $('#servicioForm')[0].reset();
    $('#fechaIngreso').val(new Date().toISOString().split('T')[0]);
    $('#previewFotos').empty();
    mostrarAlerta('Formulario limpiado.', 'info');
}

/**
 * Preview de fotos
 */
function previewFotos(files) {
    const preview = $('#previewFotos');
    preview.empty();
    
    Array.from(files).forEach(function(file, index) {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const col = $(`
                    <div class="col-md-3 mb-3">
                        <div class="card">
                            <img src="${e.target.result}" class="card-img-top" style="height: 150px; object-fit: cover;">
                            <div class="card-body p-2">
                                <button type="button" class="btn btn-sm btn-danger btn-block" onclick="eliminarFoto(${index})">
                                    <i class="fas fa-trash"></i> Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                `);
                preview.append(col);
            };
            reader.readAsDataURL(file);
        }
    });
}

/**
 * Eliminar foto del preview
 */
function eliminarFoto(index) {
    // TODO: Implementar eliminación de foto específica
    mostrarAlerta('Funcionalidad de eliminación de fotos en desarrollo.', 'info');
}

/**
 * Mostrar alertas
 */
function mostrarAlerta(mensaje, tipo) {
    let clase = 'alert-info';
    let icono = 'fas fa-info-circle';
    
    switch (tipo) {
        case 'success':
            clase = 'alert-success';
            icono = 'fas fa-check-circle';
            break;
        case 'error':
            clase = 'alert-danger';
            icono = 'fas fa-exclamation-circle';
            break;
        case 'warning':
            clase = 'alert-warning';
            icono = 'fas fa-exclamation-triangle';
            break;
    }
    
    const alerta = $(`
        <div class="alert ${clase} alert-dismissible fade show" role="alert">
            <i class="${icono} mr-2"></i>${mensaje}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    `);
    
    // Insertar alerta al inicio del contenido
    $('.content .container-fluid').prepend(alerta);
    
    // Auto-remover después de 5 segundos
    setTimeout(function() {
        alerta.fadeOut(function() {
            $(this).remove();
        });
    }, 5000);
}