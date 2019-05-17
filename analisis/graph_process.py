import json
import networkx as nx
import networkx.algorithms.community as nxComm
from networkx.readwrite import json_graph

def json2graph(file):
    g = nx.Graph()  # Grafo vacío
    with open(file, 'r') as f:
        data = f.read()
    data_json = json.loads(data)
    """
    data_json = {
        <Nombre_Actor1>: {
            photo: url_img,
            url: url,
            partners: [
                <Relacion1>: {
                    weight: N,
                    films: [<Película1>,...<PelículaN>]
                },
                ...
                <RelacionN>: {
                    weight: N,
                    films: [<Película1>,...<PelículaN>]
                }
            ]
        },
        <Nombre_Actor2>: {...}, ...
    }
    """
    for actor, attrs in data_json.items():
        nodes = {}  # Diccionario para añadir a cada nodo url e imagen
        edges = []  # Array de aristas
        nodes[actor] = {"photo": attrs["photo"], "url": attrs["url"]}
        for key, props in attrs["partners"].items():
            edges.append((actor, key, {'weight': props["weight"], 'films': props["film"]}))
        g.add_edges_from(edges)
        for node, attrs in nodes.items():
            g.node[node]["photo"] = attrs["photo"]
            g.node[node]["url"] = attrs["url"]
    return g

if __name__ == '__main__':
    g = json2graph("../datos/IMDB_data.json")
    # Detección de comunidades
    commGreedy = list(nxComm.greedy_modularity_communities(g))
    # Calculo de closeness
    closeness = nx.closeness_centrality(g)
    # Cálculo de betweenness
    betweenness = nx.betweenness_centrality(g)
    edgebetwenness = nx.edge_betweenness(g)
    idComm = 1
    for c in commGreedy:
        for node in c:
            g.nodes[node]['community'] = idComm
            g.nodes[node]['closeness'] = closeness[node]
            g.nodes[node]['betweenness'] = betweenness[node]
        idComm += 1

    for edge in edgebetwenness:
        g[edge[0]][edge[1]]['eb'] = edgebetwenness[edge]

    graph_export = json_graph.node_link_data(g)
    with open("../datos/IMDB_graph.json", 'w') as f:
        json.dump(graph_export, f, indent='\t', ensure_ascii=False)
