/*
    REFACTOR
    * div-radio-button / change name of radio1 and radio2 to color-radio1, color-radio2
    * both radiobuttons / change their name (radio, radio2) to something more meaningful

    TODO
    * zkontrolovat checked u radiobuttonu v js
    * zkontrolovat na co potrebuji checkbox-mapto id
 */

var Menu = {}
Menu.render = function() {

  var menuwrapper = $('<div/>', { 'id':'topmenu2'});

  // RADIOBUTTON / Barva
  var radioDisplay = $('<div/>', {
    'id':'div-radiobutton-display',
    'title':'Barva',
    'class':'buttonset'
  }).append($('<h2/>').html("Barva"))
    .append($('<input/>', {
      'type':'radio',
      'name':'radio',
      'id':'radio1',
      'checked':'checked'
    }))
    .append($('<label/>', { 'for':'radio1'}).html("Počty toků"))
    .append($('<br>'))
    .append($('<input/>', {
      'type':'radio',
      'name':'radio',
      'id':'radio2'
    }))
    .append($('<label/>', { 'for':'radio2'}).html("Objem dat"));

  // RADIOBUTTON / Uzel zobrazuje IP/domenove jmeno
  var radioNode = $('<div/>', {
    'id':'div-radiobutton-node',
    'title':'Uzel',
    'class':'buttonset'
  }).append($('<h2/>').html("Uzel"))
    .append($('<input/>', {
      'type':'radio',
      'name':'radio2',
      'id':'node-radio1',
      'checked':'checked'
    }))
    .append($('<label/>', { 'for':'node-radio1'}).html("IP adresy"))
    .append($('<br>'))
    .append($('<input/>', {
      'type':'radio',
      'name':'radio2',
      'id':'node-radio2'
    }))
    .append($('<label/>', { 'for':'node-radio2'}).html("Doménové jméno"));

  var column1 = $('<div/>', { 'class':'column' }).css({
    'margin-left': "2%",
    'margin-right': "-5%"
  });

  $(column1).append(radioDisplay).append(radioNode);


  var column2 = $('<div/>', {
    'class':'column buttonset',
    'id':'checkbox-mapto',
  }).css({ 'margin-right': '-5%' })
    .append($('<h2/>').html("Mapovat na"))
    .append($('<input/>', {
      'type':'checkbox',
      'id':'check1',
      'checked':'checked'
    }))
    .append($('<label/>', { 'for':'check1' }).html("Uzly"))
    .append($('<br>'))
    .append($('<input/>', {
      'type':'checkbox',
      'id':'check2'
    }))
    .append($('<label/>', { 'for':'check2' }).html("Spojnice"))
    .append($('<br>'));


  var column3 = $('<div/>', {
      'class':'column',
      'id':'colorSchemes'
    }).append($('<h2/>').html("Barevné škály"))
      .append($('<button/>', { 'id':'customColor' }).html("Vlastní..."));


  var sliders1 = $('<div/>', { 'class':'slider-column' })
    .append($('<h2/>').html("Filtrovat"))
    .append($('<div/>', { 'id':'div-flows' })
      .append($('<h3/>').html("Počty toků"))
      .append($('<div/>', { 'class':"slider-wrapper"})
        .append($('<span/>', { 'id':'slider-value-flow-min' }))
        .append($('<div/>', { 'id':'slider-flows', 'class':'slider'}))
        .append($('<span/>', { 'id':'slider-value-flow-max'}))
      )
    ).append($('<div/>')
        .append($('<h3/>').html("Objem dat:"))
        .append($('<div/>', { 'class':'slider-wrapper' })
          .append($('<span/>', { 'id':'slider-value-volume-min' }))
          .append($('<div/>', { 'id':'slider-dataVolume', 'class':'slider' }))
          .append($('<span/>', { 'id':'slider-value-volume-max' }))
        )
      )
    
  var nodeSize = $('<div/>', { 'class':'slider-column' })
    .append($('<h2/>').html("Velikost uzlů:"))
    .append($('<h3/>').html(" &nbsp "))
    .append($('<div/>', { 'class':'slider-wrapper' })
      .append($('<div/>', { 'id':'slider-nodeSize', 'class':'slider' }))
      .append($('<span/>', { 'id':'slider-value-nodeSize' }))
      )

  var column4 = $('<div/>', { 'class':'column' }).css({ 'width':'29%' })
    .append(sliders1).append(nodeSize);


  var column5 = $('<div/>', {
    'id':'div-button-prefix-order',
    'class':'column'
  }).append($('<button/>', { 'id':'button-prefix-order' }).html("Seřadit podle prefixu"))
    .append($('<br>'))
    .append($('<button/>', { 'id':'button-balance' }).html("Vyvážit"))
    .append($('<br>'));

  // })

  $(menuwrapper).append(column1).append(column2).append(column3).append(column4).append(column5);
  return menuwrapper;
}


Menu.pin = function() {
  var pinButton = $('<div/>', { 'id':'div-button-pin' })
    .append($('<button/>', { 'id':'button-pin' }).html("Pin"));

  return pinButton;
}

$(document).ready(function() {
  // $('#column1').prepend(Menu.render())
  $('#topmenu').prepend(Menu.render())
  $('#menu').append(Menu.pin());

  $('#customColor').button();
  $('#button-prefix-order').button();
  $('#button-balance').button();
  $('#button-pin').button();
  $('#Pum').button();

  // Filtrovat
  $('#slider-flows').slider({
    max: 150,
    range: true,
    values: [ 0, 150 ],
    slide: function( event, ui ) {
      $('#slider-value-flow-min').html(ui.values[0]);
      $('#slider-value-flow-max').html(ui.values[1]);
    }
  });
  $('#slider-value-flow-min').html(
    $('#slider-flows').slider('values', 0)
  );
  $('#slider-value-flow-max').html(
    $('#slider-flows').slider('values', 1)
  )

  $('#slider-dataVolume').slider({
    max: 200,
    range: true,
    values: [ 1, 200 ],
    slide: function( event, ui ) {
      $('#slider-value-volume-min').html(ui.values[0]);
      $('#slider-value-volume-max').html(ui.values[1]);
    }
  });
  $('#slider-value-volume-min').html(  // volume vs dataVolume - sjednotit!
    $('#slider-dataVolume').slider('values', 0)
  );
  $('#slider-value-volume-max').html(
    $('#slider-dataVolume').slider('values', 1)
  )

  // Velikost uzlu
  $('#slider-nodeSize').slider({
    value: 45,
    min: 10,
    max: 70,
    slide: function( event, ui ) {
      console.debug(ui)
      $( '#slider-value-nodeSize' ).html( ui.value );
    }

  });
  // display init value
  $('#slider-value-nodeSize').html(
      $('#slider-nodeSize').slider('value')
   );


})

// $(function() {
  // $('#radiobutton-display').buttonset();
  // $('#radiobutton-node').buttonset();
  // $('#checkbox-mapto').buttonset();
// });

// ------ SLIDERS ---------

$('#slider-value-flow-min').val(5);

$(function() {
});

//
// $('.menu').ready(function() {
//   alert('Menu loaded!');
//
// });

/*  POKUSY NA NASTAVENI INICIALNI HODNOTY
$( '#slider-nodeSize' ).on( 'slidecreate', function( event, ui ) {
  $( '#slider-value-nodeSize' ).html( ui.value );
} );

$( '#slider-value-nodeSize' ).html(  $('#slider-nodeSize').slider('value') );

$( '#div-flows').onLoad(function() {
  alert('ha');
  $('#slider-value-nodeSize').html(function() {
    $('#slider-nodeSize').slider('option', 'max');
  });
});
*/

//
// // Getter
// var max = $( '.selector' ).slider( 'option', 'max' );
//
// // Setter
// $( '.selector' ).slider( 'option', 'max', 50 );

$(function () {
  function runEffect() {
    // $('#topmenu').hide('slide', {direction: 'up'}, 1000, callback );
    $('#topmenu').slideToggle();
  };

  function callback() {
    setTimeout(function() {
      $('#topmenu').removeAttr( 'style' ).hide().fadeIn();
    }, 1000);
  };

  $( '#button-pin' ).click(function() {
    runEffect();
    return false;
  });
});

/*
$('#div-radiobutton-display').click(  function() {
  // alert('ha');
  alert('Value: ' + $('input[name=radio]:checked', '#menu-form').val());
});

var val = $('#slider-nodeSize').slider({
  change: function(event, ui) {
          // alert(ui.value);
      }
    });

$('#button-balance').click(function(event) {
  console.log('clicked: ' + event.target);
}) ;
*/
