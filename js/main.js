/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global d3 */

$(window).load(function () {
    var w = $(window).width(),
        h = $(window).height() - 3,
        link,
        links,
        circle, 
        node,
        nodes,
        linkAttribute = 0, // mapping colors on links - 0 for data, 1 for flows
        nodeAttribute = 0, // mapping colors on nodes - 0 for data, 1 for flows
        colorRange = [[250,250,75], [0,150,255]], //color range in format: [from[R,G,B], to[R,G,B]] 
        fullDataRange = [Number.MAX_VALUE,0], //maximal range for data (nodes) TODO: add links data
        fullFlowsRange = [Number.MAX_VALUE,0], //maximal range for data (nodes) TODO: add links flows
        lineSize = 2.2,
        nodeSize = 1,
        nodeWidth = 90 * nodeSize,
        nodeHeight = 25 * nodeSize,
        childrenLinks = [],
        allChildrenNodes = [],
        sortingType = 2,
        root;
                       
    this.getLinks = function () {
        return links;
    };

    this.getNodes = function () {
        return nodes;
    };

    this.getForce = function () {
        return force;
    }; 

    /**
     * Initiation of layout
     * 
     */
    
    var zoom = d3.behavior.zoom()
        .scaleExtent([0.3, 3])
        .on("zoom", zoom);
    
    var drag = d3.behavior.drag()
        .on("dragstart", dragstart)
        .on("drag", drag);

    var force = d3.layout.force()
        .on("tick", tick)
        .on("end", end)
        .charge(-1000)
        .chargeDistance(5000)
        .linkDistance(function (d) {return d.target._children ? nodeWidth * 1 : nodeWidth * 2 ;}) //TODO: should link distance be dependent on nodeSize or constant?
        .size([w, h - 160]);

    var svg = d3.select("body").append("svg")
        .attr("width", w)
        .attr("height", h)
        .call(zoom)
            .on("dblclick.zoom", null)
            .on("wheel.zoom", scroll);
          
    var vis = d3.select("svg").append("g")
        .attr("class", "svg");

    d3.json("data/sample.json", function (json) {
        root = json;
        root.fixed = true;
        root.x = w / 2;
        root.y = h / 2 - 80; 
        
        root.nodes.forEach(function (node) {
            node.weight = 1;         
        }); 
        
        getJsonData(root.nodes);
             
        update();  
    });
    
    /** 
     * Update is called everytime the graph is changed (more data is gathered).
     * If we want a change to be propagated visually, we must call this function.
     * 
     */    
    function update() {
        nodes = flatten(root.nodes);
        links = root.edges;
        
        vis.selectAll(".link").remove();
        vis.selectAll(".node").remove();
        
        getJsonData(nodes);
                                    
        // On update reset max and min values in force
        fullDataRange = [Number.MAX_VALUE,0];
        fullFlowsRange = [Number.MAX_VALUE,0];
        
        createLinks();
        createNodes();
        
        // bind zoom on Alt + mousewheel 
        $(window).keydown(function (event) {
            event.preventDefault();
            if(event.altKey){
                svg.call(zoom)
                    .on("dblclick.zoom", null)
                    .on("mousewheel.zoom", zoom);
            }
        });
        // unbind zoom if Alt is released
        $(window).keyup(function (event) {
            event.preventDefault();
            if(!event.altKey){
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
    
    /**
     * 
     */
    function createLinks() {
        var nodeIds = [], 
            linkIds = [];
    
        // First we need to iterate through all visible nodes and links in order to connect links with their nodes 
        // (we need objects in links, not only ids)
        nodes.forEach(function(n) {
            nodeIds.push(n.id);
            
            // get range of data and flows from every VISIBLE node
            updateColorRange(n);

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
                .style({"stroke-width": lineSize+1.4, "stroke": "#000"});
        
        // add border to every link
        vis.selectAll(".link").append("line")
                .attr("class", "link-line")
                .style({"stroke-width": lineSize, "stroke": color});

        // add info-circle for every link       
        circle = vis.selectAll(".link")
                .append("circle")
                .attr("class","info")
                .attr("cx", 100)
                .attr("cy", 100)
                .attr("r", 5)
                .style({"fill": color, "stroke-width": 0.7, "stroke": "#000"});
    }
    
    /**
     * 
     */
    function createNodes() {
        // Update the nodes…
        node = vis.selectAll("g.node")
            .data(nodes, function (d) { return d.id;});
    
        // create group of nodes
        var groupNodes = node.enter().append("g")
                .attr("class", function(d) {
                    if(d.hasChildren) return "node collapsible";
                    else return "node";
                })
                .attr("id", function (d) { return convertIp(d.id);})    
                .call(drag);
        
        // finds central node and adds special border (rectangle) to it
        groupNodes.filter(function(d) { return d.isCentral; }).append("rect")
                .attr("x", -3)
                .attr("y", -3)
                .attr("rx", 2)
                .attr("width", nodeWidth+6)
                .attr("height", nodeHeight+6)
                .style({"fill": "#fff", "stroke-width": 0.7, "stroke": "#000"});

        // Enter any new nodes and show them as rectangles
        groupNodes.append("rect")
                .attr("x", 0)//function(d) { return d.x; })
                .attr("y", 0)//function(d) { return d.y; })
                .attr("rx", 2)
                .attr("width", nodeWidth)
                .attr("height", nodeHeight)
                .style({"fill": color, "stroke-width": 0.7, "stroke": "#000"});  
            
        // ip address of node
        groupNodes.append("text")
                .attr("dx", nodeHeight/5)
                .attr("dy", nodeHeight - nodeHeight/3)
                .text(function(d) { return d.id;})
                .style("font-size",nodeHeight/2.2 + "px");
        
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
                .style({"fill": "#E7E8E9", "stroke-width": 0.7, "stroke": "#000"});
    
         collapsible.append("rect")
                .attr("class", "filter-nodes")
                .on("dblclick", filterNodes )
                .on("contextmenu", toggleNodes )
                .attr("x", nodeWidth - 1)
                .attr("y", function(d) { return nodeHeight - computeHeight(d);})
                .attr("width", nodeHeight)
                .attr("height", computeHeight)
                .style({"fill": "#9E9E9E", "stroke-width": 0.7, "stroke": "#000", "stroke-dasharray": 0+","+nodeHeight+","+nodeHeight*3});
            
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
                .style("font-size",nodeHeight + "px");       
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
        // if d is node and has nodeAttribute 0 at the same time / or is link (= does not have an id) and has linkAttribute 0
        if ( (nodeAttribute === 0 && d.id !== undefined) || (linkAttribute === 0 && d.id === undefined)) {
            var number = d.data;   
            var r, g, b, norm = (number - fullDataRange[0]) / (fullDataRange[1] - fullDataRange[0]);
            r = Math.round(norm * colorRange[1][0]   + (1 - norm) * colorRange[0][0]);
            g = Math.round(norm * colorRange[1][1] + (1 - norm) * colorRange[0][1]);
            b = Math.round(norm * colorRange[1][2]  + (1 - norm) * colorRange[0][2]);
        }
        
        // else if d has nodeAttribute or linkAttribute 1
       else {
            var number = d.flows;   
            var r, g, b, norm = (number - fullDataRange[0]) / (fullDataRange[1] - fullDataRange[0]);
            r = Math.round(norm * colorRange[0][0]   + (1 - norm) * colorRange[1][0]);
            g = Math.round(norm * colorRange[0][1] + (1 - norm) * colorRange[1][1]);
            b = Math.round(norm * colorRange[0][2]  + (1 - norm) * colorRange[1][2]);
        }
        return "rgb("+r+","+g+","+b+")";
    }
    
    // Get amount of hidden children for each node
    function computeHeight(d) {
        var height,
            norm,
            hiddenChildren = 0,
            allChildren = 0;
        
        if (d._children !== undefined) hiddenChildren = d._children.length;
        if (d.children !== undefined) allChildren = d.children.length;
        
        allChildren +=  hiddenChildren;
            
        norm = (hiddenChildren - 0) / (allChildren - 0);
        height = norm*nodeHeight;//Math.round(norm * nodeHeight   + (1 - norm) * nodeHeight);
        return height;   
    }

    // Filter children on double click.
    function filterNodes(d) {

        var options = {
            autoOpen: false,
            height: 300,
            width: 220,
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
        $(".contents #sortNodes").append("<input type='radio' name='sort' value='0'/><label data-labelfor='0'>Počty toků</label></br>");
        $(".contents #sortNodes").append("<input type='radio' name='sort' value='1'/><label data-labelfor='1'>Objem dat</label></br>");
        $(".contents #sortNodes").append("<input type='radio' name='sort' value='2'/><label data-labelfor='2'>Prefix</label></br>");
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
                updateColorRange(child);
            });
        }
        if(d.children) {
            // adds visible children
            d.children.forEach(function(child) {
                allChildren.push([]);
                allChildren[allChildren.length-1].push(child);
                allChildren[allChildren.length-1].push(true);
                updateColorRange(child);
            });
        }
                      
        //sort nodes in array
        if (sortingType == 0) 
            allChildren.sort(function(a, b){return a[0].flows > b[0].flows ? 1 : -1;});
        else if (sortingType == 1) 
            allChildren.sort(function(a, b){return a[0].data > b[0].data ? 1 : -1;});
        else 
            allChildren.sort(compareIPs);
            
        function compareIPs(a, b){
            // both addresses are IPv4
            if (a[0].id.indexOf('.') !== -1 && b[0].id.indexOf('.') !== -1) {
                var arrayA = a[0].id.split('.'),
                    arrayB = b[0].id.split('.');
            
                for (var i = 0; i < 4; i++) {
                    if (parseInt(arrayA[i]) > parseInt(arrayB[i]))
                        return 1;
                    else if (parseInt(arrayA[i]) < parseInt(arrayB[i]))
                        return -1;
                }
            }
            // both addresses are IPv6
            else if (a[0].id.indexOf(':') !== -1 && b[0].id.indexOf(':') !== -1) {
                var arrayA = a[0].id.split(':'),
                    arrayB = b[0].id.split(':');
            
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
            //one IPv6, one IPv4 -> TODO priority
            else {
                if (a[0].id.indexOf(':') !== -1)
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
        
        //var lastChecked = null;  
        checkboxes.click(function(event){
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
                    actualHiddenNode = actualHiddenNode[0];

                    //check all nodes for adjacency with actualHiddenNode
                    nodes.forEach(function(n) {
                       if (n.hasChildren) {
                           var commonChild = findNodeById(n._children, actualHiddenNode.id);
                           if (commonChild) {
                               n._children.splice($.inArray(commonChild[0], n._children),1);
                               n.children.push(commonChild[0]);
                           }
                       } 
                    });                   
                }
                // if this node should be hidden (is not checked) and is currently visible, we need to replace it
                else if ($(box).prop('checked') === false && actualVisibleNode !== undefined) {
                    actualVisibleNode = actualVisibleNode[0];
                    
                    //check all nodes for adjacency with actualVisibleNode
                    nodes.forEach(function(n) {
                        if (n.hasChildren) {
                            var commonChild = findNodeById(n.children, actualVisibleNode.id);
                            if (commonChild) {
                                n.children.splice($.inArray(commonChild[0], n.children),1);
                                n._children.push(commonChild[0]);
                            }
                        } 
                    });
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
            update();
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
                    obj1 = a.innerText;
                    obj2 = b.innerText;
                }
                    
                return obj1 > obj2 ? 1 : -1;
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
        //there are some visible children -> hide all
        if (d.children.length > 0) {
            
            //d.quick_toggle = d.children;
            d._children = $.merge(d._children, d.children);
            d.children = [];
            
            nodes.forEach(function(node) {
                if (node.hasChildren) 
                    d.quick_toggle.forEach(function(toggle) {
                        var commonChild = findNodeById(node.children, toggle.id);
                        if (commonChild) {
                            node.children.splice($.inArray(commonChild[0], node.children), 1);
                            node._children.push(commonChild[0]);
                        }
                    });               
            });
            
        }
        //all children are hidden -> show latest 'quick toggle' list 
        else {
            if (d.quick_toggle === undefined || d.quick_toggle.length === 0)
                d.quick_toggle = d._children;

            d.children = d.quick_toggle;
            d._children = d._children.filter( function( el ) {
                return d.quick_toggle.indexOf( el ) === -1;
            });
            
            nodes.forEach(function(node) {
                if (node.hasChildren) 
                    d.quick_toggle.forEach(function(child) {
                        var commonChild = findNodeById(node._children, child.id);
                        if (commonChild) {
                            node._children.splice($.inArray(commonChild[0], node._children), 1);
                            node.children.push(commonChild[0]);
                        }
                    });               
            });
        }
        
        links.forEach(function(link, i){
            if(d._children.indexOf(link.source) !== -1 || d._children.indexOf(link.target) !== -1) {
                links.splice(i);
            }
        });
        
        update();
    }       
    
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
        
        if (newData < fullDataRange[0])
                fullDataRange[0] = newData;
        else if (newData > fullDataRange[1])
                fullDataRange[1] = newData;
            
        if (newFlows < fullDataRange[0])
                fullDataRange[0] = newFlows;
        else if (newFlows > fullDataRange[1])
                fullDataRange[1] = newFlows;    
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
                    var childrenNodes = data.nodes;
                    var childrenEdges = data.edges;
                    childrenNodes.forEach(function(nChild) { 
                        //if nChild node is not central and is not visible 
                        if(findNodeById(nodes, nChild.id) === undefined) {
                            nChild.weight = 1;

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
    
    /**
     * 
     * Manipulation functions
     * 
     */
    
    // fix position of any node on dragstart and enable dragging
    function dragstart(d) {
        d3.event.sourceEvent.stopPropagation();
        d.fixed = true;
        d3.select(this).classed("fixed", true);
        force.start();
    }
    
    // on drag of specific nodes, positioning of their children is affected 
    function drag(d) {      
        d.px += d3.event.dx;
        d.py += d3.event.dy;
            
        if (d.hasChildren || d.isCentral) {
            setNodePosition(d, d3.event);
        }
    } 
    
    function setNodePosition(node, event) {
        // Node has visible children for moving
        if (node.children) {
            node.children.forEach(function (ch) {
                setNodePosition(ch, event);
                ch.px += event.dx;
                ch.py += event.dy;
            });
        }
        // node has hidden children that need to have their positions changed as well
        if (node._children) {
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
});
