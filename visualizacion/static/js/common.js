var graph, link, node, svg, width, height, actor, container;

$(document).ready(function () {
    svg = d3.select("svg");
    svg.call(d3.zoom().on("zoom", zoomed)).call(responsivefy);
    container = svg.append("g")
    width = +svg.node().getBoundingClientRect().width,
    height = +svg.node().getBoundingClientRect().height,
    pattern_def = svg.append("defs");

});

function zoomed() {
    container.attr("transform", "translate(" + d3.event.transform.x + ", " + d3.event.transform.y + ") scale(" + d3.event.transform.k + ")");
}

var simulation = d3.forceSimulation();

function initializeSimulation() {
    simulation.nodes(graph.nodes);
    initializeForces();
    simulation.on("tick", ticked);
}

fProp = {
    center: {x: 0.5, y: 0.5},
    charge: {enabled: true, strength: -30, distanceMin: 1, distanceMax: 500},
    collide:{enabled: true, strength: .7, iterations: 1, radius: 5},
    link:   {enabled: true, distance: 30, iterations: 1}
}

function updateForceProperties() {
    fProp = {
        center: {
            x: parseFloat($("#center-x").val()),
            y: parseFloat($("#center-y").val())
        },
        charge: {
            enabled: true,
            strength: parseFloat($("#charge-str").val()),
            distanceMin: parseFloat($("#charge-min").val()),
            distanceMax: parseFloat($("#charge-max").val())
        },
        collide: {
            enabled: true,
            strength: parseFloat($("#coll-str").val()),
            iterations: parseFloat($("#coll-i").val()),
            radius: parseFloat($("#coll-r").val())
        },
        link: {
            enabled: $("#link-chbx").is(":checked"),
            distance: 30,
            iterations: 1
        }
    }
}

function initializeForces() {
    simulation
        .force("link", d3.forceLink())
        .force("charge", d3.forceManyBody())
        .force("collide", d3.forceCollide())
        .force("center", d3.forceCenter())
    updateForces();
}

var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

function initializeDisplay() {
    link = container.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line");

    node = container.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(graph.nodes)
        .enter().append("g")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    circles = node.append("circle")
        .on("mouseover", function(d) {
            var scope_d = d;
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html(d['id'])
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 28 - calculateSize(d)) + "px")
                .style('background', selectColor(d));
            div.append("img")
                .attr("src", function() { return scope_d["photo"]} )
        })
        .on("mouseout", function(d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .on("dblclick", function(d) {
            window.open(d['url']);
        })

    updateDisplay();
}

function updateDisplay() {
    circles
        .attr("r", function(d) {
            return calculateSize(d) + fProp.collide.radius;
        })
        .attr("fill", function (d, i) {
            return selectColor(d);
        })
    link
        .attr("stroke-width", function(d,i) {
            return 0.5 * d["weight"];
        })
}

function ticked() {
    updateAll();
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        })
}

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0.001);
  d.fx = null;
  d.fy = null;
}

d3.select(window).on("resize", function(){
    width = +svg.node().getBoundingClientRect().width;
    height = +svg.node().getBoundingClientRect().height;
    updateForces();
});

function updateAll() {
    updateForces();
    updateDisplay();
}

var color = d3.scaleOrdinal(d3.schemeCategory20);
var scaleBetw = d3.scaleLinear().domain([0, 0.16]).range([1,25]);
var scaleClos = d3.scaleLinear().domain([0.01, 0.23]).range([1,15]);
var scaleEBetw = d3.scaleLinear().domain([6e-7, 0.23]).range([10,20]);
var scaleWeight = d3.scaleLinear().domain([1, 3]).range([19,20]);

function updateForces() {
    updateForceProperties()
    simulation.force("center")
        .x(width * fProp.center.x)
        .y(height * fProp.center.y);
    simulation.force("charge")
        .strength(fProp.charge.strength * fProp.charge.enabled)
        .distanceMin(fProp.charge.distanceMin)
        .distanceMax(fProp.charge.distanceMax);
    simulation.force("collide")
        .strength(fProp.collide.strength * fProp.collide.enabled)
        .radius(function(d) {
            return (fProp.collide.radius + calculateSize(d) + 5);
        })
        .iterations(fProp.collide.iterations);
    simulation.force("link")
        .id(function(d) {return d.id;})
        .distance(fProp.link.distance)
        .iterations(fProp.link.iterations)
        .links(graph.links);

    simulation.alpha(1);
}

function initializeDisplay() {
    link = container.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph["links"])
        .enter().append("line")
        .style("stroke-width", function(d) {
            return Math.sqrt(d.eb*500);
        })

    node = container.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(graph.nodes)
        .enter().append("g")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    circles = node.append("circle")
        .on("mouseover", function(d) {
            var scope_d = d;
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html(d['id'])
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 28 - calculateSize(d)) + "px")
                .style('background', selectColor(d));
            div.append("img")
                .attr("src", function() { return scope_d["photo"]} )
        })
        .on("mouseout", function(d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .on("dblclick", function(d) {
            window.open(d['url']);
        })

  updateDisplay();
}

function calculateSize(d) {
    var option = $("#size-select").val();
    switch (option) {
        case "betweenness":
            value = scaleBetw(d["betweenness"]);
            break;
        case "closeness":
            value = scaleClos(d["closeness"]);
            break;
        default:
            value = 1;
            break;
    }
    return value;
}

function selectColor(d) {
    var option = $("#color-select").val();
    switch (option) {
        case "comm":
            value =  color(d["community"]);
            break;
        default:
            value = "green";
            break;
    }
    return value;
}

function calculateLink(d) {
    var option = $("#link-select").val();
    switch (option) {
        case "eb":
            value =  Math.sqrt(d["eb"]*10000);
            break;
        case "weight":
            value =  d["weight"];
            break;
        default:
            value = 1;
            break;
    }
    return value;
}

function responsivefy(svg) {
    // get container + svg aspect ratio
    var container = d3.select(svg.node().parentNode),
    width = parseInt(svg.style("width")),
    height = parseInt(svg.style("height")),
    aspect = width / height;

    // add viewBox and preserveAspectRatio properties,
    // and call resize so that svg resizes on inital page load
    svg.attr("viewBox", "0 0 " + width + " " + height)
        .attr("perserveAspectRatio", "xMinYMid")
        .call(resize);

    // to register multiple listeners for same event type,
    // you need to add namespace, i.e., 'click.foo'
    // necessary if you call invoke this function for multiple svgs
    // api docs: https://github.com/mbostock/d3/wiki/Selections#on
    d3.select(window).on("resize." + container.attr("id"), resize);

    // get width of container and resize svg to fit it
    function resize() {
        var targetWidth = parseInt(container.style("width"));
        svg.attr("width", targetWidth);
        svg.attr("height", Math.round(targetWidth / aspect));
    }
}