# -*- coding: utf-8 -*-
import scrapy
from scrapy_splash import SplashRequest

"""
Usage: scrapy crawl GrafSpider
"""

class GrafspiderSpider(scrapy.Spider):
    name = 'GrafSpider'
    start_urls = ["https://www.imdb.com/search/title?groups=top_100&sort=user_rating,desc&view=advanced"]
    imdb_url = "https://www.imdb.com/%s%s"  # Plantilla de url IMDB
    # Selectores XPath
    xpath_actors_img = "//tr/td/a/img/@src"
    xpath_actors_imgloadlate = "//tr/td/a/img[@title=\"%s\"]/@loadlate"
    xpath_actors_url = "//tr/td[2]/a/@href"
    xpath_film = "//div[@class=\"lister-list\"]//h3/a/@href"
    xpath_genre = "//div[@class=\"lister-list\"]/div[%s]//span[@class=\"genre\"]/text()"
    xpath_name = "//tr//img/@alt"
    xpath_next = "//a[@class=\"lister-page-next next-page\"]/@href"
    xpath_title = "//h3[@itemprop=\"name\"]/a/text()"

    def parse(self, response):
        """Función para parsear las películas del top 100."""
        films = response.xpath(self.xpath_film).extract()
        for url in films:
            url_short = '/'.join(url.split("/")[1:-1])
            try:
                genres = response.xpath(self.xpath_genre % i).extract_first()[1:].split()
            except:
                genres = []
            if "Animation" not in genres:
                # Renderiza la url para poder obtener el contenido dinámico
                yield SplashRequest(url=self.imdb_url % (url_short, "/fullcredits"),
                                    callback=self.parse_film,
                                    endpoint="render.html",
                                    args={"wait": 1})
        try:
            # Si hay Siguiente se vuelve a llamar a parse con la url "next"
            next = response.xpath(self.xpath_next).extract_first()[1:]
            yield response.follow(self.imdb_url % (next, ""), callback=self.parse)
        except:
            pass

    def parse_film(self, response):
        """Función para parsear los actores de las películas."""
        actors_url = response.xpath(self.xpath_actors_url).extract()
        actors_img = response.xpath(self.xpath_actors_img).extract()
        actors_names = response.xpath(self.xpath_name).extract()
        # Se seleccionan como máximo 20 actores para no saturar el grafo
        actors = actors_names[0:20] if len(actors_names) > 20 else actors_names
        film_title = response.xpath(self.xpath_title).extract_first()
        actors_dict = {}
        for i, a in enumerate(actors):
            new_url = actors_url[i][1:]   # Se descarta el primer caracter /
            try:
                # imgload es la imagen cargada dinámicamente
                imgload = response.xpath(self.xpath_actors_imgloadlate % a).extract_first()
                # imginit es la que aparece por defecto (suele ser nopicture)
                imginit = actors_img[i]
                # Si imgload es None entonces permanece la imagen por defecto
                img = imgload if imgload else imginit
            except:
                pass
            actors_dict[a] = {"url": self.imdb_url % (new_url, ""), "img": img}

        film_dict = {film_title: [{actor: attrs} for actor, attrs in actors_dict.items()]}
        yield film_dict
