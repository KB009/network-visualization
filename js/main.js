/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var w = $(window).width()-20,
    h = 800,
    node,
    nodeWidth = 80,
    nodeHeight = 25,
    link,
    root;

var force = d3.layout.force()
    .on("tick", tick)
    .charge(-500)
    .chargeDistance(1000)
    //.charge(function(d) { return d._children ? -d.size / 100 : -30; })
    .linkDistance(function(d) { return d.target._children ? 200 : 100; })
    .size([w, h - 160]);

var vis = d3.select("body").append("svg:svg")
    .attr("width", w)
    .attr("height", h);
    
var drag = force. drag()
        .on("dragstart",dragstart);

d3.json("sample.json", function(json) {
  root = json;
  root.fixed = true;
  root.x = w / 2;
  root.y = h / 2 - 80;
  update();
});

function update() {
  var nodes = flatten(root),
      links = d3.layout.tree().links(nodes);

  // Restart the force layout.
  force
      .nodes(nodes)
      .links(links)
      .start();

  // Update the links…
  link = vis.selectAll("line.link")
      .data(links, function(d) { return d.target.id; });

  // Enter any new links.
  link.enter().insert("svg:line", ".node")
      .attr("class", "link")
      .attr("x1", function(d) { return d.source.x + nodeWidth/2; })
      .attr("y1", function(d) { return d.source.y + nodeHeight/2; })
      .attr("x2", function(d) { return d.target.x + nodeWidth/2; })
      .attr("y2", function(d) { return d.target.y + nodeHeight/2; });

  // Exit any old links.
  link.exit().remove();

  // Update the nodes…
  node = vis.selectAll("rect.node")
      .data(nodes, function(d) { return d.id; })
      .enter().append("g")
      .attr("class", "node")
      .call(drag);

  /*node.transition()
      .attr("r", function(d) { return d.children ? 4.5 : Math.sqrt(d.size) / 10; });
    */
  // Enter any new nodes.
  node.append("rect")
      .attr("x", 0)//function(d) { return d.x; })
      .attr("y", 0)//function(d) { return d.y; })
      .attr("width", nodeWidth)
      .attr("height", nodeHeight)
      //.attr("r", function(d) { return d.children ? 4.5 : Math.sqrt(d.size) / 10; })
      .style("fill", color)
      .on("dblclick", click)
      .call(force.drag);
      
      node.append("text")
              .attr("dx", 5)
              .attr("dy", nodeHeight - 5)
              .text("1644658")
              .attr({"font-weight":"normal","font-size":"11px"});

  // Exit any old nodes.
  node.exit().remove();
}

function tick() {
  link.attr("x1", function(d) { return d.source.x + nodeWidth/2; })
      .attr("y1", function(d) { return d.source.y + nodeHeight/2; })
      .attr("x2", function(d) { return d.target.x + nodeWidth/2; })
      .attr("y2", function(d) { return d.target.y + nodeHeight/2; });

  node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
}

// Color leaf nodes orange, and packages white or blue.
function color(d) {
  return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
}

// Toggle children on click.
function click(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
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
    if (node.children) node.size = node.children.reduce(function(p, v) { return p + recurse(v); }, 0);
    if (!node.id) node.id = ++i;
    nodes.push(node);
    return node.size;
  }

  root.size = recurse(root);
  return nodes;
}

function dragstart(d) {
  d3.select(this).classed("fixed", d.fixed = true);
}    