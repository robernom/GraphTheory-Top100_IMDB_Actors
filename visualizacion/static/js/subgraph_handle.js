function updateDisplay() {
    circles
        .attr("r", function(d) {
            return calculateSize(d) + fProp.collide.radius;
        })
        .attr("fill", function(d) {
            return selectColor(d);
        })
        .style("stroke-width", function(d) {
            return d["id"] == actor ? 4 : 1;
        })
        .attr("class", function(d) {
            return d["id"] == actor ? "main" : "";
        })
    link
        .style("stroke-width", function(d) {
            return calculateLink(d);
        })
}
