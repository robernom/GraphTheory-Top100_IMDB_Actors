import networkx as nx
from networkx.readwrite import json_graph
import json

class MyGraph():
    def parse_data(self, filename):
        """Crea el grafo compatible con D3JS."""
        with open(filename, 'r') as f:
            self.js_graph = json.load(f)
        return json_graph.node_link_graph(self.js_graph)

    def export_to_d3(self):
        """Devuelve el grafo compatible con D3JS."""
        return self.js_graph

    def export_actor(self, actor):
        """Genera el subgrafo dado un actor."""
        elements = [actor]
        for k, v in self.relations[actor]["partners"].items():
            elements.append(k)
        sg_actor = self.graph.subgraph(elements)
        g_actor = nx.Graph()
        g_actor.add_edges_from(sg_actor.edges)
        for a in sg_actor:
            g_actor.node[a]["url"] = self.graph.node[a]["url"]
            g_actor.node[a]["photo"] = self.graph.node[a]["photo"]
            g_actor.node[a]["betweenness"] = self.graph.node[a]["betweenness"]
            g_actor.node[a]["closeness"] = self.graph.node[a]["closeness"]
            g_actor.node[a]["community"] = self.graph.node[a]["community"]
            if actor != a:
                g_actor[actor][a]["eb"] = self.graph[actor][a]["eb"]
                g_actor[actor][a]["weight"] = self.graph[actor][a]["weight"]

        return json_graph.node_link_data(g_actor)

    def sh_path(self, src, tar):
        """Devuelve uno de los posibles caminos más cortos entre dos actores."""
        try:
            path = nx.shortest_path(self.graph, src, tar)
            data = {"nodes": []}
            for actor in path:
                data["nodes"].append({"id": actor,
                                      "photo": self.graph.node[actor]["photo"],
                                      "url": self.graph.node[actor]["url"]})
        except:
            data = {}
        return json.dumps(data)

    def __init__(self, filename):
        self.filename = filename
        self.graph = self.parse_data(filename)
        self.nodes = self.graph.nodes
        self.edges = self.graph.edges
        with open("static/data/IMDB_data.json", 'r') as f:
            self.relations = json.load(f)

    def __str__(self):
        return "Grafo %s" % self.filename
