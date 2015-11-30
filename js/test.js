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

  $('#slider-flows').on('slidechange', function() {
    $('#test-slider-flows-min').html(
      $('#slider-flows').slider('values', 0)
    )

    $('#test-slider-flows-max').html(
      $('#slider-flows').slider('values', 1)
    )
  }).trigger('slidechange')

  $('#slider-dataVolume').on('slidechange', function() {
    $('#test-dataVolume-min').html(
      $('#slider-dataVolume').slider('values', 0)
    )
    $('#test-dataVolume-max').html(
      $('#slider-dataVolume').slider('values', 1)
    )
  }).trigger('slidechange')

  $('#slider-nodeSize').on('slidechange', function() {
    $('#test-slider-nodeSize').html(
      $('#slider-nodeSize').slider('value')
    )
  }).trigger('slidechange')

  $('#button-order-prefix').click(function() {
    $('#test-button-order-prefix').html('bum')
  })

  $('#button-balance').click(function() {
    $('#test-button-balance').html('BUM')
  })

})
