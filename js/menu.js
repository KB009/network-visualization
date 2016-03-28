/*
    REFACTOR
    * div-radio-button / change name of radio1 and radio2 to color-radio1, color-radio2
    * both radiobuttons / change their name (radio, radio2) to something more meaningful

    TODO
    * zkontrolovat checked u radiobuttonu v js
    * zkontrolovat na co potrebuji checkbox-mapto id
 */

var menuEvent = new CustomEvent('menuUpdate');

// document.getElementById('menu').addEventListener('menuUpdate', function(e) {
//   console.log("Detected event");
// })

var Menu = {
  mapColorTo: "flows", // "flows" / "volume"
  mapNodeTo: "ip", // "ip" / "domainName"
  mapTo: [ "nodes" ], // "nodes" / "links"
  colorScheme: 1,
  minFlowNum: 0, 
  maxFlowNum: 150, 
  minDataVolume: 1, 
  maxDataVolume: 200, 
  nodeSize: 45,

  loadValuesFromJson: function() {

  },

  // -------- MAP COLOR TO  ---------------------------------------------
  setMapColorTo: function(newValue) {
    mapColorTo = newValue;

    if (newValue == 'flows') {
      document.getElementById('radio1').checked = true;
    } else {
      document.getElementById('radio2').checked = true;
    }

    var evt = new CustomEvent('menuUpdate', { detail: 'mapColorTo'});
    document.getElementById("menu").dispatchEvent(evt);
  
    console.log("Jsem v setMapColorTo", newValue);
  },
  getMapColorTo: function() {
    return mapColorTo;
  },

  // -------- MAP NODE TO  ----------------------------------------------
  setMapNodeTo: function(newValue) {
    mapNodeTo = newValue;

    if (newValue == 'ip') {
      document.getElementById('node-radio1').checked = true;
    } else {
      document.getElementById('node-radio2').checked = true;
    }

    console.log("Jsem v setMapNODEto", newValue);

    var evt = new CustomEvent('menuUpdate', { detail: 'mapNodeTo'});
    document.getElementById("menu").dispatchEvent(evt);
  },
  getMapNodeTo: function() {
    return mapNodeTo;
  },

  // ---------- MAP TO -------------------------------------------------
  setMapTo: function(newValue) {
    mapTo = newValue;

    if (mapTo[0] == 'nodes' || mapTo[1] == 'nodes') {
      document.getElementById('check1').checked = true;
    } else {
      document.getElementById('check1').checked = false;
    }

    if (mapTo[0] == 'links' || mapTo[1] == 'links') {
      document.getElementById('check2').checked = true;
    } else {
      document.getElementById('check2').checked = false;
    }

    var evt = new CustomEvent('menuUpdate', { detail: 'mapTo'});
    document.getElementById("menu").dispatchEvent(evt);

    // console.log("Jsem v setMapTo", mapTo, mapTo.length);
  },
  getMapTo: function() {
    return mapTo;
  },


  // --------  COLOR SCHEME ----------------------------------------------
  setColorScheme: function(newValue) {
    colorScheme = newValue;
  },
  getColorScheme: function() {
    return colorScheme;
  },

  // ---------- FLOW NUM -------------------------------------------------
  setFlowNum: function(minValue, maxValue) { // *tested OK
    minFlowNum = minValue;
    maxFlowNum = maxValue;
    // set values of sliders in case the change doesnt come from them
    if ($('#slider-flows').slider('values', 0) != minValue) {
      $('#slider-flows').slider('values', 0, minValue);
      $('#slider-value-flow-min').html(minValue);
    }
    if ($('#slider-flows').slider('values', 1) != maxValue) {
      $('#slider-flows').slider('values', 1, maxValue);
      $('#slider-value-flow-max').html(maxValue);
    }
    
    var evt = new CustomEvent('menuUpdate', { detail: 'flowNum'});
    document.getElementById("menu").dispatchEvent(evt);

    console.log("Changed min/max flow value: ", minFlowNum, maxFlowNum);
  },
  setMinFlowNum: function(minValue) { // *tested OK
    minFlowNum = minValue;
    
    if ($('#slider-flows').slider('values', 0) != minValue) {
      $('#slider-flows').slider('values', 0, minValue);
      $('#slider-value-flow-min').html(minValue);
    }
    
    var evt = new CustomEvent('menuUpdate', { detail: 'flowNum'});
    document.getElementById("menu").dispatchEvent(evt);

    console.log("Changed min flow value: ", minFlowNum);
  },
  getMinFlowNum: function() { // *tested OK
    return minFlowNum;

  },
  setMaxFlowNum: function(maxValue) { // *tested OK
    maxFlowNum = maxValue;

    if ($('#slider-flows').slider('values', 1) != maxValue) {
      $('#slider-flows').slider('values', 1, maxValue);
      $('#slider-value-flow-max').html(maxValue);
    }

    var evt = new CustomEvent('menuUpdate', { detail: 'flowNum'});
    document.getElementById("menu").dispatchEvent(evt);

    console.log("Changed max flow value: ",  maxFlowNum);
  },
  getMaxFlowNum: function() { // *tested OK
    return maxFlowNum;
  },

  // ---------- DATA VOLUME -------------------------------------------------
  setDataVolume: function(minValue, maxValue) { // *tested OK
    minDataVolume = minValue;
    maxDataVolume = maxValue;

    if ($('#slider-dataVolume').slider('values', 0) != minValue) {
      $('#slider-dataVolume').slider('values', 0, minValue);
      $('#slider-value-volume-min').html(minValue);
    }
    if ($('#slider-dataVolume').slider('values', 1) != maxValue) {
      $('#slider-dataVolume').slider('values', 1, maxValue);
      $('#slider-value-volume-max').html(maxValue);
    }
    
    var evt = new CustomEvent('menuUpdate', { detail: 'dataVolume'});
    document.getElementById("menu").dispatchEvent(evt);

    console.log("I've updated data volume to ", minDataVolume, maxDataVolume);
  },
  setMinDataVolume: function(minValue) { // *tested OK
    minDataVolume = minValue;

    if ($('#slider-dataVolume').slider('values', 0) != minValue) {
      $('#slider-dataVolume').slider('values', 0, minValue);
      $('#slider-value-volume-min').html(minValue);
    }

    var evt = new CustomEvent('menuUpdate', { detail: 'dataVolume'});
    document.getElementById("menu").dispatchEvent(evt);

    console.log("I've updated MIN data volume to ", minDataVolume);
  },
  getMinDataVolume: function() { // *tested OK
    return minDataVolume;
  },
  setMaxDataVolume: function(maxValue) { // *tested OK
    maxDataVolume = maxValue;

    if ($('#slider-dataVolume').slider('values', 1) != maxValue) {
      $('#slider-dataVolume').slider('values', 1, maxValue);
      $('#slider-value-volume-max').html(maxValue);
    }

    var evt = new CustomEvent('menuUpdate', { detail: 'dataVolume'});
    document.getElementById("menu").dispatchEvent(evt);

    console.log("I've updated MAX data volume to ", maxDataVolume);
  },
  getMaxDataVolume: function() { // *tested OK
    return maxDataVolume;
  },

  // ---------- NODE SIZE -------------------------------------------------
  setNodeSize: function(newValue) { // *tested OK
    nodeSize = newValue;

    $('#slider-nodeSize').slider('value', newValue);
    $('#slider-value-nodeSize').html( newValue );

    var evt = new CustomEvent('menuUpdate', { detail: 'nodeSize'});
    document.getElementById("menu").dispatchEvent(evt);

    console.log("I've updated node size to ", nodeSize);
  },
  getNodeSize: function() { // *tested OK
    return nodeSize;
  },
}


// ********** Renderovani okna ***************
Menu.render = function() {

  // var menuwrapper = $('<div/>', {''})
  var menuwrapper = $('<div/>', { 'id':'topmenu'});


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
      'value':0,  // Pocty toku
      'checked':'checked'
    }))
    .append($('<label/>', { 'for':'radio1'}).html("Počty toků"))
    .append($('<br>'))
    .append($('<input/>', {
      'type':'radio',
      'name':'radio',
      'id':'radio2',
      'value':1 // Objem dat
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
      'value':2,
      'checked':'checked'
    }))
    .append($('<label/>', { 'for':'node-radio1'}).html("IP adresy"))
    .append($('<br>'))
    .append($('<input/>', {
      'type':'radio',
      'name':'radio2',
      'id':'node-radio2', 
      'value':3
    }))
    .append($('<label/>', { 'for':'node-radio2'}).html("Doménové jméno"));

  var column1 = $('<div/>', { 'class':'column' }).css({
    'margin-left': "2%",
    'margin-right': "-5%"
  });

  $(column1).append(radioDisplay).append(radioNode);

  // CHECKBOX / Mapuje se na uzly/spojnice
  var column2 = $('<div/>', {
    'class':'column buttonset',
    'id':'checkbox-mapto',
  }).css({ 'margin-right': '-5%' })
    .append($('<h2/>').html("Mapovat na"))
    .append($('<input/>', {
      'type':'checkbox',
      'id':'check1',
      'name':'check',
      'checked':'checked'
    }))
    .append($('<label/>', { 'for':'check1' }).html("Uzly"))
    .append($('<br>'))
    .append($('<input/>', {
      'type':'checkbox',
      'name':'check',
      'id':'check2'
    }))
    .append($('<label/>', { 'for':'check2' }).html("Spojnice"))
    .append($('<br>'));

  // COLOR SCHEMES
  var column3 = $('<div/>', {
      'class':'column',
      'id':'colorSchemes'
    }).append($('<h2/>').html("Barevné škály"))
      .append($('<button/>', { 'id':'customColor' }).html("Vlastní..."));

  // SLIDER / Filtruj min/max pocet toku
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
// **********************************************************************


$(document).ready(function() {

  var menu = {
    "map-color-to": "flows",
    "map-node-to" : "ip",
    "mapTo" : "nodes",
    "color-scheme" : 1,
    "min-num-of-flows" : 0,
    "max-num-of-flows" : 150,
    "min-data-volume" : 1,
    "max-data-volume" : 200,
    "node-size" : 45
  }

  for (var i in menu) {
      console.log(menu.mapTo);
      console.log(menu[i]);
    }

// ------- WORKS JUST FINE -------
//   $.getJSON('menu.json', function(data) {
//     console.log("jsem tu");
//     for (var i in data) {
//       console.log(data.mapTo);
//       console.log(data[i]);
//     }
// });  

  


  // $('#column1').prepend(Menu.render())
  // 
  // $('#menu').prepand
  $('#menu').append(Menu.render())
  $('#menu').append(Menu.pin());



  $('#customColor').button();
  $('#button-prefix-order').button();
  $('#button-balance').button();
  $('#button-pin').button();
  $('#Pum').button();




  // ********* R A D I O / Map COLOR to **********
  var rad = document.getElementsByName('radio');

  for (var i = 0; i < rad.length; i++) {
    rad[i].onclick = function() {
      // console.log("Jsem uvnitr", this.value);

      if (this.value == 0) {
        Menu.setMapColorTo("flows");
      }
      if (this.value == 1) {
        Menu.setMapColorTo("volume");
      }
    }
  }

  // ********* R A D I O / Map NODE to **********
  rad = document.getElementsByName('radio2');

  for (var i = 0; i < rad.length; i++) {
    rad[i].onclick = function() {
      // console.log("Jsem uvnitr", this.value);
      
      if (this.value == 2) {
        Menu.setMapNodeTo("ip");
      }
      if (this.value == 3) {
        Menu.setMapNodeTo("domainName");
      }
    }
  }  

  // ********** C H E C K  / Map to **************
  var checkOpt = document.getElementsByName('check');

  for (var i = 0; i < checkOpt.length; i++) {
    checkOpt[i].onclick = function() {
      var toNodes = document.getElementById('check1');
      var toLinks = document.getElementById('check2');

      var arg = [];

      if (toNodes.checked) {
        arg.push('nodes');
      }
      if (toLinks.checked) {
        arg.push('links');
      }

      Menu.setMapTo(arg);
    }
  }
  // console.log(checkOpt);

  // ********** S L I D E R / Flow num ***********
  $('#slider-flows').slider({
    max: 150,
    range: true,
    values: [ 0, 150 ],
    slide: function( event, ui ) {
      // $('#slider-value-flow-min').html(ui.values[0]);
      // $('#slider-value-flow-max').html(ui.values[1]);
      Menu.setFlowNum(ui.values[0], ui.values[1]);

      // Menu.setMinFlowNum(ui.values[0]);
      // Menu.setMaxFlowNum(ui.values[1]);
    }
  });
  $('#slider-value-flow-min').html(
    $('#slider-flows').slider('values', 0)
  );
  $('#slider-value-flow-max').html(
    $('#slider-flows').slider('values', 1)
  )

  // ********* S L I D E R / Data Volume **********
  $('#slider-dataVolume').slider({
    max: 200,
    range: true,
    values: [ 1, 200 ],
    slide: function( event, ui ) {
      Menu.setDataVolume(ui.values[0], ui.values[1]);
    }
  });
  $('#slider-value-volume-min').html(  // volume vs dataVolume - sjednotit!
    $('#slider-dataVolume').slider('values', 0)
  );
  $('#slider-value-volume-max').html(
    $('#slider-dataVolume').slider('values', 1)
  )

  // ********* S L I D E R / Node size **********
  $('#slider-nodeSize').slider({
    value: 45,
    min: 10,
    max: 70,
    slide: function( event, ui ) {
      Menu.setNodeSize(ui.value);
    }

  });
  // display init value
  $('#slider-value-nodeSize').html(
      $('#slider-nodeSize').slider('value')
   );




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


})

// $(function() {
  // $('#radiobutton-display').buttonset();
  // $('#radiobutton-node').buttonset();
  // $('#checkbox-mapto').buttonset();
// });

// ------ SLIDERS ---------


// function pucButton() {
//     console.log("puc");
//     Menu.setFlowNum(10, 100);
//   }
// POKUS / nastavit hodnoty slideru externe
// $("#button-balance").on('click', pucButton);
// $("#button-balance").click(function() {
//     console.log("puc");
//     Menu.setFlowNum(10, 100);
//   });

//
// // Getter
// var max = $( '.selector' ).slider( 'option', 'max' );
//
// // Setter
// $( '.selector' ).slider( 'option', 'max', 50 );



