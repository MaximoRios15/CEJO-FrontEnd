// TechRepair Recepcion - JavaScript Functions

$(document).ready(function() {
    // Initialize the application
    initializeApp();
    
    // Event listeners
    setupEventListeners();
    
    // Initialize dropzone
    initializeDropzone();
});

function initializeApp() {
    console.log('TechRepair Recepcion initialized');
    
    // Set current date
    const today = new Date().toISOString().split('T')[0];
    
    // Initialize form validation
    setupFormValidation();
}

function setupEventListeners() {
    // Buscar Cliente button
    $('#buscarCliente').on('click', function() {
        buscarCliente();
    });
    
    // Form submission
    $('#servicioForm').on('submit', function(e) {
        e.preventDefault();
        guardarServicio();
    });
    
    // Cancelar button
    $('#cancelarBtn').on('click', function() {
        cancelarFormulario();
    });
    
    // Imprimir button
    $('#imprimirBtn').on('click', function() {
        imprimirComprobante();
    });
    
    // Tipo de equipo change
    $('#tipoEquipo').on('change', function() {
        actualizarMarcas();
    });
    
    // Auto-format phone number
    $('#telefono').on('input', function() {
        formatPhoneNumber(this);
    });
    
    // Auto-format document number
    $('#numeroDocumento').on('input', function() {
        formatDocumentNumber(this);
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

function buscarCliente() {
    const numeroDocumento = $('#numeroDocumento').val().trim();
    
    if (!numeroDocumento) {
        showAlert('Por favor ingrese un número de documento para buscar', 'warning');
        return;
    }
    
    // Show loading state
    const $btn = $('#buscarCliente');
    const originalText = $btn.html();
    $btn.html('<i class="fas fa-spinner fa-spin"></i> Buscando...').prop('disabled', true);
    
    // Simulate API call
    setTimeout(() => {
        // Mock data - replace with actual API call
        const clienteEncontrado = {
            nombre: 'Alejandro Rodríguez Martínez',
            documento: numeroDocumento,
            telefono: '+52 555 123 4567',
            email: 'alejandro.rodriguez@email.com',
            direccion: 'Calle Reforma #123, Col. Centro, Ciudad de México, CP 06000'
        };
        
        // Fill form with found data
        $('#nombreCompleto').val(clienteEncontrado.nombre);
        $('#telefono').val(clienteEncontrado.telefono);
        $('#correoElectronico').val(clienteEncontrado.email);
        $('#direccion').val(clienteEncontrado.direccion);
        
        showAlert('Cliente encontrado y datos cargados exitosamente', 'success');
        
        // Restore button
        $btn.html(originalText).prop('disabled', false);
    }, 1500);
}

function guardarServicio() {
    // Validate form
    if (!validateForm()) {
        showAlert('Por favor complete todos los campos requeridos', 'error');
        return;
    }
    
    // Show loading state
    const $btn = $('#guardarBtn');
    const originalText = $btn.html();
    $btn.html('<i class="fas fa-spinner fa-spin"></i> Guardando...').prop('disabled', true);
    
    // Collect form data
    const formData = collectFormData();
    
    // Simulate API call
    setTimeout(() => {
        console.log('Datos del servicio:', formData);
        
        // Show success message
        showAlert('Servicio registrado exitosamente. Número de orden: #' + generateOrderNumber(), 'success');
        
        // Enable print button
        $('#imprimirBtn').prop('disabled', false);
        
        // Restore button
        $btn.html(originalText).prop('disabled', false);
    }, 2000);
}

function validateForm() {
    let isValid = true;
    
    // Validate required fields
    $('input[required], textarea[required], select[required]').each(function() {
        if (!validateField(this)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function collectFormData() {
    return {
        cliente: {
            nombre: $('#nombreCompleto').val(),
            documento: $('#numeroDocumento').val(),
            telefono: $('#telefono').val(),
            email: $('#correoElectronico').val(),
            direccion: $('#direccion').val()
        },
        equipo: {
            tipo: $('#tipoEquipo').val(),
            marca: $('#marca').val(),
            modelo: $('#modelo').val(),
            problema: $('#descripcionProblema').val(),
            garantia: $('#garantia').val(),
            accesorios: $('#accesorios').val()
        },
        fotos: getUploadedFiles()
    };
}

function cancelarFormulario() {
    if (confirm('¿Está seguro que desea cancelar? Se perderán todos los datos ingresados.')) {
        // Reset form
        $('#servicioForm')[0].reset();
        
        // Clear validation classes
        $('.is-valid, .is-invalid').removeClass('is-valid is-invalid');
        
        // Clear photo previews
        $('#previewFotos').empty();
        
        // Disable print button
        $('#imprimirBtn').prop('disabled', true);
        
        showAlert('Formulario cancelado', 'info');
    }
}

function imprimirComprobante() {
    // Create print content
    const printContent = generatePrintContent();
    
    // Open print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
}

function generatePrintContent() {
    const orderNumber = generateOrderNumber();
    const currentDate = new Date().toLocaleDateString('es-ES');
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Comprobante de Servicio - ${orderNumber}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .info { margin-bottom: 20px; }
                .section { margin-bottom: 15px; }
                .label { font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>TechRepair</h1>
                <h2>Comprobante de Servicio Técnico</h2>
                <p>Orden: ${orderNumber} | Fecha: ${currentDate}</p>
            </div>
            
            <div class="section">
                <h3>Datos del Cliente</h3>
                <p><span class="label">Nombre:</span> ${$('#nombreCompleto').val()}</p>
                <p><span class="label">Documento:</span> ${$('#numeroDocumento').val()}</p>
                <p><span class="label">Teléfono:</span> ${$('#telefono').val()}</p>
                <p><span class="label">Email:</span> ${$('#correoElectronico').val()}</p>
            </div>
            
            <div class="section">
                <h3>Datos del Equipo</h3>
                <p><span class="label">Tipo:</span> ${$('#tipoEquipo option:selected').text()}</p>
                <p><span class="label">Marca:</span> ${$('#marca').val()}</p>
                <p><span class="label">Modelo:</span> ${$('#modelo').val()}</p>
                <p><span class="label">Problema:</span> ${$('#descripcionProblema').val()}</p>
            </div>
            
            <div class="section">
                <p><strong>Términos y Condiciones:</strong></p>
                <p>- El cliente acepta los términos del servicio técnico</p>
                <p>- Tiempo estimado de reparación: 3-5 días hábiles</p>
                <p>- Conserve este comprobante para recoger su equipo</p>
            </div>
        </body>
        </html>
    `;
}

function initializeDropzone() {
    const $dropzone = $('.dropzone-wrapper');
    const $fileInput = $('#fotosEquipo');
    
    // Drag and drop events
    $dropzone.on('dragover dragenter', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).addClass('dragover');
    });
    
    $dropzone.on('dragleave dragend drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).removeClass('dragover');
    });
    
    $dropzone.on('drop', function(e) {
        const files = e.originalEvent.dataTransfer.files;
        handleFiles(files);
    });
    
    // File input change
    $fileInput.on('change', function() {
        handleFiles(this.files);
    });
    
    // Click to select files
    $dropzone.on('click', function() {
        $fileInput.click();
    });
}

function handleFiles(files) {
    const $preview = $('#previewFotos');
    
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageHtml = `
                    <div class="col-md-3 col-sm-4 col-6">
                        <div class="preview-image">
                            <img src="${e.target.result}" alt="Preview">
                            <button type="button" class="remove-image" onclick="removeImage(this)">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                `;
                $preview.append(imageHtml);
            };
            reader.readAsDataURL(file);
        }
    });
}

function removeImage(button) {
    $(button).closest('.col-md-3').remove();
}

function getUploadedFiles() {
    const files = [];
    $('#previewFotos img').each(function() {
        files.push($(this).attr('src'));
    });
    return files;
}

function actualizarMarcas() {
    const tipoEquipo = $('#tipoEquipo').val();
    const $marca = $('#marca');
    
    // Clear current value
    $marca.val('');
    
    // Set placeholder based on equipment type
    const placeholders = {
        'laptop': 'Ej: HP, Dell, Lenovo, Asus',
        'desktop': 'Ej: HP, Dell, Acer, Lenovo',
        'tablet': 'Ej: Apple, Samsung, Huawei',
        'smartphone': 'Ej: Apple, Samsung, Xiaomi',
        'impresora': 'Ej: HP, Canon, Epson, Brother',
        'otro': 'Especificar marca'
    };
    
    $marca.attr('placeholder', placeholders[tipoEquipo] || 'Ingrese la marca');
}

function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 10) {
        value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '+$1 $2 $3 $4');
    }
    input.value = value;
}

function formatDocumentNumber(input) {
    // Remove non-alphanumeric characters
    input.value = input.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

function generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `TR${year}${month}${day}${random}`;
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

// Utility functions
function resetForm() {
    $('#servicioForm')[0].reset();
    $('.is-valid, .is-invalid').removeClass('is-valid is-invalid');
    $('#previewFotos').empty();
}

function disableForm() {
    $('#servicioForm input, #servicioForm textarea, #servicioForm select, #servicioForm button').prop('disabled', true);
}

function enableForm() {
    $('#servicioForm input, #servicioForm textarea, #servicioForm select, #servicioForm button').prop('disabled', false);
}