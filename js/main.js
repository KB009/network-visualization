/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

$(window).load(function () {   
    var w = $(window).width() - 20,
        h = 800,
        link,
        node,
        nodes,
        circle, 
        nodeAttribute = 0, // mapping colors on nodes - 0 for data, 1 for flows
        linkAttribute = 0, // mapping colors on links - 0 for data, 1 for flows
        colorRange = [[250,250,75], [0,150,255]], //color range in format: [from[R,G,B], to[R,G,B]] 
        fullDataRange = [Number.MAX_VALUE,0], //maximal range for data (nodes) TODO: add links data
        fullFlowsRange = [Number.MAX_VALUE,0], //maximal range for data (nodes) TODO: add links flows
        lineSize = 2,
        nodeSize = 1,
        nodeWidth = 90 * nodeSize,
        nodeHeight = 25 * nodeSize,
        links,
        childrenLinks = [],
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

    var force = d3.layout.force()
        .on("tick", tick)
        .on("end", end)
        .charge(-1000)
        .chargeDistance(1000)
        .linkDistance(function (d) {return d.target._children ? nodeWidth * 1 : nodeWidth * 2 ;}) //TODO: should link distance be dependent on nodeSize or constant?
        .size([w, h - 160]);
    
    var vis = d3.select("body").append("svg:svg")
        .attr("width", w)
        .attr("height", h);

    d3.json("data/sample.json", function (json) {
        root = json;
        root.fixed = true;
        root.x = w / 2;
        root.y = h / 2 - 80; 
        var allNodesLength = root.nodes.length; // excluding children
        var allNodesIds = []; // including children
        var currentNodes = 0;
        
        root.nodes.forEach(function (node) {
            allNodesIds.push(node.id);
            node.weight = 1;         
        }); 
        
        root.nodes.forEach(function (node) {
            d3.json("data/"+node.id+".moreData.json", function(error, json){
                if (error === null && json !== null) {
                    node.hasChildren = true;
                    var childrenNodes = json.nodes;
                    var childrenEdges = json.edges;
                    childrenNodes.forEach(function(nChild) {                       
                        if(allNodesIds.indexOf(nChild.id) === -1) {
                            allNodesIds.push(nChild.id);
                            nChild.weight = 1;
                            if(node._children)
                                node._children.push(nChild);
                            else
                                node._children = [nChild];
                        }
                    });
                    
                    childrenEdges.forEach(function(eChild) {
                        childrenLinks.push(eChild);    
                    });
                }
                currentNodes++;
                if (currentNodes === allNodesLength)  
                    update();
            });
        }); 
    });
    
    function update() {
        nodes = flatten(root.nodes);
        links = root.edges;
                
        vis.selectAll(".link").remove();
        vis.selectAll(".node").remove();
             
        var nodeIds = [], linkIds = [];
        
        // on update reset max and min values in force
        fullDataRange = [Number.MAX_VALUE,0];
        fullFlowsRange = [Number.MAX_VALUE,0];
        
        // we need to iterate through all visible nodes and links in order to connect links with their nodes (we need objects in links, not only ids)
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
                // if(nodeIds.indexOf(childLink.from) !== -1 && nodeIds.indexOf(childLink.to) !== -1) {
                    if (childLink.from === n.id) {
                        childLink.source = n;
                    }
                    else if (childLink.to === n.id) {
                        childLink.target = n;
                    }
                //}
            });          
        });
                    
        childrenLinks.forEach(function(childLink) {
           if(nodeIds.indexOf(childLink.from) !== -1 && nodeIds.indexOf(childLink.to) !== -1) {
               if(linkIds.indexOf(childLink.from+", "+childLink.to) === -1)
                    linkIds.push(childLink.source.id+", "+childLink.target.id);
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
                .style({"stroke-width": lineSize+2, "stroke": "#000"});
        
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
                .style({"fill": color, "stroke-width": 1, "stroke": "#000"});
                    
        // Update the nodes…
        node = vis.selectAll("g.node")
            .data(nodes, function (d) { return d.id;});
    
        // create group of nodes
        var groupNodes = node.enter().append("g")
                .attr("class", function(d) {
                    if(d.hasChildren) return "node collapsible";
                    else return "node";
                })
                //.attr("id", function (d) { return "ip-"+d.id.replace(/\./g, '-');})
                .attr("id", function (d) { return convertIp(d.id);})    
                //.on("dblclick", function(d) {if (d.hasChildren) click(d);})
                .call(force.drag);
        
        // finds central node and adds special border (rectangle) to it
        groupNodes.filter(function(d) { return d.isCentral; }).append("rect")
                .attr("x", -3)
                .attr("y", -3)
                .attr("width", nodeWidth+6)
                .attr("height", nodeHeight+6)
                .style({"fill": "#fff", "stroke-width": 1, "stroke": "#000"});

        // Enter any new nodes and show them as rectangles
        groupNodes.append("rect")
                .attr("x", 0)//function(d) { return d.x; })
                .attr("y", 0)//function(d) { return d.y; })
                .attr("width", nodeWidth)
                .attr("height", nodeHeight)
                .style({"fill": color, "stroke-width": 1, "stroke": "#000"});  
            
        // ip address of node
        groupNodes.append("text")
                .attr("dx", nodeHeight/5)
                .attr("dy", nodeHeight - nodeHeight/3)
                .text(function(d) { return d.id;})
                .style("font-size",nodeHeight/2.2 + "px");
        
        //find only collapsible nodes
        var collapsible = vis.selectAll("g.collapsible");
          
        // collapsible button in node
        collapsible.append("rect")
                .on("dblclick", function(d) {if (d.hasChildren) click(d);})
                .attr("x", nodeWidth)
                .attr("y", 0)
                .attr("width", nodeHeight)
                .attr("height", nodeHeight)
                .style({"fill": "#b2b2b2", "stroke-width": 1, "stroke": "#000"});
    
        // + or - sign for node
        collapsible.append("text")
                .on("dblclick", function(d) {if (d.hasChildren) click(d);})
                .attr("dx", nodeWidth + nodeHeight/7)
                .attr("dy", nodeHeight - nodeHeight/5)
                .text(function (d) {
                    if (d._children === null) return "-";
                    else return "+";
                })
                .style("font-size",nodeHeight + "px");
           
        force.nodes(nodes)
                .links(links)
                .start();
        
    }

    function tick() {   
        // translate position of every link and node in svg
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

    // Toggle children on click.
    function click(d) {
        //finds actual node to compute its position
        //var position = "#ip-"+d.id.replace(/\./g, '-');
        var position = "#"+convertIp(d.id);
        
        var options = {
            autoOpen: false,
            height: 300,
            width: 220,
            resizable: false,
            modal: false,
            dialogClass: 'children-selector',
            position: { at: "right bottom+" + nodeHeight * 1.2, my: "left top", of: position }
        };   
        
        $( "#dialog" ).dialog(options).dialog( "open" );
    
        $('body').bind('click', function(e) {
            if($('#dialog').dialog('isOpen')
                && !$(e.target).is('.ui-dialog, a')
                && !$(e.target).closest('.ui-dialog').length
            ) {
                $('#dialog').dialog('close');                
            }
        });
        
        //clear previous content
        $(".contents").empty();
        
        //append new content
        $(".contents").append("<p style='float:left'>Seřadit podle:</p>");
        $(".contents").append("<input type='radio' name='sort' value='0'/><label data-labelfor='0'>Počty toků</label></br>");
        $(".contents").append("<input type='radio' name='sort' value='1'>Objem dat</input></br>");
        $(".contents").append("<input type='radio' name='sort' value='2'>Prefix</input></br>");
        $(".contents").append('<input type="checkbox" id="selectAll" name="selectAll">');
        $(".contents").append('<button type="submit" id="submit" name="submit">Zobrazit vybrané</button>');
        $(".contents").append("<table class='filter-children'>");
        
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
            // adds shown children
            d.children.forEach(function(child) {
                allChildren.push([]);
                allChildren[allChildren.length-1].push(child);
                allChildren[allChildren.length-1].push(true);
                updateColorRange(child);
            });
        }
        
        //appends all children into modal window
        allChildren.forEach(function(child) {
            var checkbox = '<input type="checkbox" id="' + convertIp(child[0].id) + 'VisibleCheckbox" name="'  + child[0].id + '">';
            var checkbox;
            if (child[1] === true) 
                checkbox = '<input type="checkbox" id="' + convertIp(child[0].id) + 'VisibleCheckbox" name="'  + child[0].id + '" checked>';
            else 
                checkbox = '<input type="checkbox" id="' + convertIp(child[0].id) + 'VisibleCheckbox" name="'  + child[0].id + '">';
            
            var styleColor = 'style="background-color:' + color(child[0]) + '"';
            $(".contents table").append("<tr " + styleColor + "><td>" + checkbox + "</td><td><label data-labelfor='" + convertIp(child[0].id) + "VisibleCheckbox'>" + child[0].id + "</label></td></tr>");
        });
        
        $(".contents").append("</table>");
            
        // select/diselecet all nodes
        $('#dialog #selectAll').on('click',function(){
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
        
        // select/diselect main checkbox according to number of selected nodes
        $('#dialog table :checkbox').on('click',function(){
            if($('#dialog table :checkbox:checked').length === $('#dialog table :checkbox').length){
                $('#dialog #selectAll').prop('checked',true);
            }else{
                $('#dialog #selectAll').prop('checked',false);
            }
        });
        
        //trigger click on labels
        $("[data-labelfor]").click(function() {
            $('#' + $(this).attr("data-labelfor")).prop('checked', function(i, oldVal) { 
                return !oldVal; 
            });
        });
        
        // on click on submit button update force with new nodes
        $("#dialog #submit").click(function() {
            $('#dialog table :checkbox').each(function(i, box) {
                var actualHiddenNode = findNodeById(d._children, $(box).prop('name'));
                var actualVisibleNode = findNodeById(d.children, $(box).prop('name'));
                if ($(box).prop('checked') === true) {                                       
                    if (actualHiddenNode !== undefined) {
                        d._children.splice($.inArray(actualHiddenNode, d._children),1);

                        if (d.children === undefined) { 
                            d.children = [];
                        }
                        d.children.push(actualHiddenNode);
                    }
                }
                else {
                    if (actualVisibleNode !== undefined) {
                        d.children.splice($.inArray(actualVisibleNode, d.children),1);
                        //links to hidden children must be deleted manually 
                        links.forEach(function(link, i){
                            if(d._children.indexOf(link.source) !== -1 || d._children.indexOf(link.target) !== -1) {
                                links.splice(i);
                            }
                        });
                        if (d._children === undefined) { 
                            d._children = [];
                        }
                        d._children.push(actualVisibleNode);
                    }
                    
                }
            });
            update();
            $('#dialog').dialog('close'); 
        });
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
                    return actualNodes[i];
            }
        }
    }
});
