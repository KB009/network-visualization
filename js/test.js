$(document).ready(function() {

  // $('#div-radiobutton-display input, #div-radiobutton-node input').on('change', function() {
  //   $('#test-' + $(this).parent().attr('id')).html(
  //     $(this).next().html()
  //   )
  // }).each(function() {
  //   if(this.checked) {
  //     $(this).trigger('change')
  //   }
  // })

  // $('#checkbox-mapto input').change(function() {
  //   var mapTo = ""
  //   $('#checkbox-mapto input').each(function(i) {
  //     if(this.checked) {
  //       mapTo += $(this).next().html() + " "
  //     }
  //   })
  //   $('#test-' + $(this).parent().attr('id')).html(mapTo)
  // }).trigger('change')


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
    // 
    Menu.setMapColorTo('volume');
    Menu.setMapNodeTo('domainName');
    Menu.setMapTo(['links', 'nodes']);
  })


$('#menu').on('menuUpdate', function(e) {
  // console.log("Jsem v menuUpdate event", e.detail);

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

    case 'mapColorTo':
      $('#test-div-radiobutton-display').html( Menu.getMapColorTo() )
      break;

    case 'mapNodeTo':
      $('#test-div-radiobutton-node').html( Menu.getMapNodeTo() )
      break;

    case 'mapTo':
      $('#test-checkbox-mapto').html( Menu.getMapTo() );
      break;

    case 'init':
      $('#test-div-radiobutton-display').html( Menu.getMapColorTo() )
      $('#test-div-radiobutton-node').html( Menu.getMapNodeTo() )
      $('#test-checkbox-mapto').html( Menu.getMapTo() );
  
      $('#test-slider-flows-min').html( Menu.getMinFlowNum() )
      $('#test-slider-flows-max').html( Menu.getMaxFlowNum() )
      $('#test-dataVolume-min').html( Menu.getMinDataVolume() )
      $('#test-dataVolume-max').html( Menu.getMaxDataVolume() )
      $('#test-slider-nodeSize').html( Menu.getNodeSize() )
      break;
  }    

})

  // INICIALIZACE TEST MENU
  var evt = new CustomEvent('menuUpdate', { detail: 'init'});
  document.getElementById("menu").dispatchEvent(evt);

})
