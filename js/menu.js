$(function() {
  // $('#radiobutton-display').buttonset();
  // $('#radiobutton-node').buttonset();
  // $('#checkbox-mapto').buttonset();
  $('#customColor').button();
  $('#button-order-prefix').button();
  $('#button-balance').button();
  $('#button-pin').button();
});

// ------ SLIDERS ---------

$(function() {
  $('#slider-flows').slider({
    max: 150,
    range: true,
    values: [ 5, 150 ]
  });
  $('#slider-dataVolume').slider({
    max: 200,
    range: true,
    values: [ 1, 200 ]
  });
  $('#slider-nodeSize').slider({
    value: 45,
    min: 10,
    max: 70
  });
});
//
// // Getter
// var max = $( ".selector" ).slider( "option", "max" );
//
// // Setter
// $( ".selector" ).slider( "option", "max", 50 );

$(function () {
  function runEffect() {
    $("#topmenu").hide("slide", {direction: "up"}, 1000/*, callback*/ );
  };

  /*function callback() {
    setTimeout(function() {
      $("#topmenu").removeAttr( "style" ).hide().fadeIn();
    }, 1000);
  };*/

  $( "#button-pin" ).click(function() {
    runEffect();
    return false;
  });
});
