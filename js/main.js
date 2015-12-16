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
        colorRange = [[250,250,75], [0,150,255]], //color range in format: [from[R,G,B], to[R,G,B]] 
        fullDataRange = [Number.MAX_VALUE,0],
        fullFlowsRange = [Number.MAX_VALUE,0],        
        nodeWidth = 90,
        nodeHeight = 25,
        links,
        childrenLinks = [],
        root;

    var force = d3.layout.force()
        .on("tick", tick)
        .on("end", end)
        .charge(-1000)
        .chargeDistance(1000)
        .linkDistance(function (d) {return d.target._children ? 150 : 120;})
        .size([w, h - 160]);
    
    var vis = d3.select("body").append("svg:svg")
        .attr("width", w)
        .attr("height", h);

    d3.json("data/sample.json", function (json) {
        root = json;
        root.fixed = true;
        root.x = w / 2;
        root.y = h / 2 - 80; 
        var allNodesLength = root.nodes.length; //excluding children
        var allNodesIds = [];
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
              
        //bind doubleclick for specific nodes to be collabsible
        //vis.selectAll(".collapsible").on("dblclick", click);
        // Restart the force layout.
             
        var nodeIds = [], linkIds = [];
        
        // we need to iterate through all visible nodes and links in order to connect links with their nodes (we need objects in links, not only ids)
        fullDataRange = [Number.MAX_VALUE,0];
        fullFlowsRange = [Number.MAX_VALUE,0];
        
        nodes.forEach(function(n) {
            nodeIds.push(n.id);
            
            // get range of data from every VISIBLE nodefullDataRange = [0,1],
            var nodeData = n.data;
            if (nodeData < fullDataRange[0])
                fullDataRange[0] = nodeData;
            else if (nodeData > fullDataRange[1])
                fullDataRange[1] = nodeData;
            
            // get range of flows from every VISIBLE node 
            var nodeFlows = n.flows;
            if (nodeFlows < fullFlowsRange[0])
                fullFlowsRange[0] = nodeFlows;
            else if (nodeFlows > fullFlowsRange[1])
                fullFlowsRange[1] = nodeFlows;
            
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
                .attr("class", "link-line")
                .style("stroke-width", 2);

        circle = vis.selectAll(".link")
                .append("circle")
                .attr("class","info")
                .attr("cx", 100)
                .attr("cy", 100)
                .attr("r", 5)
                .style({"fill": color, "stroke-width": 2}); 
                    
        // Update the nodes…
        node = vis.selectAll("g.node")
            .data(nodes, function (d) { return d.id;});
    
        var groupNodes = node.enter().append("g")
                .attr("class", function(d) {
                    if(d.hasChildren) return "node collapsible";
                    else return "node";
                })
                .attr("id", function (d) { return d.id;})
                .on("dblclick", function(d) {if (d.hasChildren) click(d);})
                .call(force.drag);
        
        // finds central node and adds special border (rectangle) to it
        groupNodes.filter(function(d) { return d.isCentral; }).append("rect")
                .attr("x", -3)
                .attr("y", -3)
                .attr("width", nodeWidth+6)
                .attr("height", nodeHeight+6)
                .style("fill", "#fff");

        // Enter any new nodes and show them as rectangles
        groupNodes.append("rect")
                .attr("x", 0)//function(d) { return d.x; })
                .attr("y", 0)//function(d) { return d.y; })
                .attr("width", nodeWidth)
                .attr("height", nodeHeight)
                .style("fill", color);  
            
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
                .attr("x", nodeWidth)
                .attr("y", 0)
                .attr("width", nodeHeight)
                .attr("height", nodeHeight)
                .style("fill", "#b2b2b2");
    
        // + or - sign for node
        collapsible.append("text")
                .attr("dx", nodeWidth + 5)
                .attr("dy", nodeHeight - 5)
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
    link.attr("x1", function (d) { return d.source.x + nodeWidth / 2;})
            .attr("y1", function (d) { return d.source.y + nodeHeight / 2;})
            .attr("x2", function (d) { return d.target.x + nodeWidth / 2;})
            .attr("y2", function (d) { return d.target.y + nodeHeight / 2;});

    circle.attr("cx", function(d) { return (d.source.x + nodeWidth/2 + d.target.x + nodeWidth/2) /2;})
            .attr("cy", function(d) { return (d.source.y + nodeHeight/2 + d.target.y + nodeHeight/2) /2;});
          
    node.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")";});
}

    function color(d) {
        if (nodeAttribute === 0) {
            var number = d.data;   
            var r, g, b, norm = (number - fullDataRange[0]) / (fullDataRange[1] - fullDataRange[0]);
            r = Math.round(norm * colorRange[0][0]   + (1 - norm) * colorRange[1][0]);
            g = Math.round(norm * colorRange[0][1] + (1 - norm) * colorRange[1][1]);
            b = Math.round(norm * colorRange[0][2]  + (1 - norm) * colorRange[1][2]);
        }
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
        if (d.children) {
            d._children = d.children;
            d.children = null;
            links.forEach(function(link, i){
                if(d._children.indexOf(link.source) !== -1 || d._children.indexOf(link.target) !== -1) {
                    links.splice(i);
                }
            });
        } else {
            d.children = d._children;
            d._children = null;
        }
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
    /*
    function dragstart(d) {
        d3.select(this).classed("fixed", d.fixed = true);
    }*/
    
    function end() {
        for (var i = 0; i < nodes.length; i++) {
                    nodes[i].fixed = true;
        }
    }
});