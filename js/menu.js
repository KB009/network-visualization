/*
    REFACTOR
    * div-radio-button / change name of radio1 and radio2 to color-radio1, color-radio2
    * both radiobuttons / change their name (radio, radio2) to something more meaningful

    TODO
    * zkontrolovat checked u radiobuttonu v js
    * zkontrolovat na co potrebuji checkbox-mapto id
 */


// ------- WORKS JUST FINE -------
// 
var jsonMenu;
$.getJSON('menu.json', function(data) {
  jsonMenu = data;
  // for (var i in jsonMenu) {
  //   console.log(jsonMenu[i]);
  // }
  
  // init test display
  // var evt = new CustomEvent('menuUpdate', { detail: 'init'});
  // document.getElementById("menu").dispatchEvent(evt);
});

var Menu = {
  // mapColorTo: "flows", // "flows" / "volume"
  // mapNodeTo: "ip", // "ip" / "domainName"
  // mapTo: [ "nodes" ], // "nodes" / "links"
  // colorScheme: 1,
  // minFlowNum: 0, 
  // maxFlowNum: 150, 
  // minDataVolume: 1, 
  // maxDataVolume: 200, 
  // nodeSize: 45,

  // loadValuesFromJson: function() {  // init
    // TO DO 
  // },

  // -------- MAP COLOR TO  ---------------------------------------------
  setMapColorTo: function(newValue) {
    jsonMenu.mapColorTo = newValue;

    if (newValue == 'flows') {
      document.getElementById('radio1').checked = true;
    } else {
      document.getElementById('radio2').checked = true;
    }

    var evt = new CustomEvent('menuUpdate', { detail: 'mapColorTo'});
    document.getElementById("menu").dispatchEvent(evt);
  
    console.log("Jsem v setMapColorTo", jsonMenu.mapColorTo);
  },
  getMapColorTo: function() {
    return jsonMenu.mapColorTo;
  },

  // -------- MAP NODE TO  ----------------------------------------------
  setMapNodeTo: function(newValue) {
    jsonMenu.mapNodeTo = newValue;

    if (newValue == 'ip') {
      document.getElementById('node-radio1').checked = true;
    } else {
      document.getElementById('node-radio2').checked = true;
    }

    console.log("Jsem v setMapNODEto", jsonMenu.mapNodeTo);

    var evt = new CustomEvent('menuUpdate', { detail: 'mapNodeTo'});
    document.getElementById("menu").dispatchEvent(evt);
  },
  getMapNodeTo: function() {
    return jsonMenu.mapNodeTo;
  },

  // ---------- MAP TO -------------------------------------------------
  setMapTo: function(newValue) {
    jsonMenu.mapTo = newValue;

    if (newValue[0] == 'nodes' || newValue[1] == 'nodes') {
      document.getElementById('check1').checked = true;
    } else {
      document.getElementById('check1').checked = false;
    }

    if (newValue[0] == 'links' || newValue[1] == 'links') {
      document.getElementById('check2').checked = true;
    } else {
      document.getElementById('check2').checked = false;
    }

    var evt = new CustomEvent('menuUpdate', { detail: 'mapTo'});
    document.getElementById("menu").dispatchEvent(evt);

    // console.log("Jsem v setMapTo",jsonMenu. mapTo, jsonMenu.mapTo.length);
  },
  getMapTo: function() {
    return jsonMenu.mapTo;
  },


  // --------  COLOR SCHEME ----------------------------------------------
  // setColorScheme: function(newValue) {
  //   jsonMenu.colorScheme = newValue;
  // },
  // getColorScheme: function() {
  //   return jsonMenu.colorScheme;
  // },


  // ----- FLOW NUM SLIDER RANGE -----------------------------------------
  /**
   * Sets the range (min, max) of flow num slider. 
   * Should be called before setting display range for new data.
   */
  setFlowNumSliderRange: function( minValue, maxValue ) {
    jsonMenu.minFlowNum = minValue;
    jsonMenu.maxFlowNum = maxValue;

    $('#slider-flows').slider("option", "min", minValue);
    $('#slider-flows').slider("option", "max", maxValue);
    
    if (jsonMenu.minFlowNum > jsonMenu.flowNumDisplayFrom) {
      Menu.setFlowNumDisplayFrom(jsonMenu.minFlowNum);
    }
    if (jsonMenu.minFlowNum > jsonMenu.flowNumDisplayTo) {
      Menu.setFlowNumDisplayTo(jsonMenu.minFlowNum);
    }
    if (jsonMenu.maxFlowNum < jsonMenu.flowNumDisplayFrom) {
      Menu.setFlowNumDisplayFrom(jsonMenu.maxFlowNum);
    }
    if (jsonMenu.maxFlowNum < jsonMenu.flowNumDisplayTo) {
      Menu.setFlowNumDisplayTo(jsonMenu.maxFlowNum);
    }

    // TO DO / Dispatch event?
    var evt = new CustomEvent('menuUpdate', { detail: 'flowNum'});
    document.getElementById("menu").dispatchEvent(evt);

    console.log("Changed flow slider range to: ", jsonMenu.minFlowNum, jsonMenu.maxFlowNum);
  },
  setMinFlowNum: function(minValue) {DO 
    jsonMenu.minFlowNum = minValue;
    
    $('#slider-flows').slider("option", "min", minValue);
    
    if (jsonMenu.minFlowNum > jsonMenu.flowNumDisplayFrom) {
      Menu.setFlowNumDisplayFrom(jsonMenu.minFlowNum);
    }
    if (jsonMenu.minFlowNum > jsonMenu.flowNumDisplayTo) {
      Menu.setFlowNumDisplayTo(jsonMenu.minFlowNum);
    }

    var evt = new CustomEvent('menuUpdate', { detail: 'flowNum'});
    document.getElementById("menu").dispatchEvent(evt);

    console.log("Changed min flow value: ", jsonMenu.minFlowNum);
  },
  getMinFlowNum: function() {
    return jsonMenu.minFlowNum;

  },
  setMaxFlowNum: function(maxValue) { 
    jsonMenu.maxFlowNum = maxValue;

    $('#slider-flows').slider("option", "max", maxValue);

    if (jsonMenu.maxFlowNum < jsonMenu.flowNumDisplayFrom) {
      Menu.setFlowNumDisplayFrom(jsonMenu.maxFlowNum);
    }
    if (jsonMenu.maxFlowNum < jsonMenu.flowNumDisplayTo) {
      Menu.setFlowNumDisplayTo(jsonMenu.maxFlowNum);
    }

    var evt = new CustomEvent('menuUpdate', { detail: 'flowNum'});
    document.getElementById("menu").dispatchEvent(evt);

    console.log("Changed max flow value: ", jsonMenu.maxFlowNum);
  },
  getMaxFlowNum: function() {
    return jsonMenu.maxFlowNum;
  },

  // ----- FLOW NUM DISPLAY RANGE ----------------------------------------
  setFlowNumDisplayRange: function(fromValue, toValue) {
    // check whether fromValue and toValue belong to (min, max) range of the slider
    if (fromValue < jsonMenu.minFlowNum) {
      fromValue = jsonMenu.minFlowNum;
    }
    if (fromValue > jsonMenu.maxFlowNum) {
      fromValue = jsonMenu.maxFlowNum;
    }
    if (toValue < jsonMenu.minFlowNum) {
      toValue = jsonMenu.minFlowNum;
    }
    if (toValue > jsonMenu.maxFlowNum) {
      toValue = jsonMenu.maxFlowNum;
    }

    jsonMenu.flowNumDisplayFrom = fromValue;
    jsonMenu.flowNumDisplayTo = toValue;

    // set values of sliders in case the change doesnt come from them
    if ($('#slider-flows').slider('values', 0) != fromValue) {
      $('#slider-flows').slider('values', 0, fromValue);
      $('#slider-value-flow-min').html(fromValue);
    }
    if ($('#slider-flows').slider('values', 1) != toValue) {
      $('#slider-flows').slider('values', 1, toValue);
      $('#slider-value-flow-max').html(toValue);
    }
    
    var evt = new CustomEvent('menuUpdate', { detail: 'flowNum'});
    document.getElementById("menu").dispatchEvent(evt);

    console.log("Changed display min/max flow value: ", jsonMenu.flowNumDisplayFrom, jsonMenu.flowNumDisplayTo);
  },
  setFlowNumDisplayFrom: function( fromValue ) {
    // check whether fromValue belongs to (min, max) range of the slider
    if (fromValue < jsonMenu.minFlowNum) {
      fromValue = jsonMenu.minFlowNum;
    }
    if (fromValue > jsonMenu.maxFlowNum) {
      fromValue = jsonMenu.maxFlowNum;
    }

    jsonMenu.flowNumDisplayFrom = fromValue;
    
    if ($('#slider-flows').slider('values', 0) != fromValue) {
      $('#slider-flows').slider('values', 0, fromValue);
      $('#slider-value-flow-min').html(fromValue);
    }
    
    // TO DO -- adjust following
    var evt = new CustomEvent('menuUpdate', { detail: 'flowNum'});
    document.getElementById("menu").dispatchEvent(evt);

    console.log("Changed displayFrom flow value: ", jsonMenu.flowNumDisplayFrom);
  },
  getFlowNumDisplayFrom: function() {
    return jsonMenu.flowNumDisplayFrom;
  },
  setFlowNumDisplayTo: function( toValue ) {
    // check whether toValue belongs to (min, max) range of the slider
    if (toValue < jsonMenu.minFlowNum) {
      toValue = jsonMenu.minFlowNum;
    }
    if (toValue > jsonMenu.maxFlowNum) {
      toValue = jsonMenu.maxFlowNum;
    }
    jsonMenu.flowNumDisplayTo = toValue;

    if ($('#slider-flows').slider('values', 1) != toValue) {
      $('#slider-flows').slider('values', 1, toValue);
      $('#slider-value-flow-max').html(toValue);
    }

    // TO DO -- adjust following
    var evt = new CustomEvent('menuUpdate', { detail: 'flowNum'});
    document.getElementById("menu").dispatchEvent(evt);

    console.log("Changed displayTo flow value: ", jsonMenu.flowNumDisplayTo);
    
  }, 
  getFlowNumDisplayTo: function() {
    return jsonMenu.flowNumDisplayTo;
  },

  // ------- DATA VOLUME SLIDER RANGE ---------------------------------------
  setDataVolumeSliderRange: function(minValue, maxValue) {
    jsonMenu.minDataVolume = minValue;
    jsonMenu.maxDataVolume = maxValue;

    $('#slider-dataVolume').slider("option", "min", minValue);
    $('#slider-dataVolume').slider("option", "max", maxValue);
    
    if (jsonMenu.minDataVolume > jsonMenu.dataVolumeDisplayFrom) {
      Menu.setDataVolumeDisplayFrom(jsonMenu.minDataVolume);
    }
    if (jsonMenu.minDataVolume > jsonMenu.dataVolumeDisplayTo) {
      Menu.setDataVolumeDisplayTo(jsonMenu.minDataVolume);
    }
    if (jsonMenu.maxDataVolume < jsonMenu.dataVolumeDisplayFrom) {
      Menu.setDataVolumeDisplayFrom(jsonMenu.maxDataVolume);
    }
    if (jsonMenu.maxDataVolume < jsonMenu.dataVolumeDisplayTo) {
      Menu.setDataVolumeDisplayTo(jsonMenu.maxDataVolume);
    }
    
    var evt = new CustomEvent('menuUpdate', { detail: 'dataVolume'});
    document.getElementById("menu").dispatchEvent(evt);

    console.log("I've updated data volume SLIDER range to ", jsonMenu.minDataVolume, jsonMenu.maxDataVolume);
  },
  setMinDataVolume: function(minValue) { // 
    jsonMenu.minDataVolume = minValue;

    $('#slider-dataVolume').slider("option", "min", minValue);

    if (jsonMenu.minDataVolume > jsonMenu.dataVolumeDisplayFrom) {
      Menu.setDataVolumeDisplayFrom(jsonMenu.minDataVolume);
    }
    if (jsonMenu.minDataVolume > jsonMenu.dataVolumeDisplayTo) {
      Menu.setDataVolumeDisplayTo(jsonMenu.minDataVolume);
    }

    var evt = new CustomEvent('menuUpdate', { detail: 'dataVolume'});
    document.getElementById("menu").dispatchEvent(evt);

    console.log("I've updated data volume SLIDER MIN to ", jsonMenu.minDataVolume);
  },
  getMinDataVolume: function() { 
    return jsonMenu.minDataVolume;
  },
  setMaxDataVolume: function(maxValue) { //
    jsonMenu.maxDataVolume = maxValue;

    $('#slider-dataVolume').slider("option", "max", maxValue);

    if (jsonMenu.maxDataVolume < jsonMenu.dataVolumeDisplayTo) {
      Menu.setDataVolumeDisplayTo(jsonMenu.maxDataVolume);
    }
    if (jsonMenu.maxDataVolume < jsonMenu.dataVolumeDisplayFrom) {
      Menu.setDataVolumeDisplayFrom(jsonMenu.maxDataVolume);
    }

    var evt = new CustomEvent('menuUpdate', { detail: 'dataVolume'});
    document.getElementById("menu").dispatchEvent(evt);

    console.log("I've updated data volume SLIDER MAX to ", jsonMenu.maxDataVolume);
  },
  getMaxDataVolume: function() { // *tested OK
    return jsonMenu.maxDataVolume;
  },



  // ------- DATA VOLUME DISPLAY RANGE --------------------------------------

  setDataVolumeDisplayRange: function(fromValue, toValue) {
    // check whether fromValue and toValue belongs to (min, max) range of the slider
    if (fromValue < jsonMenu.minDataVolume) {
      fromValue = jsonMenu.minDataVolume;
    }
    if (fromValue > jsonMenu.maxDataVolume) {
      fromValue = jsonMenu.maxDataVolume;
    }
    if (toValue < jsonMenu.minDataVolume) {
      toValue = jsonMenu.minDataVolume;
    }
    if (toValue > jsonMenu.maxDataVolume) {
      toValue = jsonMenu.maxDataVolume;
    }

    jsonMenu.dataVolumeDisplayFrom = fromValue;
    jsonMenu.dataVolumeDisplayTo = toValue;

    // if ($('#slider-dataVolume').slider('values', 0) != fromValue) {
      $('#slider-dataVolume').slider('values', 0, fromValue);
      $('#slider-value-volume-min').html(fromValue);
    // }
    // if ($('#slider-dataVolume').slider('values', 1) != toValue) {
      $('#slider-dataVolume').slider('values', 1, toValue);
      $('#slider-value-volume-max').html(toValue);
    // }
    
    var evt = new CustomEvent('menuUpdate', { detail: 'dataVolume'});
    document.getElementById("menu").dispatchEvent(evt);

    console.log("I've updated data volume DISPLAY range to ", jsonMenu.dataVolumeDisplayFrom, jsonMenu.dataVolumeDisplayTo);
  },
  setDataVolumeDisplayFrom: function(fromValue) {
    // check whether fromValue belongs to (min, max) range of the slider
    if (fromValue < jsonMenu.minDataVolume) {
      fromValue = jsonMenu.minDataVolume;
    }
    if (fromValue > jsonMenu.maxDataVolume) {
      fromValue = jsonMenu.maxDataVolume;
    }

    jsonMenu.dataVolumeDisplayFrom = fromValue;

    // if ($('#slider-dataVolume').slider('values', 0) != fromValue) {
      $('#slider-dataVolume').slider('values', 0, fromValue);
      $('#slider-value-volume-min').html(fromValue);
    // }

    var evt = new CustomEvent('menuUpdate', { detail: 'dataVolume'});
    document.getElementById("menu").dispatchEvent(evt);

    console.log("I've updated display from data volume to ", jsonMenu.dataVolumeDisplayFrom);
  },
  getDataVolumeDisplayFrom: function() { //
    return jsonMenu.dataVolumeDisplayFrom;
  },
  setDataVolumeDisplayTo: function(toValue) {
    // check whether toValue belongs to (min, max) range of the slider
    if (toValue < jsonMenu.minDataVolume) {
      toValue = jsonMenu.minDataVolume;
    }
    if (toValue > jsonMenu.maxDataVolume) {
      toValue = jsonMenu.maxDataVolume;
    }

    jsonMenu.dataVolumeDisplayTo = toValue;

    // if ($('#slider-dataVolume').slider('values', 1) != toValue) {
      $('#slider-dataVolume').slider('values', 1, toValue);
      $('#slider-value-volume-max').html(toValue);
    // }

    var evt = new CustomEvent('menuUpdate', { detail: 'dataVolume'});
    document.getElementById("menu").dispatchEvent(evt);

    console.log("I've updated display to data volume to ", jsonMenu.dataVolumeDisplayTo);
  },
  getDataVolumeDisplayTo: function() {
    return jsonMenu.dataVolumeDisplayTo;
  },

  // ---------- NODE SIZE -------------------------------------------------
  setNodeSize: function(newValue) { // *tested OK
    jsonMenu.nodeSize = newValue;

    $('#slider-nodeSize').slider('value', newValue);
    $('#slider-value-nodeSize').html( newValue );

    var evt = new CustomEvent('menuUpdate', { detail: 'nodeSize'});
    document.getElementById("menu").dispatchEvent(evt);

    console.log("I've updated node size to ", jsonMenu.nodeSize);
  },
  getNodeSize: function() { // *tested OK
    return jsonMenu.nodeSize;
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

  var column1 = $('<div/>', { 'class':'buttonset-column' }).css({
    'margin-left': "2%",
    'margin-right': "-5%"
  });

  $(column1).append(radioDisplay).append(radioNode);

  // CHECKBOX / Mapuje se na uzly/spojnice
  var column2 = $('<div/>', {
    // 'class':'column buttonset',
    'class':'buttonset',
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

  var column2Wrap = $('<div/>', { 'class':'buttonset-column'}).append(column2);
  var buttonsetBlock = $('<div/>', { 'id':'buttonset-block'});
  $(buttonsetBlock).append(column1).append(column2Wrap);

  // COLOR SCHEMES
  var column3 = $('<div/>', {
      'class':'buttons-column',
      'id':'colorSchemes'
    }).append($('<h2/>').html("Barevné škály"))
      .append($('<button/>', { 'id':'colorScheme1', 'class':'color-scheme-button' }).css({
        'background-image': 'url(images/color-schemes/color-schemes-01.png)',
        'margin-right': '10px'
      })).append($('<button/>', { 'id':'colorScheme2', 'class':'color-scheme-button' }).css({
        'background-image': 'url(images/color-schemes/color-schemes-02.png)'
      })).append($('<br>')
      ).append($('<button/>', { 'id':'colorScheme3', 'class':'color-scheme-button' }).css({
        'background-image': 'url(images/color-schemes/color-schemes-03.png)',
        'margin-right': '10px'
      })).append($('<button/>', { 'id':'colorScheme4', 'class':'color-scheme-button' }).css({
        'background-image': 'url(images/color-schemes/color-schemes-04.png)'
      })).append($('<br>')).append($('<button/>', { 'id':'colorSchemeCustom' }).css({
        // 'height':'22px',
        'width': '110px'
      }).html("Vlastní...")); // .html("Vlastní..."));

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
    
  var nodeSize = $('<div/>', { 'id':'slider-nodeSize-column' })
    .append($('<h2/>').html("Velikost uzlů:"))
    .append($('<h3/>').html(" &nbsp "))
    .append($('<div/>', { 'class':'slider-wrapper' })
      .append($('<div/>', { 'id':'slider-nodeSize', 'class':'slider' }))
      .append($('<span/>', { 'id':'slider-value-nodeSize' }))
      )

  var column4 = $('<div/>', { 'id':'slider-block' }) // .css({ 'width':'29%' })
    .append(sliders1).append(nodeSize);


  var column5 = $('<div/>', {
    'id':'div-button-prefix-order',
    'class':'buttons-column'
  }).append($('<button/>', { 'id':'button-prefix-order' }).css({
    'width':'120px'
  }).html("Seřadit podle prefixu"))
    .append($('<br>'))
    .append($('<button/>', { 'id':'button-balance' }).css({
      'width':'120px'
    }).html("Vyvážit"))
    .append($('<br>'));

  // })


  $(menuwrapper).append(buttonsetBlock).append(column3).append(column4).append(column5);
  // $(menuwrapper).append(column1).append(column2).append(column3).append(column4).append(column5);
  return menuwrapper;
}


Menu.pin = function() {
  var pinButton = $('<div/>', { 'id':'div-button-pin' })
    .append($('<button/>', { 'id':'button-pin' }).html("Pin"));

  return pinButton;
}
// **********************************************************************


// var changeFlowSliderMin = function( newMin ) {
//   $('#slider-flows').slider("option", "min", newMin);
//   console.log
// }

// var changeFlowSliderMax = function( newMax ) {
//   $('#slider-flows').slider("option", "max", newMax);
// }

$(document).ready(function() {

  // var menu = {
  //   "map-color-to": "flows",
  //   "map-node-to" : "ip",
  //   "mapTo" : "nodes",
  //   "color-scheme" : 1,
  //   "min-num-of-flows" : 0,
  //   "max-num-of-flows" : 150,
  //   "min-data-volume" : 1,
  //   "max-data-volume" : 200,
  //   "node-size" : 45
  // }

  // for (var i in menu) {
  //     console.log(menu.mapTo);
  //     console.log(menu[i]);
  //   }


  // $(function() {
  // console.log("uprostred");

  //  for (var i in menuu) {
  //     console.log("jsme 2");
  //     console.log(menuu.mapTo);
  //     console.log(menuu[i]);
  //   }
  // })

  


  // $('#column1').prepend(Menu.render())
  // 
  // $('#menu').prepand
  $('#menu').append(Menu.render())
  $('#menu').append(Menu.pin());



  $('#colorScheme1').button();
  $('#colorScheme2').button();
  $('#colorScheme3').button();
  $('#colorScheme4').button();
  $('#colorSchemeCustom').button();
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
      Menu.setFlowNumDisplayRange(ui.values[0], ui.values[1]);

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
      Menu.setDataVolumeDisplayRange(ui.values[0], ui.values[1]);
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



