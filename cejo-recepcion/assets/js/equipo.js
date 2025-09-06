// Configuración de la URL base del backend
const BASE_URL = '/CEJO/CEJO-BackEnd/public/index.php';

// Variables globales
let equipoActual = null;
let fotosSeleccionadas = [];

/**
 * Inicialización cuando el documento está listo
 */
$(document).ready(function() {
    // Configurar fecha actual
    $('#fechaIngreso').val(new Date().toISOString().split('T')[0]);
    
    // Cargar datos iniciales
    cargarCategoriasEquipos();
    cargarTiposGarantias();
    cargarMarcasEquipos();
    
    // Event listeners
    $('#equipoForm').on('submit', guardarEquipo);
    $('#limpiarBtn').on('click', limpiarFormulario);
    $('#fotosEquipo').on('change', manejarSeleccionFotos);
    $('#garantia').on('change', manejarCambioGarantia);
    
    // Ocultar datos de facturación inicialmente
    $('#datosFacturacion').hide();
});

/**
 * Cargar categorías de equipos desde el backend
 */
function cargarCategoriasEquipos() {
    console.log('Cargando categorías de equipos desde:', `${BASE_URL}/categorias-equipos`);
    $.ajax({
        url: `${BASE_URL}/categorias-equipos`,
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            console.log('Respuesta categorías:', response);
            if (response.success && response.data) {
                let options = '<option value="">Seleccione una categoría</option>';
                response.data.forEach(function(categoria) {
                    options += `<option value="${categoria.idCategorias}">${categoria.Nombres_Categorias}</option>`;
                });
                $('#tipoEquipo').html(options);
            } else {
                $('#tipoEquipo').html('<option value="">Error al cargar categorías</option>');
            }
        },
        error: function(xhr, status, error) {
            console.error('Error al cargar categorías:', error);
            $('#tipoEquipo').html('<option value="">Error al cargar categorías</option>');
        }
    });
}

/**
 * Cargar tipos de garantías desde el backend
 */
function cargarTiposGarantias() {
    console.log('Cargando tipos de garantías desde:', `${BASE_URL}/garantias`);
    $.ajax({
        url: `${BASE_URL}/garantias`,
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            console.log('Respuesta garantías:', response);
            if (response.success && response.data) {
                let options = '<option value="">Seleccione tipo de garantía</option>';
                response.data.forEach(function(garantia) {
                    options += `<option value="${garantia.idGarantias}">${garantia.Descripcion_Garantias}</option>`;
                });
                $('#garantia').html(options);
            } else {
                $('#garantia').html('<option value="">Error al cargar garantías</option>');
            }
        },
        error: function(xhr, status, error) {
            console.error('Error al cargar garantías:', error);
            $('#garantia').html('<option value="">Error al cargar garantías</option>');
        }
    });
}

/**
 * Cargar marcas de equipos desde el backend
 */
function cargarMarcasEquipos() {
    console.log('Cargando marcas de equipos desde:', `${BASE_URL}/proveedores`);
    $.ajax({
        url: `${BASE_URL}/proveedores`,
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            console.log('Respuesta marcas:', response);
            if (response.success && response.data) {
                let options = '<option value="">Seleccione una marca</option>';
                response.data.forEach(function(proveedor) {
                    options += `<option value="${proveedor.idProveedor}">${proveedor.Nombre_Proveedor}</option>`;
                });
                $('#marca').html(options);
            } else {
                $('#marca').html('<option value="">Error al cargar marcas</option>');
            }
        },
        error: function(xhr, status, error) {
            console.error('Error al cargar marcas:', error);
            $('#marca').html('<option value="">Error al cargar marcas</option>');
        }
    });
}

/**
 * Manejar cambio en el select de garantía
 */
function manejarCambioGarantia() {
    const garantiaSeleccionada = $('#garantia').val();
    
    // Mostrar datos de facturación solo para T2 (id: 2) y T3 (id: 3)
    if (garantiaSeleccionada === '2' || garantiaSeleccionada === '3') {
        $('#datosFacturacion').slideDown();
    } else {
        $('#datosFacturacion').slideUp();
        // Limpiar campos de facturación cuando se oculta
        $('#numeroBR, #fechaCompra, #numeroFactura, #comercio, #localidad, #pagador').val('');
    }
}

/**
 * Manejar selección de fotos
 */
function manejarSeleccionFotos(event) {
    const archivos = event.target.files;
    fotosSeleccionadas = Array.from(archivos);
    
    // Mostrar preview de las fotos
    mostrarPreviewFotos();
}

/**
 * Mostrar preview de las fotos seleccionadas
 */
function mostrarPreviewFotos() {
    const previewContainer = $('#previewFotos');
    previewContainer.empty();
    
    fotosSeleccionadas.forEach((archivo, index) => {
        if (archivo.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const html = `
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
                `;
                previewContainer.append(html);
            };
            reader.readAsDataURL(archivo);
        }
    });
}

/**
 * Eliminar foto del preview
 */
function eliminarFoto(index) {
    fotosSeleccionadas.splice(index, 1);
    mostrarPreviewFotos();
    
    // Actualizar el input file
    const dt = new DataTransfer();
    fotosSeleccionadas.forEach(archivo => dt.items.add(archivo));
    $('#fotosEquipo')[0].files = dt.files;
}

/**
 * Guardar equipo
 */
function guardarEquipo(event) {
    event.preventDefault();
    
    // Validar formulario
    if (!validarFormularioEquipo()) {
        return;
    }
    
    const datosEquipo = {
        idCategorias_Equipos: parseInt($('#tipoEquipo').val()),
        idProveedor_Equipos: parseInt($('#marca').val()),
        modelo: $('#modelo').val().trim(),
        fechaIngreso: $('#fechaIngreso').val(),
        descripcionProblema: $('#descripcionProblema').val().trim(),
        idGarantias_Equipos: $('#garantia').val() ? parseInt($('#garantia').val()) : null,
        accesorios: $('#accesorios').val().trim(),
        numeroBR: $('#numeroBR').val().trim(),
        fechaCompra: $('#fechaCompra').val() || null,
        numeroFactura: $('#numeroFactura').val().trim(),
        comercio: $('#comercio').val().trim(),
        localidad: $('#localidad').val().trim(),
        pagador: $('#pagador').val().trim(),
        idEstados_Equipos: 1 // Estado inicial: Recibido
    };
    
    // Si es un equipo existente, incluir el ID
    if (equipoActual && equipoActual.idEquipos) {
        datosEquipo.idEquipos = equipoActual.idEquipos;
    }
    
    const metodo = equipoActual ? 'PUT' : 'POST';
    const url = equipoActual ? `${BASE_URL}/equipos/${equipoActual.idEquipos}` : `${BASE_URL}/equipos`;
    
    $.ajax({
        url: url,
        method: metodo,
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(datosEquipo),
        beforeSend: function() {
            $('#guardarEquipoBtn').prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Guardando...');
        },
        success: function(response) {
            if (response.success) {
                mostrarAlerta(
                    equipoActual ? 'Equipo actualizado correctamente' : 'Equipo guardado correctamente',
                    'success'
                );
                
                // Actualizar equipo actual con los datos guardados
                if (response.data) {
                    equipoActual = response.data;
                }
                
                // Si hay fotos, subirlas
                if (fotosSeleccionadas.length > 0 && response.data && response.data.idEquipos) {
                    subirFotosEquipo(response.data.idEquipos);
                }
                
                // Opcional: redirigir o limpiar formulario
                setTimeout(() => {
                    limpiarFormulario();
                }, 2000);
            } else {
                mostrarAlerta('Error al guardar equipo: ' + (response.message || 'Error desconocido'), 'error');
            }
        },
        error: function(xhr) {
            let mensaje = 'Error al guardar equipo.';
            if (xhr.responseJSON && xhr.responseJSON.message) {
                mensaje = xhr.responseJSON.message;
            }
            mostrarAlerta(mensaje, 'error');
        },
        complete: function() {
            $('#guardarEquipoBtn').prop('disabled', false).html('<i class="fas fa-save mr-2"></i>Guardar Equipo');
        }
    });
}

/**
 * Subir fotos del equipo
 */
function subirFotosEquipo(idEquipo) {
    if (fotosSeleccionadas.length === 0) return;
    
    const formData = new FormData();
    fotosSeleccionadas.forEach((archivo, index) => {
        formData.append(`fotos[]`, archivo);
    });
    formData.append('idEquipo', idEquipo);
    
    $.ajax({
        url: `${BASE_URL}/equipos/${idEquipo}/fotos`,
        method: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(response) {
            if (response.success) {
                mostrarAlerta('Fotos subidas correctamente', 'success');
            } else {
                mostrarAlerta('Error al subir fotos: ' + (response.message || 'Error desconocido'), 'warning');
            }
        },
        error: function(xhr) {
            console.error('Error al subir fotos:', xhr);
            mostrarAlerta('Error al subir fotos', 'warning');
        }
    });
}

/**
 * Validar formulario de equipo
 */
function validarFormularioEquipo() {
    const campos = [
        { id: 'tipoEquipo', nombre: 'Categoría de Equipo' },
        { id: 'marca', nombre: 'Marca' },
        { id: 'fechaIngreso', nombre: 'Fecha de Ingreso' },
        { id: 'descripcionProblema', nombre: 'Descripción del Problema' }
    ];
    
    for (let campo of campos) {
        const valor = $(`#${campo.id}`).val();
        if (!valor || valor.trim() === '') {
            mostrarAlerta(`El campo ${campo.nombre} es obligatorio`, 'warning');
            $(`#${campo.id}`).focus();
            return false;
        }
    }
    
    return true;
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
            $('#equipoForm')[0].reset();
            equipoActual = null;
            fotosSeleccionadas = [];
            $('#previewFotos').empty();
            $('#fechaIngreso').val(new Date().toISOString().split('T')[0]);
            $('#datosFacturacion').hide(); // Ocultar datos de facturación
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