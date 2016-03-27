$(document).ready(function() {

  $('#div-radiobutton-display input, #div-radiobutton-node input').on('change', function() {
    $('#test-' + $(this).parent().attr('id')).html(
      $(this).next().html()
    )
  }).each(function() {
    if(this.checked) {
      $(this).trigger('change')
    }
  })

  $('#checkbox-mapto input').change(function() {
    var mapTo = ""
    $('#checkbox-mapto input').each(function(i) {
      if(this.checked) {
        mapTo += $(this).next().html() + " "
      }
    })
    $('#test-' + $(this).parent().attr('id')).html(mapTo)
  }).trigger('change')


  // POKUS REAKCE NA CUSTOM EVENT MENUUPDATE
  // $('#slider-flows').on('menuUpdate', function(e) {
  //   console.log("Som tu");
  //   if (e.detail == 'flowNum') {
  //     $('#test-slider-flows-min').html(
  //       $('#slider-flows').slider('values', 0)
  //       )
  //     $('#test-slider-flows-max').html(
  //       $('#slider-flows').slider('values', 1)
  //     )
  //     console.log("Pum");
  //   }
  // })

  // $('#slider-flows').on('slidechange', function() {
  //   $('#test-slider-flows-min').html(
  //     $('#slider-flows').slider('values', 0)
  //   )

  //   $('#test-slider-flows-max').html(
  //     $('#slider-flows').slider('values', 1)
  //   )
  // }).trigger('slidechange')

  // ***** TRACK DATA VOLUME CHANGE *****
  // $('#slider-dataVolume').on('slidechange', function() {
  //   $('#test-dataVolume-min').html(
  //     $('#slider-dataVolume').slider('values', 0)
  //   )
  //   $('#test-dataVolume-max').html(
  //     $('#slider-dataVolume').slider('values', 1)
  //   )
  // }).trigger('slidechange')
  
  // ***** TRACK NODE SIZE CHANGE *****
  // $('#slider-nodeSize').on('slidechange', function() {
  //   $('#test-slider-nodeSize').html(
  //     $('#slider-nodeSize').slider('value')
  //   )
  // }).trigger('slidechange')

  $('#button-prefix-order').click(function() {
    $('#test-button-order-prefix').html('bum')
  })

  $('#button-balance').click(function() {
    $('#test-button-balance').html('BUM');
    console.log("puc");
    Menu.setFlowNum(10, 100);
    Menu.setDataVolume(33, 133);
    // console.log(Menu.getMinFlowNum());
  })




// Proc tady nemuzu pristoupit k Menu
$('#menu').on('menuUpdate', function(e) {
  console.log("Jsem v menuUpdate event", e.detail);

  switch(e.detail) {
    case 'flowNum':
      $('#test-slider-flows-min').html( Menu.getMinFlowNum() )
      $('#test-slider-flows-max').html( Menu.getMaxFlowNum() )
      break;

    case 'dataVolume':
      $('#test-dataVolume-min').html( Menu.getMinDataVolume() )
      $('#test-dataVolume-max').html( Menu.getMaxDataVolume() )
      break;

    case 'nodeSize':
      $('#test-slider-nodeSize').html( Menu.getNodeSize() )
      break;

    

  }
  // if (e.detail == 'flowNum') {
  //     $('#test-slider-flows-min').html(
  //       $('#slider-flows').slider('values', 0)
  //       // Menu.getMinFlowNum();
  //       )
  //     $('#test-slider-flows-max').html(
  //       $('#slider-flows').slider('values', 1)
  //     )
  //     console.log("Pum");
  //   }

  // $('#test-slider-flows-min').html(
  //     $('#slider-flows').slider('values', 0)
  //   )

  //   $('#test-slider-flows-max').html(
  //     $('#slider-flows').slider('values', 1)
  //   )
}) 

})
