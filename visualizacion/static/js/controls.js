function main(url) {
    /* Pide el grafo e inicializa la visualización */
    $.ajax({
        type: "GET",
        url: `${url}`,
        async: true
    }).done(function(result) {
        graph = JSON.parse(result);
        if (url.startsWith("/actor")) {
            loadActor(graph);
        }
        createSliders();
        initializeDisplay();
        initializeSimulation();
    });
}

function doUpdate(myData) {
    /* Creación del shortest path */
    $(document).prop("title", `Grados de Separación`);
    if (!myData["nodes"]) {
        $("#content").html("Los actores no están unidos en este grafo");
    } else {
        $("#content").html("");
        var gallery = d3.select('#content');
        var container = gallery.selectAll('.nodes')
            .data(myData["nodes"]);

        var node = container.enter().append('div')
            .attr('class', 'nodes')
            .on("dblclick", function(d) {
                window.open(d["url"])
            })

        container.exit().remove();

        node.append('img')
            .attr('class', 'picture')
            .attr('style', 'float:left')
            .attr('src', function(d) { return d["photo"]; });
        }
        node.append('p')
            .attr('class', 'text')
            .text(function(d) { return d["id"]; });

}

function createSliders() {
    /* Inicializa los sliders */
    $(".sliders").each(function(i, k) {
        $(this).slider({
            orientation: "vertical",
            range: "min",
            min: parseFloat($(this).attr("min")),
            max: parseFloat($(this).attr("max")),
            step: parseFloat($(this).attr("step")),
            value: parseFloat($(this).attr("val")),
            slide: function(event, ui) {
                $(this).parent().children("p").children(".value").val( ui.value );
            },
            stop: function() {
                updateForceProperties();
            }
        });
        $(this).parent().children("p").children(".value").val($(this).slider("value"));
    });
}

$(document).on("click", "#submit-spath", function() {
    src = $("input#src").val();
    tar = $("input#tar").val();
    if (src != "" & tar != "") {
        $.ajax({
            type: "POST",
            url: "/shortestPath",
            data: {"source": src, "target": tar},
            async: false
        }).done(function(result) {
            doUpdate(JSON.parse(result));
        });
    }
});

$(document).on('keypress', '.form-control', function(e) {
    if(e.which == 13) {
        $("#submit-spath").trigger("click");
    }
});

$(document).on("keyup", "input.form-control", function(e){
    where = e.target
    input = e.target.value
    if (input.length > 2) {
        $.ajax({
            type: "GET",
            url: "/suggest",
            data: {"input": input},
            async: true
          }).done(function(result) {
            json_result = JSON.parse(result);
            $(where).autocomplete({"source": json_result["source"]});
          });
    }
});


function loadActor() {
    if (actor === undefined) {
        actor = graph.name;
        $("#act-name").text(`Subgrafo de ${actor}`);
        $(document).prop("title", `Subgrafo - ${actor}`);
    }
};

$("#new-actor").on("keypress", function(e) {
    if(e.which == 13) {
        actor = $(this).val();
        window.location.href = `/relations?actor=${actor}`;
    }
});
