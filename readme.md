# MASTER EN DATA SCIENCE - URJC
## Análisis de Grafos y Redes Sociales


##### AUTORES:
- César Arribas Muñoz
- Roberto Nombela Alonso

##### PREPARACIÓN DEL ENTORNO:
``` 
pip install -r requirements.txt
```

##### OBTENCIÓN DE DATOS:
En el directorio ***obtencion***:
```
sudo docker run -p 8050:8050 scrapinghub/splash
scrapy crawl GrafSpider
```

##### PROCESO/ANÁLISIS:
En el directorio ***analisis***:
```
python graph_process.py
```

##### VISUALIZACIÓN:
En el directorio ***visualizacion***:
```
python app.py
```

Una vez lanzado el servidor Flask, abrir en un navegador (recomendamos Firefox) la url:
```
localhost:5000
```