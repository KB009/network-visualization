/* 
 * 
 */

/* global d3, Menu, NumberFormatter */

$(window).ready(function () {
    var w = $(window).width(),
        h = $(window).height() - 3,
        link,
        links,
        circle, 
        node,
        nodes,
        linkAttribute = 1, // mapping colors on links - 0 for data, 1 for flows
        nodeAttribute = 1, // mapping colors on nodes - 0 for data, 1 for flows
        colorRange = ["#FAFA4B", "#0096FF"], //color range in format: [from[R,G,B], to[R,G,B]] 
        fullDataRange = [Number.MAX_VALUE,0], //maximal range for data (nodes) TODO: add links data
        fullFlowsRange = [Number.MAX_VALUE,0], //maximal range for data (nodes) TODO: add links flows
        propertyMapping = ["nodes"],
        dataRange,
        flowsRange,
        lineSize = 2.2,
        nodeSize = 1,
        nodeWidth = 92 * nodeSize,
        nodeHeight = 25 * nodeSize,
        childrenLinks = [],
        allChildrenNodes = [],
        sortingType = 2,
        useDomainNames = false,
        root,
        centralNode;
                                       
    this.getLinks = function () {
        return links;
    };

    this.getNodes = function () {
        return nodes;
    };

    this.getForce = function () {
        return force;
    }; 

    /***************************************************************************
     *
     *  Initiation of layout
     * 
     **************************************************************************/
    
    var zoom = d3.behavior.zoom()
        .scaleExtent([0.3, 3])
        .on("zoom", zoom);
    
    var drag = d3.behavior.drag()
        .on("dragstart", dragstart)
        .on("drag", drag);

    var force = d3.layout.force()
        .on("tick", tick)
        .on("end", end)
        .friction(0.1)
        .charge(function (d) {return d.children ? -5000 : -2000 ;})
        .gravity(0)
        .linkDistance(function (d) {
            //TODO for not central
            var movement = ((d.source.children !== undefined && d.source.children.length > 0)
            && d.source.parent === undefined && d.target.id === centralNode);
    
            if (movement && !d.source.moved) {
                d.source.moved = true;
                d.source.fixed = false;
            }
            
            return movement ? nodeWidth * nodeSize * 4 : nodeWidth * nodeSize * 2;         
        })
        .size([w, h - 160]);

    var svg = d3.select("body").append("svg")
        .attr("width", w)
        .attr("height", h)
        .call(zoom)
            .on("dblclick.zoom", null)
            .on("wheel.zoom", scroll);
          
    var vis = d3.select("svg").append("g")
        .attr("class", "svg");

    var tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            //.on("mouseover", mouseOver)
            //.on("mouseout", mouseOut)
            .style("opacity", 0);
    
    // key for actual data/flow amount    
    var key = svg.append("g")
            .attr("class", "key")
            .attr("transform", "translate(" + (w / 60) + "," + (h - 60) + ")");
    
    // rectangle with color
    key.append("rect")
            .attr("class", "color-key")
            .attr("fill", "url(#graph-key)")
            .attr("width", 250)
            .attr("y", 8)
            .attr("height", 25)          
            .style({"stroke": "black", "stroke-width": "0.7"});
    
    key.append("text")
            .attr("class", "label")
            .attr("style", "font-size: 14")
            .text("Legenda");
    
    key.append("text")
            .attr("class", "key-from")
            .attr("style", "font-size: 14")
            .attr("x", -5)
            .attr("y", 50)
            .text("min");
    
    key.append("text")
            .attr("class", "key-to")
            .attr("style", "font-size: 14")
            .attr("x", 232)
            .attr("y", 50)
            .text("max");
       
    // linear gradient element for key 
    svg.append("linearGradient")
      .attr("id", "graph-key")
      .attr("x1", "1%").attr("y1", "0%")
      .attr("x2", "110%").attr("y2", "0%")
    .selectAll("stop")
      .data([
        {offset: "0%", color: "rgb(200,200,200)"},
        {offset: "100%", color: "rgb(50,50,50)"}
      ])   
    .enter().append("stop")
      .attr("offset", function(d) { return d.offset; })
      .attr("stop-color", function(d) { return d.color; });

    d3.json("data/sample.json", function (json) {
        root = json;
        root.fixed = true;
        root.x = w / 2;
        root.y = h / 2 - 80; 
        
        getJsonData(root.nodes);
        
        root.nodes.forEach(function (node) {
            node.weight = 1;   
            updateColorRange(node);
            
            if (node.isCentral) {
                centralNode = node.id;
                node.connections = root.nodes.length - 1;
                node.positionedChilds = 0;
                node.x = w/2;
                node.y = (h + $('#menu').height())/2; 
                node.fixed = true;
            }
        }); 
             
        updateKey(key);           
        update();  
    });
    
    /***************************************************************************
     * Update is called everytime the graph is changed (more data is gathered).
     * If we want a change to be propagated visually, we must call this function.
     * 
     **************************************************************************/    
    function update() {
        nodes = flatten(root.nodes);
        links = root.edges;
        
        vis.selectAll(".link").remove();
        vis.selectAll(".node").remove();
        
        getJsonData(nodes);
                                           
        // On update reload max and min node values in force
        fullDataRange = [Number.MAX_VALUE,0];
        fullFlowsRange = [Number.MAX_VALUE,0];
        
        createLinks();
        
        //load new extreme values from each link
        links.forEach(function (link) {
            if (link.data < fullDataRange[0])
                fullDataRange[0] = link.data;
            if (link.data > fullDataRange[1])
                fullDataRange[1] = link.data;
            if (link.flows < fullFlowsRange[0])
                fullFlowsRange[0] = link.flows;
            if (link.flows > fullFlowsRange[1])
                fullFlowsRange[1] = link.flows;
        }); 
        
        createNodes();
        
        //load new extreme values from each node
        nodes.forEach(function (node) { 
            if (node.data < fullDataRange[0])
                fullDataRange[0] = node.data;
            if (node.data > fullDataRange[1])
                fullDataRange[1] = node.data;
            if (node.data < fullFlowsRange[0])
                fullFlowsRange[0] = node.data;
            if (node.flows > fullFlowsRange[1])
                fullFlowsRange[1] = node.flows;
        }); 
                                         
        // bind zoom on Alt + mousewheel 
        $(window).keydown(function (event) {
            if(event.altKey){
                event.preventDefault();
                svg.call(zoom)
                    .on("dblclick.zoom", null)
                    .on("mousewheel.zoom", zoom);
            }
        });
        // unbind zoom if Alt is released
        $(window).keyup(function (event) {
            if(!event.altKey){
                event.preventDefault();
                svg.call(zoom)
                    .on("dblclick.zoom", null)
                    .on("wheel.zoom", scroll)
                    .on("mousewheel.zoom", scroll);
            }
        });
        
        // start simulation
        force.nodes(nodes)
                .links(links)
                .start();     
    }
    
    /***************************************************************************
     * 
     **************************************************************************/
    function createLinks() {
        var nodeIds = [], 
            linkIds = [];
    
        // First we need to iterate through all visible nodes and links in order to connect links with their nodes 
        // (we need objects in links, not only ids)
        nodes.forEach(function(n) {
            nodeIds.push(n.id);

            // assigning nodes to every "from" and "to" in links
            links.forEach(function(l) {
                if (l.from === n.id)
                    l.source = n;
                else if (l.to === n.id)
                    l.target = n;
            });
             
            childrenLinks.forEach(function(childLink) {
                if (childLink.from === n.id) {
                     childLink.source = n;
                 }
                 else if (childLink.to === n.id) {
                     childLink.target = n;
                 }
            });          
        });
               
        childrenLinks.forEach(function(childLink) {
           if(nodeIds.indexOf(childLink.from) !== -1 && nodeIds.indexOf(childLink.to) !== -1) {
               if(linkIds.indexOf(childLink.from + ", " + childLink.to) === -1)
                    linkIds.push(childLink.source.id + ", " + childLink.target.id);
                    links.push(childLink);
            } 
        });
        
        // Update the links…
        link = vis.selectAll(".link")
                .data(links, function (d) {return (d.from + d.to);})
                .enter().append("g")
                .attr("class", "link")
                .append("line")
                .attr("class", "link-border")
                .attr("id", function(d) {
                    return convertIp(d.from)+"-"+convertIp(d.to);
                })
                .style({"stroke-width": lineSize+0.7, "stroke": "#000"})
                .style("opacity", setOpacity);
        
        // add border to every link
        vis.selectAll(".link").append("line")
                .attr("class", "link-line")
                .attr("id", function(d) {
                    return convertIp(d.from)+"-"+convertIp(d.to);
                })
                .style({"stroke-width": lineSize, "stroke": color});

        // add info-circle for every link       
        circle = vis.selectAll(".link")
                .append("circle")
                .attr("class","info")
                .attr("id", function(d) {
                    return convertIp(d.from)+"-"+convertIp(d.to);
                })
                .attr("cx", 100)
                .attr("cy", 100)
                .attr("r", 5)
                .style({"fill": color, "stroke-width": 0.7, "stroke": "#000"})
                .on("dblclick", linkClick)
                .on("mouseover", mouseOver)
                .on("mousemove", nodeMouseMove)
                .on("mouseout", mouseOut);
    }
    
    /***************************************************************************
     * 
     **************************************************************************/
    function createNodes() {
        // Update the nodes…
        node = vis.selectAll("g.node")
            .data(nodes, function (d) {
                // get range of data and flows from every VISIBLE node
                updateColorRange(d);
                
                // a node is given an initial position around it's parent node
                // this does not aply for central node
                if (!d.isCentral && !d.positioned) {
                    d.positioned = true;
                    d = positionChild(d); 
                }
                
                return d.id;
            });
               
        // create group of nodes
        var groupNodes = node.enter().append("g")
                .attr("class", function(d) {
                    if(d.hasChildren) return "node collapsible";
                    else return "node";
                })
                .attr("id", function (d) { return convertIp(d.id);})
                .style("opacity", setOpacity)
                .call(drag);
        
        // finds central node and adds special border (rectangle) to it
        groupNodes.filter(function(d) { return d.isCentral; }).append("rect")
                .attr("class", "central")
                .attr("x", -3)
                .attr("y", -3)
                .attr("rx", 2)
                .attr("width", nodeWidth+6)
                .attr("height", nodeHeight+6)
                .style({"fill": "#fff", "stroke-width": 0.7, "stroke": colorStrokes});

        // Enter any new nodes and show them as rectangles
        groupNodes.append("rect")
                .attr("class", "background")
                .attr("x", 0)//function(d) { return d.x; })
                .attr("y", 0)//function(d) { return d.y; })
                //.attr("rx", 0)
                .attr("width", nodeWidth)
                .attr("height", nodeHeight)
                .style({"fill": color, "stroke-width": 0.7, "stroke": colorStrokes})
                .on("dblclick", nodeClick)
                .on("mouseover", mouseOver)
                .on("mousemove", nodeMouseMove)
                .on("mouseout", mouseOut);
            
        // ip address of node
        groupNodes.append("text")
                .attr("class","label")
                .attr("dx", nodeHeight/5)
                .attr("dy", nodeHeight - nodeHeight/3)
                .text(function(d) {
                    if (useDomainNames && d.dnsName != undefined)
                        return d.dnsName.substring(0,10) + "...";
                    else
                        return d.id;
                })
                .style("font-size",nodeHeight/2.2 + "px")
                .style("fill", colorStrokes)
                .on("dblclick", nodeClick)
                .on("mouseover", mouseOver)
                .on("mousemove", nodeMouseMove)
                .on("mouseout", mouseOut);
        
        // find only collapsible nodes
        var collapsible = vis.selectAll("g.collapsible");
          
        // collapsible button in node
        collapsible.append("rect")
                .attr("class", "filter-nodes")
                .on("dblclick", filterNodes )
                .on("contextmenu", toggleNodes )
                .attr("x", nodeWidth - 1)
                .attr("y", 0)
                .attr("width", nodeHeight)
                .attr("height", nodeHeight)
                .style({"fill": "#E7E8E9", "stroke-width": 0.7, "stroke": colorStrokes});
    
         // the collapsible button's indicator of hidden children        
         collapsible.append("rect")
                .attr("class", "filter-nodes-indicator")
                .on("dblclick", filterNodes )
                .on("contextmenu", toggleNodes )
                .attr("x", nodeWidth - 1)
                .attr("y", function(d) { return nodeHeight - computeHeight(d);})
                .attr("width", nodeHeight)
                .attr("height", computeHeight)
                .style({"fill": "#9E9E9E", "stroke-width": 0.7, "stroke": colorStrokes, "stroke-dasharray": 0+","+nodeHeight+","+nodeHeight*3});
            
        // + or - sign for node
        collapsible.append("text")
                .attr("class", "filter-nodes")
                .on("dblclick", filterNodes )
                .on("contextmenu", toggleNodes )
                .attr("dx", nodeWidth + nodeHeight/7 - 1)
                .attr("dy", nodeHeight - nodeHeight/5)
                .text(function (d) {
                    if (d._children.length < 1) return "−";
                    else return "+";
                })
                .style("fill", colorStrokes)
                .style("font-size",nodeHeight + "px");        
    }
    
    function positionChild(node) {
        var central, parentId, x, y, a, b;
        if (node.parent !== undefined) 
            central = findNodeById(nodes, node.parent.id);
        if (central === undefined) {
            central = findNodeById(nodes, centralNode);
        }
        
        parentId = central[1];            
        central = central[0];
        a = nodeWidth * 2.8;
        b = nodeHeight * 4;

        var amountOfChildren = central.connections;

        var numberInRow = amountOfChildren;//16;
        if (amountOfChildren > 16)
            numberInRow = 16;

        if (central.positionedChilds > 16) {
            a = nodeWidth * 5, b = nodeHeight * 6;//a = 350, b = 190;
            numberInRow = 24;
        }
        if (central.positionedChilds > 39) {
            a = nodeWidth * 7, b = nodeHeight * 8;//a = 400, b = 260;
            numberInRow = 36;
        }

        var slice = 2 * Math.PI / numberInRow;
        nodes[parentId].positionedChilds += 1;

        var angle = slice * central.positionedChilds;
        /*var i = 1;
        if (d.hasChildren && d.double)
            i = 2;*/

        node.x = central.x + /*i */ 200 * Math.cos(angle);
        node.y = central.y + /*i */ 200 * Math.sin(angle);
        
        return node;
    }  

    function tick() { 
        // Translate position of every link and node in svg
        link.attr("x1", function (d) { return d.source.x + nodeWidth / 2;})
                .attr("y1", function (d) { return d.source.y + nodeHeight / 2;})
                .attr("x2", function (d) { return d.target.x + nodeWidth / 2;})
                .attr("y2", function (d) { return d.target.y + nodeHeight / 2;});

        vis.selectAll(".link-line").attr("x1", function (d) { return d.source.x + nodeWidth / 2;})
                .attr("y1", function (d) { return d.source.y + nodeHeight / 2;})
                .attr("x2", function (d) { return d.target.x + nodeWidth / 2;})
                .attr("y2", function (d) { return d.target.y + nodeHeight / 2;});

        circle.attr("cx", function(d) { return (d.source.x + nodeWidth/2 + d.target.x + nodeWidth/2) /2;})
                .attr("cy", function(d) { return (d.source.y + nodeHeight/2 + d.target.y + nodeHeight/2) /2;});
      
        node.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")";});  
    }

    function color(d) {
        
        //the 'd' element is node and nodes should not be mapped
        if (d.id !== undefined && propertyMapping.indexOf("nodes") === -1)
                return "F0F0F0";
            
        //the 'd' element is link and links should not be mapped    
        if (d.id === undefined && propertyMapping.indexOf("links") === -1)
                return "F0F0F0";    
            
        var number, norm;
        // if d is node and has nodeAttribute 0 at the same time / or is link (= does not have an id) and has linkAttribute 0
        if ( (nodeAttribute === 0 && d.id !== undefined) || (linkAttribute === 0 && d.id === undefined)) {
            number = d.data;
            
            //node is out of data range (filtering is enabled)
            if (number < dataRange[0] || number > dataRange[1])
                return "F0F0F0";
            
            norm = (number - dataRange[0]) / (dataRange[1] - dataRange[0]);
            if (norm > 1 || (isNaN(norm) && number === fullDataRange[0])) norm = 1;
            if (norm < 0 || (isNaN(norm) && number === fullDataRange[1])) norm = 0;
        }
        
        // else if d has nodeAttribute or linkAttribute 1
       else {
            number = d.flows; 
            
            if (number < flowsRange[0] || number > flowsRange[1])
                return "F0F0F0";
            
            norm = (number - flowsRange[0]) / ((flowsRange[1] - flowsRange[0]));
            if (norm > 1 || (isNaN(norm) && number === fullFlowsRange[0])) norm = 1;
            if (norm < 0 || (isNaN(norm) && number === fullFlowsRange[1])) norm = 0;
            
        }
        return d3.interpolateRgb(colorRange[0], colorRange[1])(norm);
    }
    
    function colorStrokes(d) {
        var number, range;
        if ( (nodeAttribute === 0 && d.id !== undefined) || (linkAttribute === 0 && d.id === undefined)) {
            number = d.data;
            range = dataRange;
        }       
        // else if d has nodeAttribute or linkAttribute 1
       else {
            number = d.flows; 
            range = flowsRange;           
        }
        
        if (number < range[0] || number > range[1])
            return "#a5a5a5";
        else return "#000";
    }
    
    function setOpacity(d) {
        var number, range;
        if ( (nodeAttribute === 0 && d.id !== undefined) || (linkAttribute === 0 && d.id === undefined)) {
            number = d.data;
            range = dataRange;
        }       
        // else if d has nodeAttribute or linkAttribute 1
       else {
            number = d.flows; 
            range = flowsRange;           
        }
        
        if (number < range[0] || number > range[1])
            return "0.7";
        else return "1";
    }
    
    function updateKey() {
        // Update label
        $(".key .label").text(function() {
            if (nodeAttribute === 0)
                return "Objem dat";
            else 
                return "Počet toků";
        });
        
        // update minimial and maximal values
        if (nodeAttribute === 0 && dataRange != undefined) {
            $(".key .key-from").html(NumberFormatter.format(dataRange[0],true));   
            $(".key .key-to").html(NumberFormatter.format(dataRange[1],true));  
        }
        else if (nodeAttribute === 1 && dataRange != undefined) {
            $(".key .key-from").html(NumberFormatter.format(flowsRange[0]));   
            $(".key .key-to").html(NumberFormatter.format(flowsRange[1])); 
        }

        
        // update color range          
        var data = [
            {offset: "0%", color: colorRange[0]},
            {offset: "100%", color: colorRange[1]}
        ];
        
        var stops = d3.select('lineargradient').selectAll('stop')
            .data(data); 

        stops.enter().append('stop');

        stops
            .attr('offset', function(d) { return d.offset; })
            .attr('stop-color', function(d) { return d.color; });

        stops.exit().remove();
    }
    
    /**
     * Get amount of hidden children for each node. The function is used for determination of height of 'collapsible button shadow'
     * @param {type} d node whose children are counted
     * @returns {Number|d.children.length|jsonMenu.nodeSize|data.nodeSize|d._children.length} the normalized height of collapsible button
     */
    function computeHeight(d) {
        var height,
            norm,
            hiddenChildren = 0,
            allChildren = 0;
        
        if (d._children !== undefined) hiddenChildren = d._children.length;
        if (d.children !== undefined) allChildren = d.children.length;
        
        allChildren +=  hiddenChildren;
            
        norm = (hiddenChildren - 0) / (allChildren - 0);
        height = norm*nodeHeight;
        return height;   
    }

    // Filter children on double click.
    function filterNodes(d) {
        //var node = d3.select("#" + convertIp(d.id) + "");

        var options = {
            autoOpen: false,
            height: 310,
            width: 221,
            resizable: false,
            modal: true,
            dialogClass: 'children-selector',
            position: { at: "right bottom+" + nodeHeight * 1.2, my: "left top", of: "#"+convertIp(d.id) }          
        };   
        
        $( "#dialog" ).dialog(options).dialog( "open" );
        
        vis.selectAll("#" + convertIp(d.id) + " .filter-nodes").attr("fill","white");
    
        // bind dialog closing when clicking outside the dialog
        $('body').bind('click', function(e) {
            if($('#dialog').dialog('isOpen')
                && !$(e.target).is('.ui-dialog, a')
                && !$(e.target).closest('.ui-dialog').length
            ) {
                $('#dialog').dialog('close');                
                vis.selectAll(".filter-nodes").attr("fill","black");               
            }
        });
        
        //clear previous content
        $(".contents").empty();
        
        //append new content
        $(".contents").append("<p style='float:left'>Seřadit podle:</p><form id='sortNodes'>");
        $(".contents #sortNodes").append("<input id='input-flow' type='radio' name='sort' value='0'/><label for='input-flow'>Počty toků</label></br>");
        $(".contents #sortNodes").append("<input id='input-data' type='radio' name='sort' value='1'/><label for='input-data'>Objem dat</label></br>");
        $(".contents #sortNodes").append("<input id='input-prefix' type='radio' name='sort' value='2'/><label for='input-prefix'>Prefix</label></br>");
        $(".contents").append('<input type="checkbox" id="selectAll" name="selectAll">');
        $(".contents").append('<button type="submit" id="submit" name="submit">Zobrazit vybrané</button>');
        $(".contents").append("<table class='filter-children'>");
        
        //set sorting type for list of nodes
        $('input:radio[name=sort]').filter('[value=' + sortingType + ']').prop('checked', true);     

        //if all nodes are visible, main checkbox (for selecting all nodes) is checked
        if(d._children.length === 0)
            $('#dialog #selectAll').prop('checked',true);
            
        var allChildren = [];

        if(d._children) {
            // adds hidden children
            d._children.forEach(function(child) {
                allChildren.push([]);
                allChildren[allChildren.length-1].push(child);
                allChildren[allChildren.length-1].push(false);
            });
        }
        if(d.children) {
            // adds visible children
            d.children.forEach(function(child) {
                allChildren.push([]);
                allChildren[allChildren.length-1].push(child);
                allChildren[allChildren.length-1].push(true);
            });
        }
                      
        //sort nodes in array
        if (sortingType == 0) 
            allChildren.sort(function(a, b){return a[0].flows > b[0].flows ? -1 : 1;});
        else if (sortingType == 1) 
            allChildren.sort(function(a, b){return a[0].data > b[0].data ? -1 : 1;});
        else
            allChildren.sort(function(a, b){return compareIPs(a[0].id, b[0].id) });
        
        /*This function compares IPs for retrieval of their positions in sorted array. 
         * It also contains comparsion of IPv4 and IPv6. */
        function compareIPs(a, b){
            // both addresses are IPv4
            if (a.indexOf('.') !== -1 && b.indexOf('.') !== -1) {
                var arrayA = a.split('.'),
                    arrayB = b.split('.');
            
                for (var i = 0; i < 4; i++) {
                    if (parseInt(arrayA[i]) > parseInt(arrayB[i]))
                        return 1;
                    else if (parseInt(arrayA[i]) < parseInt(arrayB[i]))
                        return -1;
                }
            }
            // both addresses are IPv6
            else if (a.indexOf(':') !== -1 && b.indexOf(':') !== -1) {
                var arrayA = a.split(':'),
                    arrayB = b.split(':');
            
                var arrayLength = arrayA.length < arrayB.length ? arrayA.length : arrayB.length;    
                
                for (var i = 0; i < arrayLength; i++) {
                    // i-th array position in one of addresses is empty (there is ::)
                    if (arrayA[i].length === 0 && arrayB[i].length !== 0)
                        return -1;
                    if (arrayA[i].length !== 0 && arrayB[i].length === 0)
                        return 1;
                    
                    var sliceA = parseInt(arrayA[i], 16), 
                        sliceB = parseInt(arrayB[i], 16); 
                    
                    if (sliceA > sliceB) 
                        return 1;
                    else if (sliceA < sliceB)
                        return -1;
                }                    
            }
            //one IPv6, one IPv4
            else {
                if (a.indexOf(':') !== -1)
                    return 1;
                else
                    return -1;
            }
        }
        
        //appends all children into modal window
        listNodes(allChildren);        
        $(".contents").append("</table>");
        
        // select/diselecet all nodes
        $('#dialog #selectAll').click(function(){
            if(this.checked){
                $('#dialog table :checkbox').each(function(){
                    this.checked = true;
                });
            }else{
                 $('#dialog table :checkbox').each(function(){
                    this.checked = false;
                });
            }
        });
            
        // FlowMon Shitf/Ctrl multiselect
        var checkboxes = $('#dialog table td');
        checkboxes.mousemove(function (event) {
            var target = event.target.getAttribute("for");
            if(event.ctrlKey){
                if (target)
                    $("#dialog #" + target).prop('checked', true);
                else
                    $(event.target).prop('checked', true);
            }
            if(event.shiftKey){
                if (target)
                    $("#dialog #" + target).prop('checked', false);
                else
                    $(event.target).prop('checked', false);
            }
        });
         
        checkboxes.click(function(){
            // select/deselect main checkbox according to number of selected nodes
            if($('#dialog table :checkbox:checked').length === $('#dialog table :checkbox').length){
                $('#dialog #selectAll').prop('checked',true);
            }else{
                $('#dialog #selectAll').prop('checked',false);
            }
                      
            // standard Shift multiselect
            /*if(!lastChecked) {
                lastChecked = this;
                return;
            }

            if(event.shiftKey) {
                var start = checkboxes.index(this);
                var end = checkboxes.index(lastChecked); 
                checkboxes.slice(Math.min(start,end), Math.max(start,end)+ 1)
                          .prop('checked', lastChecked.checked);;
            }
            lastChecked = this; */  
        });  
        
        // on click on submit button update force with new nodes
        $("#dialog #submit").click(function() {           
            $('#dialog table :checkbox').each(function(i, box) {
                var nodeId = $(box).attr('id').replace('checkbox-ip-','').replace(/\-/g,'.');
                // we find actual node in hidden or visible children
                var actualHiddenNode = findNodeById(d._children, nodeId),
                    actualVisibleNode = findNodeById(d.children, nodeId);
                
                // if this node should be visible (is checked) and currently is hidden, we need to replace it
                if ($(box).prop('checked') === true && actualHiddenNode !== undefined) {
                    switchVisibility(actualHiddenNode[0], true, false);                
                }
                // if this node should be hidden (is not checked) and is currently visible, we need to replace it
                else if ($(box).prop('checked') === false && actualVisibleNode !== undefined) {
                    switchVisibility(actualVisibleNode[0], false, false);
                }       
            });
            
            //update quick toggle
            d.quick_toggle = [];
            d.quick_toggle = d.children;
            
            // additionally, redundant links to all hidden children must be deleted manually 
            links.forEach(function(link, i){
                if(d._children.indexOf(link.source) !== -1 || d._children.indexOf(link.target) !== -1) {
                    links.splice(i);
                }
            });
            d.fixed = false;
            update(d);
           $('#dialog').dialog('close'); 
        });
        
        //get new sorting type for list of nodes on change of radio buttons
        $('#sortNodes input').change(function() {
            sortingType = ($('input[name="sort"]:checked', '#sortNodes').val()); 
            var rows = $('.contents .filter-children').find('tbody > tr');//changeSorting(allChildren);
            rows.sort(function(a, b){
                var obj1, obj2;
                if(sortingType == 0) {
                    obj1 = parseInt($(a).find('td #flow').val()),
                    obj2 = parseInt($(b).find('td #flow').val());
                }
                else if (sortingType == 1) {
                    obj1 = parseInt($(a).find('td #data').val()),
                    obj2 = parseInt($(b).find('td #data').val());
                }
                else {
                    return compareIPs(a.innerText,b.innerText);
                }
                    
                return obj1 > obj2 ? -1 : 1;
            });
            
            $.each(rows, function(i, row){
                $('.contents .filter-children').append(row);
            });
        });
             
        //creates rows with nodes in table 
        function listNodes(nodes){
            nodes.forEach(function(child) {
                var checkbox,
                    hiddenFlow = '<input type="hidden" name="flow" id="flow" value="' + child[0].flows + '">',
                    hiddenData = '<input type="hidden" name="data" id="data" value="' + child[0].data + '">';
                
                if (child[1] === true) 
                    checkbox = '<input type="checkbox" id="checkbox-' + convertIp(child[0].id) + '" name="checkbox-'  + child[0].id + '" checked>';
                else
                    checkbox = '<input type="checkbox" id="checkbox-' + convertIp(child[0].id) + '" name="checkbox-'  + child[0].id + '">';
                    
                var styleColor = 'style="background-color:' + color(child[0]) + '"',
                    firstTd = "<td>" + checkbox + hiddenFlow + hiddenData + "</td>",
                    secondTd = "<td><label for='checkbox-" + convertIp(child[0].id) + "'>" + child[0].id + "</label></td>";
                
                $(".contents table").append("<tr " + styleColor + ">" + firstTd + secondTd + "</tr>");
            });
        }      
    }
    
    // Toggle specific children on click 
    function toggleNodes(d) {
        d3.event.preventDefault();
        
        //there are some visible children -> hide them all
        if (d.children.length > 0) {
            
            d.quick_toggle = d.children;
            d._children = $.merge(d._children, d.children);
            d.children = [];
            
            switchVisibility(d, false, true);           
        }
        //all children are hidden -> show latest 'quick toggle' list 
        else {
            if (d.quick_toggle === undefined || d.quick_toggle.length === 0)
                d.quick_toggle = d._children;

            d.children = d.quick_toggle;
            d._children = d._children.filter( function( el ) {
                return d.quick_toggle.indexOf( el ) === -1;
            });
            
            switchVisibility(d, true, true); 
        }
        
        links.forEach(function(link, i){
            if(d._children.indexOf(link.source) !== -1 || d._children.indexOf(link.target) !== -1) {
                    links.splice(i);
                }
        });
        d.fixed = false;
        update();
    } 
    
   /**
     * Checks whether there are children for each node that match some given node. 
     * Those children should be (in)visible
     * 
     * @param {type} actualNode the node whose children are checked
     * @param {type} nodeVisibility determines whether we want the children to become hidden or visible
     * @param {type} quickToggle is true when "fast toggle" is triggered
     */
    function switchVisibility(actualNode, nodeVisibility, quickToggle) {
        //check all nodes for adjacency with actualNode
        nodes.forEach(function(n) {
            // if n has children and should be set as visible
           if (n.hasChildren && nodeVisibility) {
                if (quickToggle) {
                    actualNode.quick_toggle.forEach(function(child) {
                        showCommonChild(n, child);
                    }); 
                }
                else {
                    showCommonChild(n, actualNode);
                }
           } 
           // if n has children and should be set as invisible, 
           // all children should be set to invisible as well
           else if (n.hasChildren) {
                if (quickToggle) {
                    actualNode.quick_toggle.forEach(function(toggle) {
                        if (toggle.children !== undefined && toggle.children.length !== 0) {
                            toggle.children.forEach(function(grandChild) {
                                switchVisibility(grandChild, false);
                            });
                        }
                        hideCommonChild(n, toggle);
                    }); 
               }
               else {
                    // if the node that is supposed to be hidden contains more visible children,
                    // it must be checked, wheter these children are shared between other nodes.
                    if (actualNode.children !== undefined && actualNode.children.length !== 0) {
                        actualNode.children.forEach(function(grandChild) {
                            switchVisibility(grandChild, false, false);
                        });
                    }
                    hideCommonChild(n, actualNode);        
                }
            }
        }); 
        
        function showCommonChild(node, child) {
            var commonChild = findNodeById(node._children, child.id);
            if (commonChild) {
                node._children.splice($.inArray(commonChild[0], node._children), 1);
                node.children.push(commonChild[0]);
            }
        }
        
        function hideCommonChild(node, child) {
            var commonChild = findNodeById(node.children, child.id);
            if (commonChild) {
                node.children.splice($.inArray(commonChild[0], node.children), 1);
                node._children.push(commonChild[0]);
            }
        }
    }
    
    /***************************************************************************
     * Helper :
     **************************************************************************/
    
    // Returns a list of all nodes under the root.   
    function flatten(root) {
        var nodes = [], i = 0;

        function recurse(node) {
            if (node.children) node.children.forEach(recurse);
            if (!node.id) node.id = ++i;
                nodes.push(node);
            }
            
        root.forEach(function(node){ recurse(node);});
        return nodes;
    }
      
    function updateColorRange(newValue) {          
        var newData = newValue.data;
        var newFlows = newValue.flows; 
        
        // reload actual ranges for data and flow
        dataRange = [Menu.getDataVolumeDisplayFrom(), Menu.getDataVolumeDisplayTo()];
        flowsRange = [Menu.getFlowNumDisplayFrom(), Menu.getFlowNumDisplayTo()];

        if (newData < fullDataRange[0]) 
                fullDataRange[0] = newData;
        if (newData > fullDataRange[1])
                fullDataRange[1] = newData;
            
        if (newFlows < fullFlowsRange[0])
                fullFlowsRange[0] = newFlows;
        if (newFlows > fullFlowsRange[1])
                fullFlowsRange[1] = newFlows; 
        
        
        // previous data-slider's 'from' and 'to' positions are set accordingly  
        if(dataRange[0] === Menu.getMinDataVolume() && dataRange[1] === Menu.getMaxDataVolume()) {
            Menu.setDataVolumeSliderRange(fullDataRange[0],fullDataRange[1]);
            Menu.setDataVolumeDisplayRange(fullDataRange[0], fullDataRange[1]);
        } 
        // only data-slider's 'from' position is set at the beginning
        else if(dataRange[0] === Menu.getMinDataVolume()) {
            Menu.setDataVolumeSliderRange(fullDataRange[0],fullDataRange[1]);
            Menu.setDataVolumeDisplayFrom(fullDataRange[0]);
        }    
        // only data-slider's 'to' position is set at the end
        else if(dataRange[1] === Menu.getMaxDataVolume()) {
            Menu.setDataVolumeSliderRange(fullDataRange[0],fullDataRange[1]);
            Menu.setDataVolumeDisplayTo(fullDataRange[1]);
        }
        else
            Menu.setDataVolumeSliderRange(fullDataRange[0],fullDataRange[1]);           
        
        // flow-slider's 'from' and 'to' positions are set accordingly
        if(flowsRange[0] === Menu.getMinFlowNum() && flowsRange[1] === Menu.getMaxFlowNum()) {
            Menu.setFlowNumSliderRange(fullFlowsRange[0],fullFlowsRange[1]);    
            Menu.setFlowNumDisplayRange(fullFlowsRange[0], fullFlowsRange[1]);
        }      
        // flow-slider's 'from' position is set at the beginning
        else if(flowsRange[0] === Menu.getMinFlowNum()) {
            Menu.setFlowNumSliderRange(fullFlowsRange[0],fullFlowsRange[1]);    
            Menu.setFlowNumDisplayFrom(fullFlowsRange[0]);
        }
        // flow-slider's 'to' position is set at the end
        else if(flowsRange[1] === Menu.getMaxFlowNum()) {
            Menu.setFlowNumSliderRange(fullFlowsRange[0],fullFlowsRange[1]);    
            Menu.setFlowNumDisplayTo(fullFlowsRange[1]);
        }
        else
            Menu.setFlowNumSliderRange(fullFlowsRange[0],fullFlowsRange[1]);    
        
        // set new ranges fro data and flows
        dataRange = [Menu.getDataVolumeDisplayFrom(), Menu.getDataVolumeDisplayTo()];
        flowsRange = [Menu.getFlowNumDisplayFrom(), Menu.getFlowNumDisplayTo()];
    }
    
    //helper for converting ip address into string without periods, with letters on beginning
    function convertIp(name) {
        return ("ip-" + name.replace(/\./g, '-'));
    } 
    
    function end() {
        for (var i = 0; i < nodes.length; i++) {
            nodes[i].fixed = true;
        }
    }
    
    /**
     * 
     * @param {type} actualNodes an array in which the node should be searched for
     * @param {type} id an id of the node we are looking for
     * @returns {Array} first element of the return value is the node, second is it's index in given array
     */
    function findNodeById(actualNodes, id) {
        if (actualNodes !== undefined) {
            for (var i = 0; i < actualNodes.length; i++) {
                if (actualNodes[i].id === id)
                    return [actualNodes[i], i];
            }
        }
    }
    
    function getJsonData(nodes) {
        
        nodes.forEach(function (node) {
            if (node.hasChildren === undefined) {
                node.hasChildren = false;
                nodeData(node);
            }
        });
        
        setChildren(nodes);
        
        return allChildrenNodes;  
        
        function nodeData(node){
            jQuery.ajax({
                datatype: "json",
                url: "data/" + node.id + ".moreData.json",
                async: false,
                success: function(data){
                    node.hasChildren = true;
                    node.positionedChilds = 0;
                    var childrenNodes = data.nodes;
                    var childrenEdges = data.edges;
                    node.connections = childrenNodes.length;
                    childrenNodes.forEach(function(nChild) { 
                        //if nChild node is not central and is not visible 
                        if(findNodeById(nodes, nChild.id) === undefined) {
                            nChild.parent = node;
                            nChild.weight = 1;
                            //console.log(node);

                            if(!node._children) {
                                node._children = [];
                                node.children = [];
                            }

                            node._children.push(nChild.id);
                        }
                        //if nChild is central node for this json
                        else if(node.id === nChild.id) {
                            node.data = nChild.data;
                            node.flows = nChild.flows;
                        }
                        
                        var child = findNodeById(allChildrenNodes, nChild.id);
                        if( child === undefined) {
                            allChildrenNodes.push(nChild);
                        }
                        else {
                            allChildrenNodes[child[1]].data += nChild.data;
                            allChildrenNodes[child[1]].data += nChild.flows;
                            
                        }
                    });

                    childrenEdges.forEach(function(eChild) {
                        childrenLinks.push(eChild);    
                    });
                },
                error: function() {
                    nodes.hasChildren = false;
                }
            }); 
        }     
        
        function setChildren(nodes){         
            nodes.forEach( function(node) {
                if (node._children) {
                    $.each(node._children, function (i, cc){
                        var child = findNodeById(allChildrenNodes, cc);
                        
                        if (child !== undefined)
                            node._children[i] = child[0];
                    });
                }
            });         
        }
    }   
    
    /***************************************************************************
     * 
     * Manipulation functions
     * 
     **************************************************************************/
    
    function balanceGraph() {
        for (var i = 0; i < nodes.length; i++) {
            if (!nodes[i].isCentral)
                nodes[i].fixed = false;
        }
        force.resume();
    }
    
    // fix position of any node on dragstart and enable dragging
    function dragstart(d) {     
        d3.event.sourceEvent.stopPropagation();
        d.fixed = true;
        d3.select(this).classed("fixed", true);
        force.start();
    }
    
    // on drag of specific nodes, positioning of their children is affected 
    function drag(d) {      
        mouseOut();
        
        d.px += d3.event.dx;
        d.py += d3.event.dy;
               
        if (d.hasChildren || d.isCentral) {
            setNodePosition(d, d3.event);
        }
    } 
    
    function setNodePosition(node, event) {
        /*var skip = false;
        
        //V2: node is visible but not connected
        if (nodes.indexOf(node) === -1 && node.children !== undefined && node.children.length > 0) {
            node.children.forEach(function (ch) {
                if (nodes.indexOf(ch) !== -1)
                    skip = true;
            });
        }*/
        
        // Node has visible children for moving
        if (node.children /*&& !skip*/) {
            node.children.forEach(function (ch) {
                setNodePosition(ch, event);
                ch.px += event.dx;
                ch.py += event.dy;
            });
        }
        // node has hidden children that need to have their positions changed as well
        if (node._children /*&& !skip*/) {
            node._children.forEach(function (ch) {
                setNodePosition(ch, event);
                ch.px += event.dx;
                ch.py += event.dy;
            });
        }
        // node is central, so every other node is treated like it's child
        else if (node.isCentral) {
            // in uniqueVals are stored ids of all nodes which have been moved
            // otherwise would nodes with two or more parents be moved multiple times
            var uniqueVals = [];
            nodes.forEach(function (ch) {
                if (ch.id !== node.id && uniqueVals.indexOf(ch.id) === -1) {
                    ch.px += event.dx;
                    ch.py += event.dy;
                    uniqueVals.push(ch.id);
                }
            });
        }
    }
    
    function scroll() {
        if(force.scale === undefined)
            force.scale = 1;
        if(force.translate === undefined)
            force.translate = [0,0];
        
        if (d3.event.deltaY > 0)
            force.translate[1] -= 10;
        else
            force.translate[1] += 10;
    
        zoom.translate([force.translate[0], force.translate[1]]);
        
        vis.attr("transform", "translate(" + force.translate + 
                                 ")scale(" + force.scale + ")");
    }
    
    function zoom() {   
        if (d3.event) {
            force.scale = d3.event.scale;
            force.translate = d3.event.translate;
        }
        vis.attr("transform", "translate(" + d3.event.translate + 
                                 ")scale(" + d3.event.scale + ")");        
    }
    
    function nodeClick(){
        d3.event.preventDefault();
        var event = new CustomEvent("getInfo", { detail: "getNodeInfo"});
        alert("Událost: " + event.detail);
    }
    
    function linkClick(){
        d3.event.preventDefault();
        var event = new CustomEvent("getInfo", { detail: "getLinkInfo"});
        alert("Událost: " + event.detail);
    }
    
    function mouseOver() {
            tooltip.transition().delay(600).duration(500).style("opacity", 1);
    }

    function mouseOut() {
        tooltip.transition().delay(600).duration(100).style("opacity", 0);
    }

    function nodeMouseMove(d) {
        //var node = d3.select("#" + convertIp(d.id) + "");
        //console.log(d);
        if (d.from === undefined && d.to === undefined && d.dnsName !== undefined) {
            tooltip.html("<b>Info o uzlu <br>" + d.id + 
                         ":</b><br>Toky: " + NumberFormatter.format(d.flows) + 
                         "<br>Data: " + NumberFormatter.format(d.data, true) + 
                         "<br>Doménové jméno: " + d.dnsName)
                .style("left", (d3.event.layerX) + 5 + "px").style("top", (d3.event.layerY) + 5 + "px");
        }
        else if (d.from === undefined && d.to === undefined && d.dnsName === undefined) {
            tooltip.html("<b>Info o uzlu <br>" + d.id + 
                         ":</b><br>Toky: " + NumberFormatter.format(d.flows) + 
                         "<br>Data: " + NumberFormatter.format(d.data, true))
                .style("left", (d3.event.layerX) + 5 + "px").style("top", (d3.event.layerY) + 5 + "px");
        }
        else {
            tooltip.html("<b>Info o lince<br> z " + d.from + " do " + d.to + 
                         "</b><br>Toky: " + NumberFormatter.format(d.flows) + 
                         "<br>Data: " + NumberFormatter.format(d.data, true))
                .style("left", (d3.event.layerX) + 5 + "px").style("top", (d3.event.layerY) + 5 + "px");}       
    }
       
    /***************************************************************************
     * Menu changes listener, updates the graph
     **************************************************************************/ 
    $('#menu').on('menuUpdate', function(e) {   
        switch(e.detail) {
            case 'dataVolume':
                setDataRange();
                break;
            case 'flowNum':
                setFlowRange();
                break;
            case 'mapColorTo':
                var mapping = Menu.getMapColorTo();
                if (mapping === 'volume') {
                    nodeAttribute = 0;
                    linkAttribute = 0;
                    setDataRange();
                }
                else {
                    nodeAttribute = 1;
                    linkAttribute = 1;
                    setFlowRange();
                }
                break;
            case 'mapNodeTo':
                var nodeMapping = Menu.getMapNodeTo();
                if (nodeMapping === "ip")
                    useDomainNames = false;
                else
                    useDomainNames = true;
                
                if (nodes != undefined) {
                    nodes.forEach(function (d) {
                        var l = d3.select("#"+ convertIp(d.id) + " .label");
                        l.transition()
                            .duration(10)
                            .text(function(d) {
                                if (useDomainNames && d.dnsName != undefined)
                                    return d.dnsName.substring(0,10) + "...";
                                else
                                    return d.id;
                            });
                    });              
                }
                break;
            case 'setColorScheme':
                colorRange = Menu.getColorScheme();
                colorTransition();
                break;
            case 'nodeSize':
                nodeSize = Menu.getNodeSize();
                nodeWidth = 92 * nodeSize,
                nodeHeight = 25 * nodeSize;
                
                if (nodes != undefined ) {
                    nodes.forEach(function (d) {
                        // all node parts must be found separately 
                        var node = d3.select("#" + convertIp(d.id) + " .background"),
                            centralNode = d3.select("#" + convertIp(d.id) + " .central"),
                            label = d3.select("#" + convertIp(d.id) + " .label"),
                            filterButton = d3.select("#" + convertIp(d.id) + " rect.filter-nodes"),
                            filterButtonIn = d3.select("#" + convertIp(d.id) + " rect.filter-nodes-indicator"),
                            filterSign = d3.select("#" + convertIp(d.id) + " text.filter-nodes");

                        node.attr("width", nodeWidth)
                            .attr("height", nodeHeight);
                    
                        centralNode
                            .attr("width", nodeWidth+6)
                            .attr("height", nodeHeight+6);    

                        label.attr("dx", nodeHeight/5)
                             .attr("dy", nodeHeight - nodeHeight/3)
                             .style("font-size",nodeHeight/2.2 + "px");

                        filterButton
                                .attr("x", nodeWidth - 1)
                                .attr("width", 25 * nodeSize)
                                .attr("height", 25 * nodeSize); 

                        filterButtonIn
                                .attr("width", nodeHeight)
                                .attr("height", computeHeight)
                                .attr("x", nodeWidth - 1)
                                .attr("y", function(d) { return nodeHeight - computeHeight(d);})
                                .style("stroke-dasharray", 0+","+nodeHeight+","+nodeHeight*3);

                        filterSign
                                .attr("dx", nodeWidth + nodeHeight/7 - 1)
                                .attr("dy", nodeHeight - nodeHeight/5)
                                .style("font-size",nodeHeight + "px");
                        
                        // tick is called to adjust link positions according to nodes
                        tick();
                    });               
                }
                break;
            case 'mapTo':
                //get the new mapping value
                var mapping = Menu.getMapTo();
                setPropertyMapping(mapping);   
                break;    
            default:
                break;
        }
              
        function colorTransition() {
            if (nodes !== undefined ) {
                nodes.forEach(function (d) {
                        var node = d3.select("#" + convertIp(d.id) + " .background"),
                            central = d3.select("#" + convertIp(d.id) + " .central"),
                            collapsible = d3.select("#" + convertIp(d.id) + " .filter-nodes"),
                            collapsibleText = d3.select("#" + convertIp(d.id) + " text.filter-nodes"),
                            collapsibleIndicator = d3.select("#" + convertIp(d.id) + " .filter-nodes-indicator"),
                            label = d3.select("#" + convertIp(d.id) + " .label"),
                            opacity = d3.select("#" + convertIp(d.id));
                            
                        collapsible.style("stroke", colorStrokes(d));
                        collapsibleText.style("fill", colorStrokes(d));
                        collapsibleIndicator.style("stroke", colorStrokes(d));
                        node.style("fill", color(d));
                        node.style("stroke",colorStrokes(d));
                        central.style("stroke",colorStrokes(d));
                        label.style("fill", colorStrokes(d));                        
                        opacity.style("opacity", setOpacity(d)); 
                });               
            }
            
            if (links != undefined ) {
                links.forEach(function (d) {
                        var l = d3.select(".info#"+ convertIp(d.from) + "-" + convertIp(d.to)),
                            lb = d3.select(".link-border#"+ convertIp(d.from) + "-" + convertIp(d.to)),
                            c = d3.select(".link-line#"+ convertIp(d.from) + "-" + convertIp(d.to));
                            
                        l.style("fill", color(d));                    
                        l.style("stroke",colorStrokes(d));
                        l.style("opacity",setOpacity(d));
                        lb.style("stroke",colorStrokes(d));
                        lb.style("opacity", setOpacity(d)); 
                        c.style("stroke", color(d));
                });               
            }
            
            updateKey(key); 
        }
        
        function setDataRange() {
            dataRange = [Menu.getDataVolumeDisplayFrom(), Menu.getDataVolumeDisplayTo()];
            colorTransition();
        }
        
        function setFlowRange() {
            flowsRange = [Menu.getFlowNumDisplayFrom(), Menu.getFlowNumDisplayTo()];
            colorTransition();
        }
        
        /**
         * Sets mapping of data or flow amount on links and nodes
         * @param {type} newMapping the new requested mapping (array with size at most 2, containing String values "links" or "nodes")
         */
        function setPropertyMapping(newMapping) {  
            var iterateNodes = false, 
                iterateLinks = false;
        
            // links should be mapped but they are not mapped yet, 
            // or links are mapped and should not be mapped anymore
            if((newMapping.indexOf("links") !== -1 && propertyMapping.indexOf("links") === -1) || 
               (newMapping.indexOf("links") === -1 && propertyMapping.indexOf("links") !== -1)) 
                iterateLinks = true;

            //nodes shold be mapped but they are not mapped yet and vice versa 
            if((newMapping.indexOf("nodes") !== -1 && propertyMapping.indexOf("nodes") === -1) || 
               (newMapping.indexOf("nodes") === -1 && propertyMapping.indexOf("nodes") !== -1)) 
               iterateNodes = true;                  
            
            //update array with mapping properties
            propertyMapping = newMapping;
            
            if (iterateLinks) 
                links.forEach(function (d) {
                   d3.select(".link-line#" + convertIp(d.from) + "-" +  convertIp(d.to)).style("stroke", color(d));
                   d3.select("circle#" + convertIp(d.from) + "-" +  convertIp(d.to)).style("fill", color(d));
                });
            
            if (iterateNodes)
                nodes.forEach(function (d) {
                    d3.select("#" + convertIp(d.id) + " .background").style("fill", color(d));
                });
        }       
    });
    
    $('#button-balance').click(function() {
            balanceGraph();
    });
    
    $('#button-stop').click(function() {
            end();
    });
});
