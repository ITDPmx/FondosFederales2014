var legendTitle, legend, graph, circulos, url, geojson, manchas, states,datos, zone, form, manchas, post;
var info = L.control();
$(window).on('load', function() {
	$('#inicio').modal().css('z-index', '100000');
});
$(document).on('ready',function(){
	$.ajax({
		beforeSend:function(){			
			$(function() {
				"use strict";
				var opts = {
					lines: 13, // The number of lines to draw
					length: 11, // The length of each line
					width: 5, // The line thickness
					radius: 17, // The radius of the inner circle
					corners: 1, // Corner roundness (0..1)
					rotate: 0, // The rotation offset
					color: '#fff', // #rgb or #rrggbb
					speed: 1, // Rounds per second
					trail: 60, // Afterglow percentage
					shadow: false, // Whether to render a shadow
					hwaccel: false, // Whether to use hardware acceleration
					className: 'spinner', // The CSS class to assign to the spinner
					zIndex: 1e9, // The z-index (defaults to 2000000000)
					top:'auto', // Top position relative to parent in px
					left: 'auto' // Left position relative to parent in px
				};

				var target = document.createElement("div");
				document.body.appendChild(target);
				var spinner = new Spinner(opts).spin(target);
				var overlay = iosOverlay({
					text: "Cargando",
					spinner: spinner
				});
				window.setTimeout(function() {
					overlay.update({
						icon: "img/check.png",
						text: "Listo!!"
					});
				}, 3e3);

				window.setTimeout(function() {
					overlay.hide();
				}, 3e3);
				return false;
			});
		},
		url: 'js/model/zm.geojson',
		type: 'GET',
		dataType: 'json'
	})
	.done(function(data, status, jqXHR) {

		url = 'js/model/estados.geojson';
		states = new L.GeoJSON.AJAX(url,{style:styleStates,onEachFeature:onEachFeature});
		states.addTo(map);
		//console.log(jqXHR.status);
		//console.log(status);
		datos = data.features;
		$.each(datos, function(index, val) {
			$('#estado').append(
				$('<option></option>')
				.attr('value', val.properties.informacion.lat+','+val.properties.informacion.Long_X)
				.text(val.zm));
			var selectList = $('#estado option');

			selectList.sort(function(a,b) {
			    if (a.text > b.text) return 1;
			    if (a.text < b.text) return -1;
			    else return 0
			})
			$("#estado").empty().append( selectList );
		});
		selectZM(datos);
	})
	.fail(function() {
		console.log("error");
	});

	var map = L.map('map',{doubleClickZoom: true}).setView([24.325523, -102.162815],5);
	var mapBox = L.tileLayer('https://{s}.tiles.mapbox.com/v3/itdpmexico.ig2j36lg/{z}/{x}/{y}.png', {
		attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
			}).addTo(map);
	form = L.DomUtil.get('estado'); 

	map.on('moveend', function (){
		if (map.getZoom() >= 8 && map.hasLayer(manchas)==false) {
					url = 'js/model/zm.geojson';
		manchas = new L.GeoJSON.AJAX(url,{style:styleZM,onEachFeature:onEachFeatureZM});
			manchas.addTo(map);
		}
	});

	function selectZM(valor){
		L.DomEvent.addListener(form, 'change', function (e) {
			L.DomEvent.stopPropagation(e);
			$('option:selected',this).val();
			zone = this.value.split(',');
			map.setView(zone,10);
		});
	}

	function styleStates(feature) {
		return {
			weight: 2,
			opacity: 0.5,
			color: '#444',
			dashArray: '4',
			fillOpacity: 0
		};
	}
	function zoomToFeature(e) {
		map.fitBounds(e.target.getBounds());
	}

	function onEachFeature(feature, layer) {
		layer.on({
			click: zoomToFeature
		});
		//if (feature.properties && feature.properties.NOMBRE || feature.properties.NOMBRE) {
			//layer.bindPopup(feature.properties.NOMBRE);
		//}
	}

	function styleZM(feature) {
		return {
			fillColor: '#19BC9C',
			weight: 2,
			opacity: 0,
			color:'#222C3C',
			dashArray: 1,
			fillOpacity: 0.5
		};
	}

	function highlightFeatureZM(e) {
		var layer = e.target;
		var llPoint = layer.getBounds().getCenter();
		var popup = L.popup()
		    .setLatLng([llPoint.lat,llPoint.lng])
		    .setContent(layer._popupContent)
		    .openOn(map);		
		layer.setStyle({
			fillColor: '#000',
			weight: 1,
			opacity:0.5,
			color:'#000',
			fillOpacity: 0.5
		});
		if (!L.Browser.ie && !L.Browser.opera) {
			layer.bringToFront();
		}
	}

	function zoomToFeatureZM(e) {
		map.fitBounds(e.target.getBounds());
		info.update(e.target.feature);
		prueba(e.target.feature.properties.informacion);
		post = e.target._popupContent;
		$('#shareBtn iframe').remove();
		var tweetBtn = $('<a>Tweet</a>')
			.addClass('twitter-share-button')
			.attr('href', 'http://twitter.com/share')
			.attr('data-url', 'http://mexico.itdp.org/')
			.attr('data-counturl', 'http://mexico.itdp.org/')
			.attr('data-via', 'ITDPmx')
			.attr('data-lang', 'es')
			.attr('data-text', 'Esto invierte la Zona Metropolitana de '+e.target._popupContent);
			$('#shareBtn').append(tweetBtn);
			twttr.widgets.load();
		return e.target._popupContent;
	}

	function resetHighlightZM(e) {
		manchas.resetStyle(e.target);
		//info.update();
	}

	function onEachFeatureZM(feature, layer) {
		layer.on({
			mouseover: highlightFeatureZM,
			mouseout: resetHighlightZM,
			click: zoomToFeatureZM
		});
		if (feature.zm) {
			layer.bindPopup(feature.zm);
			//layer.bindPopup(feature.zm,{offset:new L.Point(0,-6)});
		}
	}

	info.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'prueba');
		this.update();
		return this._div;
	};
	info.update = function (props) {
		if (props) {
			this._div.innerHTML = 
			'<div class="row" style="margin:0;">'+
				'<h3>Zona Metropolitana de <br>' + props.zm + '</h3>'+
				'<ul class="nav nav-pills test">'+
					'<li style="padding:5px;margin:0" class="col-xs-4 col-sm-4 col-md-4"><a href="#">2011</a></li>'+
					'<li style="padding:5px;margin:0" class="col-xs-4 col-sm-4 col-md-4"><a href="#">2012</a></li>'+
					'<li style="padding:5px;margin:0" class="col-xs-4 col-sm-4 col-md-4 active"><a href="#">2013</a></li>'+
					
				'</ul>'+
			'</div>'+
			'<div class="tab-content">'+
				'<div class="row tab-pane" id="2011" style="margin:0;">'+
					'<div class="infrastructure1">'+
						'<div id="bar-1" data-toggle="tooltip" data-placement="top" data-titulo="Ciclistas 2011" title="Ciclistas 2011" data-tipo="Ciclopista2011"></div>'+
						'<div id="bar-2" data-toggle="tooltip" data-placement="top" data-titulo="Peatones 2011" title="Peatones 2011" data-tipo="InfPeaton2011"></div>'+
						'<div id="bar-3" data-toggle="tooltip" data-placement="top" data-titulo="Espacio Público 2011" title="Espacio Público 2011" data-tipo="EPublico2011"></div>'+
						'<div id="bar-4" data-toggle="tooltip" data-placement="top" data-titulo="Transporte Público 2011" title="Transporte Público 2011" data-tipo="TPublico2011"></div>'+
						'<div id="bar-5" data-toggle="tooltip" data-placement="top" data-titulo="Automóviles 2011" title="Automóviles 2011" data-tipo="Auto2011"></div>'+
						'<div id="bar-6" data-toggle="tooltip" data-placement="top" data-titulo="Pavimentacion 2011" title="Pavimentacion 2011" data-tipo="Pavimentacion2011"></div>'+
						'<div class="inversionTotal">'+
							'<p>Inversión Total 2011</p>'+
							'<p id="inversion2011">'+props.properties.informacion.Total2011+'</p>'+
						'</div>'+
					'</div>'+
				'</div>'+
				'<div class="row tab-pane" id="2012" style="margin:0;">'+
					'<div class="infrastructure2">'+
						'<div id="bar-7" data-toggle="tooltip" data-placement="top"  data-titulo="Ciclistas 2012" title="Ciclistas 2012" data-tipo="Ciclopista2012"></div>'+
						'<div id="bar-8" data-toggle="tooltip" data-placement="top"  data-titulo="Peatones 2012" title="Peatones 2012" data-tipo="InfPeaton2012"></div>'+
						'<div id="bar-9" data-toggle="tooltip" data-placement="top"  data-titulo="Espacio Público 2012" title="Espacio Público 2012" data-tipo="EPublico2012"></div>'+
						'<div id="bar-10" data-toggle="tooltip" data-placement="top"  data-titulo="Transporte Público 2012" title="Transporte Público 2012" data-tipo="TPublico2012"></div>'+
						'<div id="bar-11" data-toggle="tooltip" data-placement="top"  data-titulo="Automóviles 2012" title="Automóviles 2012" data-tipo="Auto2012"></div>'+
						'<div id="bar-12" data-toggle="tooltip" data-placement="top"  data-titulo="Pavimentacion 2012" title="Pavimentacion 2012" data-tipo="Pavimentacion2012"></div>'+
						'<div class="inversionTotal">'+
							'<p>Inversión Total 2012</p>'+
							'<p id="inversion2012">'+props.properties.informacion.Total2012+'</p>'+
						'</div>'+
					'</div>'+
				'</div>'+
				'<div class="row tab-pane active" id="2013" style="margin:0;">'+
					'<div class="infrastructure3">'+
						'<div id="bar-13" data-toggle="tooltip" data-placement="top" data-titulo="Ciclistas 2013" title="Ciclistas 2013" data-tipo="Ciclopista2013"></div>'+
						'<div id="bar-14" data-toggle="tooltip" data-placement="top" data-titulo="Peatones 2013" title="Peatones 2013" data-tipo="InfPeaton2013"></div>'+
						'<div id="bar-15" data-toggle="tooltip" data-placement="top" data-titulo="Espacio Público 2013" title="Espacio Público 2013" data-tipo="EPublico2013"></div>'+
						'<div id="bar-16" data-toggle="tooltip" data-placement="top" data-titulo="Transporte Público 2013" title="Transporte Público 2013" data-tipo="TPublico2013"></div>'+
						'<div id="bar-17" data-toggle="tooltip" data-placement="top" data-titulo="Automóviles 2013" title="Automóviles 2013" data-tipo="Auto2013"></div>'+
						'<div id="bar-18" data-toggle="tooltip" data-placement="top" data-titulo="Pavimentacion 2013" title="Pavimentacion 2013" data-tipo="Pavimentacion2013"></div>'+
							'<div class="inversionTotal">'+
							'<p>Inversión Total 2013</p>'+
							'<p id="inversion2013">'+props.properties.informacion.Total2013+'</p>'+
						'</div>'+
					'</div>'+
				'</div>'+


			'</div>'
		}
	};
	info.addTo(map);
	function prueba(e){
		$('#inversion2011').currency({region: 'MXN'});
		$('#inversion2012').currency({region: 'MXN'});
		$('#inversion2013').currency({region: 'MXN'});
		$('#bar-1').jqbar({label: '<span class="itdp-riding"></span>',value: e.Ciclopista2011, barColor: '#1E3B42',barWidth:20});
		$('#bar-2').jqbar({label: '<span class="itdp-person16"></span>',value: e.InfPeaton2011, barColor: '#1E3B42',barWidth:20});
		$('#bar-3').jqbar({label: '<span class="itdp-tree7"></span>',value: e.EPublico2011, barColor: '#1E3B42',barWidth:20});
		$('#bar-4').jqbar({label: '<span class="itdp-bus21"></span>',value: e.TPublico2011, barColor: '#1E3B42',barWidth:20});
		$('#bar-5').jqbar({label: '<span class="itdp-car69"></span>',value: e.Auto2011, barColor: '#1E3B42',barWidth:20});
		$('#bar-6').jqbar({label: '<span class="itdp-road16"></span>',value: e.Pavimentacion2011, barColor: '#1E3B42',barWidth:20});
		$('#bar-7').jqbar({label: '<span class="itdp-riding"></span>',value: e.Ciclopista2012, barColor: '#1E3B42',barWidth:20});
		$('#bar-8').jqbar({label: '<span class="itdp-person16"></span>',value: e.InfPeaton2012, barColor: '#1E3B42',barWidth:20});
		$('#bar-9').jqbar({label: '<span class="itdp-tree7"></span>',value: e.EPublico2012, barColor: '#1E3B42',barWidth:20});
		$('#bar-10').jqbar({label: '<span class="itdp-bus21"></span>',value: e.TPublico2012, barColor: '#1E3B42',barWidth:20});
		$('#bar-11').jqbar({label: '<span class="itdp-car69"></span>',value: e.Auto2012, barColor: '#1E3B42',barWidth:20});
		$('#bar-12').jqbar({label: '<span class="itdp-road16"></span>',value: e.Pavimentacion2012, barColor: '#1E3B42',barWidth:20});
		$('#bar-13').jqbar({label: '<span class="itdp-riding"></span>',value: e.Ciclopista2013, barColor: '#1E3B42',barWidth:20});
		$('#bar-14').jqbar({label: '<span class="itdp-person16"></span>',value: e.InfPeaton2013, barColor: '#1E3B42',barWidth:20});
		$('#bar-15').jqbar({label: '<span class="itdp-tree7"></span>',value: e.EPublico2013, barColor: '#1E3B42',barWidth:20});
		$('#bar-16').jqbar({label: '<span class="itdp-bus21"></span>',value: e.TPublico2013, barColor: '#1E3B42',barWidth:20});
		$('#bar-17').jqbar({label: '<span class="itdp-car69"></span>',value: e.Auto2013, barColor: '#1E3B42',barWidth:20});
		$('#bar-18').jqbar({label: '<span class="itdp-road16"></span>',value: e.Pavimentacion2013, barColor: '#1E3B42',barWidth:20});
	}

	$('body').on('click','.test li',function(e){
		e.preventDefault();
		year = this.childNodes[0].text;
		$('.active').removeClass('active');
		$(this).addClass('active');
		if (year === "2011") {
			$('div#2011').addClass('active');
			$('div#2012').removeClass('active');
			$('div#2013').removeClass('active');
		}
		if (year === "2012") {
			$('div#2012').addClass('active');
			$('div#2011').removeClass('active');
			$('div#2013').removeClass('active');
		}
		if (year === "2013") {
			$('div#2013').addClass('active');
			$('div#2012').removeClass('active');
			$('div#2011').removeClass('active');
		}
	});

	$("body").tooltip({ selector: '[data-toggle=tooltip]' });

	$('body').on('click','.horizontal',function(e){
		e.preventDefault();
		var tituloLeyenda = this.dataset.titulo;
		var datoTwitter = tituloLeyenda.split(' ');
		var tipo = this.dataset.tipo;
		var texto;
		if (tituloLeyenda == "Transporte Público 2011" | tituloLeyenda == "Transporte Público 2012" | tituloLeyenda == "Transporte Público 2013") {
			texto = 'Esto invirtió la Zona Metropolitana de '+post+ ' en '+datoTwitter[0]+" "+datoTwitter[1]+' en el año '+datoTwitter[2];
		}
		else{
			texto = 'Esto invirtió la Zona Metropolitana de '+post+ ' en '+datoTwitter[0]+' en el año '+datoTwitter[1];
		}

		$('#shareBtn iframe').remove();
		var tweetBtn = $('<a>Tweet</a>')
			.addClass('twitter-share-button')
			.attr('href', 'http://twitter.com/share')
			.attr('data-url', 'http://mexico.itdp.org/')
			.attr('data-counturl', 'http://mexico.itdp.org/')
			.attr('data-via', 'ITDPmx')
			.attr('data-lang', 'es')
			.attr('data-text', texto);
			$('#shareBtn').append(tweetBtn);
			twttr.widgets.load();


		legendInfo(tituloLeyenda);
		$('.muActive').removeClass('muActive');
		$(this).addClass('muActive');
		function cambiaColor(){
			return function(){
				map.removeLayer(manchas);
				manchas = new L.GeoJSON.AJAX(url,{style:styleIn,onEachFeature:onEachFeatureZM}).addTo(map);
				map.addLayer(manchas);
			}
		}
		function styleIn(feature) {
			var age = tipo;
			var primero = feature.properties.informacion;
			var segundo = primero[age];
			return {
				fillColor: getColorIV(segundo),
				fillOpacity: 0.75,
				opacity: 1,
				weight: 1,
				color:'black'
			};
		}
		function getColorIV(iv) {
			return	iv > 60  ? '#E63629':
					iv > 40  ? '#E84E3D':
					iv > 20  ? '#FF8069':
					iv > 5   ? '#E8A18F':
							   '#FFD4C4';
		}
		function legendInfo(tituloLeyenda){
			if (legend != undefined) {
		    	legend.removeFrom(map);
		    }
			legend = L.control({position: 'bottomright'});

			legend.onAdd = function (map) {
			    var div = L.DomUtil.create('div', 'info legend'),
			        grades = [0, 5, 20, 40, 60],
			        labels = [];
			        div.innerHTML ='<h5><strong>'+tituloLeyenda+'</strong></h5>';
			    // loop through our density intervals and generate a label with a colored square for each interval
			    for (var i = 0; i < grades.length; i++) {	
			        div.innerHTML +=
			            '<i style="background:' + getColorIV(grades[i] + 2) + '"></i><small> ' +
			            grades[i] + (grades[i + 1] ? ' % &ndash; ' + grades[i + 1] + ' %<br>' : ' %+</small>');
			    }
			    return div;
			};
			legend.addTo(map);
		};
		cambiaColor(tipo)();
	});
});