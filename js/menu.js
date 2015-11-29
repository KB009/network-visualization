$(document).ready(function() {
  $('#customColor').button();
  $('#button-order-prefix').button();
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
