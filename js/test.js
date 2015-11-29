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

})
