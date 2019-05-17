# -*- coding: utf-8 -*-

# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://doc.scrapy.org/en/latest/topics/item-pipeline.html
import json
import os


def add2dict(act1, act2, img, url, title, dict):
    """Crea diccionario con las relaciones entre actores."""
    # No se relaciona a un actor consigo mismo
    if act1 != act2:
        if act1 in dict.keys():
            if act2 in dict[act1]["partners"].keys():
                dict[act1]["partners"][act2]["weight"] += 1
                dict[act1]["partners"][act2]["film"].append(title)
            else:
                dict[act1]["partners"][act2] = {"weight": 1, "film": [title]}
        else:
            dict[act1] = {
                "photo": img,
                "url": url,
                "partners": {
                    act2: {"weight": 1, "film": [title]}
                }
            }
    return dict


class PfinalgrafPipeline(object):
    def open_spider(self, item):
        """Abre el fichero auxiliar en modo escritura."""
        self.file = open("IMDB_aux.json", "w")
        # Apertura de lista
        self.file.write('[')

    def process_item(self, item, spider):
        """Añade en el fichero auxiliar el contenido de cada diccionario en formato JSON."""
        json.dump(item, self.file, ensure_ascii=False, sort_keys=True)
        self.file.write(',\n')
        return list(item.keys())[0]

    def close_spider(self, item):
        """Genera el fichero de datos original a partir del auxiliar."""
        self.file.close()
        with open("IMDB_aux.json", "r") as f:
            # Descarta el último ,\n añadido en process_item y cierra la lista
            text = f.read()[0:-2] + ']'
        os.remove("IMDB_aux.json")  # Eliminado para ahorrar espacio
        data_json = json.loads(text)
        relations = {}
        for film_dict in data_json:
            for title, actors_list in film_dict.items():
                i = 0
                for item in actors_list:
                    actor = list(item.keys())[0]
                    img = item[actor]["img"]
                    url = item[actor]["url"]
                    # Evitamos tener que iterar todos los actores entre sí
                    for j in range(i, len(actors_list)):
                        actor2 = list(actors_list[j].keys())[0]
                        img2 = actors_list[j][actor2]["img"]
                        url2 = actors_list[j][actor2]["url"]
                        relations = add2dict(actor, actor2, img, url, title, relations)
                        relations = add2dict(actor2, actor, img2, url2, title, relations)
                    i += 1
        with open("../datos/IMDB_data.json", 'w') as f:
            """Vuelca el diccionario de relaciones en el fichero IMDB_data."""
            json.dump(relations, f, ensure_ascii=False, sort_keys=True)
