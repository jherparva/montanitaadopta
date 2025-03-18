$(document).ready(function() {
    $('#payment-method').change(function() {
        $('.payment-info').hide(); // Oculta todas las opciones de pago
        
        const selectedMethod = $(this).val();
        $(`#${selectedMethod}-container`).show(); // Muestra solo la seleccionada
    });
});
