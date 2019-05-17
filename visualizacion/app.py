import json
import math
from flask import Flask, render_template, request
from graph_class import MyGraph
from random import random

g = MyGraph('static/data/IMDB_graph.json')

app = Flask(__name__)

@app.route("/")
def main():
    return render_template("index.html", title="Grafo Top 100 IMDB")

@app.route("/graph", methods=['GET'])
def returnGraph():
    return json.dumps(g.export_to_d3())

@app.route("/actor", methods=['GET'])
def returnActorGraph():
    actor =  request.args.get('actor')
    if not actor:
        length = len(list(g.relations.keys()))
        pos = math.floor(random() * length)
        actor = list(g.relations.keys())[pos]
    subgraph = g.export_actor(actor)
    subgraph["name"] = actor
    return json.dumps(subgraph)

@app.route("/relations", methods=['GET'])
def returnRelations():
    try:
        actor =  request.args.get('actor')
    except:
        actor = ""
    return render_template("relations.html", actor=actor, title="Sugrafo -")

@app.route("/shortestPath", methods=['GET', 'POST'])
def pageShortest():
    method = request.method
    if method == "POST":
        src = request.form['source']
        tar = request.form['target']
        return g.sh_path(src, tar)
    else:
        return render_template("shortest.html", title="Grados de Separación")


@app.route("/suggest")
def make_suggestion():
    input = request.args.get('input').lower()
    result = [name for name in list(g.nodes) if name.lower().startswith(input)]
    response = {"source": result}
    return json.dumps(response)

if __name__ == "__main__":
    app.run()
