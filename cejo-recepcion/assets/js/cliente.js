// Configuración de la URL base del backend
const BASE_URL = '/CEJO/CEJO-BackEnd/public/index.php';

// Variables globales
let clienteActual = null;

/**
 * Inicialización cuando el documento está listo
 */
$(document).ready(function() {
    // Configurar fecha actual
    $('#fechaIngreso').val(new Date().toISOString().split('T')[0]);
    
    // Event listeners
    $('#clienteForm').on('submit', guardarCliente);
    $('#buscarCliente').on('click', abrirModalBusqueda);
    $('#btnBuscarDNI').on('click', buscarClientePorDNI);
    $('#limpiarBtn').on('click', limpiarFormulario);
    
    // Buscar cliente al presionar Enter en el campo DNI
    $('#buscarDNI').on('keypress', function(e) {
        if (e.which === 13) {
            buscarClientePorDNI();
        }
    });
});

/**
 * Abrir modal de búsqueda de cliente
 */
function abrirModalBusqueda() {
    $('#buscarClienteModal').modal('show');
    $('#buscarDNI').focus();
}

/**
 * Buscar cliente por DNI
 */
function buscarClientePorDNI() {
    const dni = $('#buscarDNI').val().trim();
    
    if (!dni) {
        mostrarAlerta('Por favor ingrese un DNI para buscar', 'warning');
        return;
    }
    
    $.ajax({
        url: `${BASE_URL}/clientes/buscar-dni/${dni}`,
        method: 'GET',
        dataType: 'json',
        beforeSend: function() {
            $('#btnBuscarDNI').prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Buscando...');
        },
        success: function(response) {
            if (response.success && response.data) {
                mostrarResultadoBusqueda(response.data);
            } else {
                $('#resultadoBusqueda').html('<div class="alert alert-info">No se encontró ningún cliente con ese DNI.</div>');
            }
        },
        error: function(xhr) {
            let mensaje = 'Error al buscar cliente.';
            if (xhr.responseJSON && xhr.responseJSON.message) {
                mensaje = xhr.responseJSON.message;
            }
            $('#resultadoBusqueda').html(`<div class="alert alert-danger">${mensaje}</div>`);
        },
        complete: function() {
            $('#btnBuscarDNI').prop('disabled', false).html('<i class="fas fa-search"></i> Buscar');
        }
    });
}

/**
 * Mostrar resultado de búsqueda de cliente
 */
function mostrarResultadoBusqueda(cliente) {
    const html = `
        <div class="card">
            <div class="card-header">
                <h5 class="mb-0">Cliente encontrado</h5>
            </div>
            <div class="card-body">
                <p><strong>Nombre:</strong> ${cliente.nombres} ${cliente.apellidos}</p>
                <p><strong>DNI:</strong> ${cliente.numeroDocumento}</p>
                <p><strong>Teléfono:</strong> ${cliente.telefono || 'No especificado'}</p>
                <p><strong>Email:</strong> ${cliente.correoElectronico || 'No especificado'}</p>
                <p><strong>Dirección:</strong> ${cliente.direccion || 'No especificada'}</p>
                <button type="button" class="btn btn-primary" onclick="cargarDatosCliente(${JSON.stringify(cliente).replace(/"/g, '&quot;')})">
                    <i class="fas fa-check"></i> Usar este cliente
                </button>
            </div>
        </div>
    `;
    $('#resultadoBusqueda').html(html);
}

/**
 * Cargar datos del cliente en el formulario
 */
function cargarDatosCliente(cliente) {
    clienteActual = cliente;
    
    $('#nombre').val(cliente.nombres);
    $('#apellido').val(cliente.apellidos);
    $('#numeroDocumento').val(cliente.numeroDocumento);
    $('#telefono').val(cliente.telefono || '');
    $('#correoElectronico').val(cliente.correoElectronico || '');
    $('#direccion').val(cliente.direccion || '');
    $('#codigoPostal').val(cliente.codigoPostal || '');
    $('#ciudad').val(cliente.ciudad || '');
    $('#provincia').val(cliente.provincia || '');
    
    $('#buscarClienteModal').modal('hide');
    mostrarAlerta('Datos del cliente cargados correctamente', 'success');
}

/**
 * Guardar cliente
 */
function guardarCliente(event) {
    event.preventDefault();
    
    // Validar formulario
    if (!validarFormularioCliente()) {
        return;
    }
    
    const datosCliente = {
        nombres: $('#nombre').val().trim(),
        apellidos: $('#apellido').val().trim(),
        numeroDocumento: $('#numeroDocumento').val().trim(),
        telefono: $('#telefono').val().trim(),
        correoElectronico: $('#correoElectronico').val().trim(),
        direccion: $('#direccion').val().trim(),
        codigoPostal: $('#codigoPostal').val().trim(),
        ciudad: $('#ciudad').val().trim(),
        provincia: $('#provincia').val().trim()
    };
    
    // Si es un cliente existente, incluir el ID
    if (clienteActual && clienteActual.idClientes) {
        datosCliente.idClientes = clienteActual.idClientes;
    }
    
    const metodo = clienteActual ? 'PUT' : 'POST';
    const url = clienteActual ? `${BASE_URL}/clientes/${clienteActual.idClientes}` : `${BASE_URL}/clientes`;
    
    $.ajax({
        url: url,
        method: metodo,
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(datosCliente),
        beforeSend: function() {
            $('#guardarClienteBtn').prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Guardando...');
        },
        success: function(response) {
            if (response.success) {
                mostrarAlerta(
                    clienteActual ? 'Cliente actualizado correctamente' : 'Cliente guardado correctamente',
                    'success'
                );
                
                // Actualizar cliente actual con los datos guardados
                if (response.data) {
                    clienteActual = response.data;
                }
                
                // Opcional: redirigir a la página de equipos
                setTimeout(() => {
                    window.location.href = 'equipo.html';
                }, 1500);
            } else {
                mostrarAlerta('Error al guardar cliente: ' + (response.message || 'Error desconocido'), 'error');
            }
        },
        error: function(xhr) {
            let mensaje = 'Error al guardar cliente.';
            if (xhr.responseJSON && xhr.responseJSON.message) {
                mensaje = xhr.responseJSON.message;
            }
            mostrarAlerta(mensaje, 'error');
        },
        complete: function() {
            $('#guardarClienteBtn').prop('disabled', false).html('<i class="fas fa-save mr-2"></i>Guardar Cliente');
        }
    });
}

/**
 * Validar formulario de cliente
 */
function validarFormularioCliente() {
    const campos = [
        { id: 'nombre', nombre: 'Nombre' },
        { id: 'apellido', nombre: 'Apellido' },
        { id: 'numeroDocumento', nombre: 'Número de Documento' },
        { id: 'telefono', nombre: 'Teléfono' }
    ];
    
    for (let campo of campos) {
        const valor = $(`#${campo.id}`).val().trim();
        if (!valor) {
            mostrarAlerta(`El campo ${campo.nombre} es obligatorio`, 'warning');
            $(`#${campo.id}`).focus();
            return false;
        }
    }
    
    // Validar formato de email si se proporciona
    const email = $('#correoElectronico').val().trim();
    if (email && !validarEmail(email)) {
        mostrarAlerta('El formato del correo electrónico no es válido', 'warning');
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
    Swal.fire({
        title: '¿Está seguro?',
        text: 'Se perderán todos los datos ingresados',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, limpiar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            $('#clienteForm')[0].reset();
            clienteActual = null;
            mostrarAlerta('Formulario limpiado', 'info');
        }
    });
}

/**
 * Mostrar alerta con SweetAlert2
 */
function mostrarAlerta(mensaje, tipo = 'info') {
    const iconos = {
        'success': 'success',
        'error': 'error',
        'warning': 'warning',
        'info': 'info'
    };
    
    Swal.fire({
        icon: iconos[tipo] || 'info',
        title: mensaje,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        toast: true,
        position: 'top-end'
    });
}