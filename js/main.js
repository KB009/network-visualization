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

    var drag = force.drag()
        .on("dragstart", dragstart);

    d3.json("data/sample.json", function (json) {
    root = json;
    root.fixed = true;
    root.x = w / 2;
    root.y = h / 2 - 80;
    update();
});
    
    function update() {
        nodes = flatten(root)[0].nodes;
        links = flatten(root)[0].edges;
    
    links.forEach(function(d) {
        nodes.forEach(function(e) {
            e.weight = 1;
            if (d.from === e.id)
                d.source = e;
            else if (d.to === e.id)
                d.target = e;
        });
    });
    
    // Restart the force layout.
    force.nodes(nodes)
            .links(links)
            .start();

    // Update the links…
    link = vis.selectAll(".link")
            .data(links, function (d) {return (d.from + d.to);})
            .enter().append("g")
            .attr("class", "link")
            .append("line")
            .attr("class", "link-line")
            .style("stroke-width", 2);
       
    // Exit any old links.
 
    // Update the nodes…
    node = vis.selectAll("g.node")
            .data(nodes, function (d) { return d.id;});
    
    var group_nodes = node.enter().append("g")
            .attr("class", "node")
            .attr("id", function (d) { return d.id;})
            //.on("dblclick", click)
            .call(force.drag);

    // Enter any new nodes.
    group_nodes.append("rect")
            .attr("x", 0)//function(d) { return d.x; })
            .attr("y", 0)//function(d) { return d.y; })
            .attr("width", nodeWidth)
            .attr("height", nodeHeight)
            .style("fill", color);          
    
    group_nodes.append("rect")
            .attr("x", nodeWidth)
            .attr("y", 0)
            .attr("width", nodeHeight)
            .attr("height", nodeHeight)
            .style("fill", "#b2b2b2");
    
    //name of node
    group_nodes.append("text")
            .attr("dx", 5)
            .attr("dy", nodeHeight - 5)
            .text(function(d) { return d.id;})
            .style("font-size","11px");
    
    // Exit any old nodes.
    node.exit().remove();
}

    function tick() {
    link.attr("x1", function (d) { return d.source.x + nodeWidth / 2;})
            .attr("y1", function (d) { return d.source.y + nodeHeight / 2;})
            .attr("x2", function (d) { return d.target.x + nodeWidth / 2;})
            .attr("y2", function (d) { return d.target.y + nodeHeight / 2;});
        
    node.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")";});
}

    function color() {
        return "#e1e1e1";
    }

    // Toggle children on click.
    /*function click(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
        update();
    } else {
        d.children = d._children;
        d._children = null;
        update();
    }
    update();
}*/

    // Returns a list of all nodes under the root.
    function flatten(root) {
    var nodes = [], i = 0;

    function recurse(node) {
        if (node.children)
            node.size = node.children.reduce( function (p, v) {return p + recurse(v);}, 0);
        if (!node.id)
            node.id = ++i;
        nodes.push(node);
        return node.size;
    }

    root.size = recurse(root);
    return nodes;
}

    function dragstart(d) {
        d3.select(this).classed("fixed", d.fixed = true);
    } 
});