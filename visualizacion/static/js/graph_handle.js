function updateDisplay() {
    circles
        .attr("r", function(d) {
            return calculateSize(d) + fProp.collide.radius;
        })
        .attr("fill", function (d, i) {
            return selectColor(d);
        })
    link
        .style("stroke-width", function(d,i) {
            return calculateLink(d);
        })
}
