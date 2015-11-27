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
        nodeWidth = 90,
        nodeHeight = 25,
        links,
        childrenLinks = [],
        root;

    var force = d3.layout.force()
        .on("tick", tick)
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
        
        nodes.forEach(function(n) {
            nodeIds.push(n.id);
            links.forEach(function(l) {
                if (l.from === n.id)
                    l.source = n;
                else if (l.to === n.id)
                    l.target = n;
            });

            childrenLinks.forEach(function(childLink) {
                //if(nodeIds.indexOf(childLink.from) !== -1 && nodeIds.indexOf(childLink.to) !== -1) {
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
                    if(d.hasChildren) 
                        return "node collapsible";
                    else 
                        return "node";
                })
                .attr("id", function (d) { return d.id;})
                .on("dblclick", function(d) {if (d.hasChildren) click(d);})
                .call(force.drag);

        // Enter any new nodes.
        groupNodes.append("rect")
                .attr("x", 0)//function(d) { return d.x; })
                .attr("y", 0)//function(d) { return d.y; })
                .attr("width", nodeWidth)
                .attr("height", nodeHeight)
                .style("stroke-dasharray", function(d){
                    if(d.isCentral)
                        return "5,5";
                })
                .style("fill", color);          
    
        groupNodes.append("rect")
                .attr("x", nodeWidth)
                .attr("y", 0)
                .attr("width", nodeHeight)
                .attr("height", nodeHeight)
                .style("fill", "#b2b2b2");
    
        //name of node
        groupNodes.append("text")
                .attr("dx", 5)
                .attr("dy", nodeHeight - 5)
                .text(function(d) { return d.id;})
                .style("font-size","11px");
           
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

    function color() {
        return "#e1e1e1";
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

    function dragstart(d) {
        d3.select(this).classed("fixed", d.fixed = true);
    } 
});