var comentarios = {
	pagina:0,
	rows:0,
	buscar:''
};

$(document).ready(function() {
	$('#asignatura').selectmenu({
		change: function() {
			var id = $('#asignatura').val();
			if (id > 0) $('#botones_top').fadeIn();
			else $('#botones_top').fadeOut();
			$('.seccion').hide();
		}
	});
	$('#guardar').click(function() {
		document.getElementById('profesorForm').submit();
	});
	$('#preguntas_boton').click(function() {
		var id = parseInt($('#asignatura').val());
		if (id <= 0) {
			mensajes.alerta('Selecciona una asignatura');
			return false;
		}
		$('.seccion').hide();
		$('#cargando').show();
		$.ajax({
			url: PROFESOR_CONTROLLER,
			data: 'task=getAsignaturas&asignatura='+id,
			type: 'post',
			dataType: 'json',
			success: onLoadAsignaturas
		});
		return false;
	});
	$('#comentarios_boton').click(function() {
		var id = parseInt($('#asignatura').val());
		if (id <= 0) {
			mensajes.alerta('Selecciona una asignatura');
			return false;
		}
		$('#comentarios_buscar').val('');
		$('#desde').val(desde_default);
		$('#hasta').val(hasta_default);
		cargarComentarios();
		return false;
	});
	$('#pagina_anterior').click(function() {
		var start = (comentarios.pagina-2)*comentarios.rows;
		cargarComentarios('start='+start);
	});
	$('#pagina_siguiente').click(function() {
		var start = comentarios.pagina*comentarios.rows;
		cargarComentarios('start='+start);
	});
	$('#comentarios_buscar, #desde, #hasta').keyup(function(e) {
		if (e.which === 13) {
			cargarComentarios();
		}
	});
	$('#comentarios_buscar_boton').click(function() {
		cargarComentarios();
	});
});

function cargarComentarios(params) {
	$('.seccion').hide();
	$('#comentarios_data').hide();
	$('#comentarios_div').show();
	$('#cargando').show();
	var asignatura = $('#asignatura').val();
	var desde = $('#desde').val();
	var hasta = $('#hasta').val();
	var buscar = encodeURIComponent($('#comentarios_buscar').val());
	$.ajax({
		url: PROFESOR_CONTROLLER,
		data: 'task=getComentarios&'+params+'&asignatura='+asignatura+'&desde='+desde+'&hasta='+hasta+'&buscar='+buscar,
		type: 'post',
		dataType: 'json',
		success: onLoadComentarios
	});
}

function onLoadAsignaturas(data) {
	var def = !(data.length>0) || !data[0].id;
	var html = '';
	for (var i=0; i<data.length; i++) {
		html += '<div>Pregunta '+(i+1)+' <input style="width:650px" type="text" value="'+data[i].pregunta+'" name="pregunta_'+(data[i].id?data[i].id:(i+1))+'" /></div>';
	}
	$('#def').val(def ? 1 : 0);
	$('#preguntas').html(html);
	$('#preguntas input').addClass('ui-widget ui-state-default ui-corner-all');
	$('.seccion').hide();
	$('#preguntas_div').fadeIn();
}

function onLoadComentarios(data) {
	var start = data.response.start;
	var numFound = data.response.numFound;
	comentarios.rows = data.responseHeader.params.rows;
	var len = data.response.docs.length;
	var doc;
	var paginas = Math.ceil(numFound/comentarios.rows);
	comentarios.pagina = (start/comentarios.rows)+1;
	
	if (comentarios.pagina > 1) $('#pagina_anterior').show();
	else $('#pagina_anterior').hide();
	if (comentarios.pagina < paginas) $('#pagina_siguiente').show();
	else $('#pagina_siguiente').hide();
	
	$('#comentarios_encontrados').html(numFound);
	$('#comentarios_pagina').html(comentarios.pagina);
	$('#comentarios_paginas').html(paginas);
	
	$('#comentarios_comentarios').html('');
	for (var i=0; i<len; i++) {
		doc = data.response.docs[i];
		$('#comentarios_comentarios').append('<div class="comentario">'+doc.comentario+'</div>');
	}
	$('#cargando').hide();
	$('#comentarios_data').fadeIn();
}