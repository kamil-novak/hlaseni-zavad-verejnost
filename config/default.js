// -----------------------------------------------------------------------------------
// NASTAVENÍ MAPOVÉ APLIKACE 
// Vybraná nastavení lze provádět pomocí tohoto konfiguračního souboru (viz komentáře)
// Jiná nastavení je nutné provádět přímo v aplikaci
// -----------------------------------------------------------------------------------

var config = {
    
    // Text v horní liště mapové aplikace
    headerTitle: "Hlášení závad ve městě",
    
    // Text v horní liště mapové aplikace
    headerLink: "https://www.jihlava.cz/projekty-pro-verejnost/d-465410",

    // ID webové mapy
    webmapId: "6eab4160ae6a40be8baf4aa7dfe04b15",

    // Souřadnicový systém webov mapy
    webmapSpatialReference: 5514,

    // Portal URL
    portalUrl: "https://gis.jihlava-city.cz/portal",

    // Obsah widgetu legenda (HTML)
    legendWidgetContent: "<div class='custom-legend-widget'> <h3>Legenda</h3> <div class='custom-legend-widget cutom-block-info'><h4>Závady</h4><table><tr><td><img src='images/legend-zavady-aktualni.svg' alt='Bez zpoždění'></td> <td>Aktuální závady</td></tr></table></div></div>",
   
    // Obsah widgetu o aplikaci (HTML)
    infoWidgetContent: "<div class='about-widget'><h3>Hlášení závad ve městě</h3><div><h4>Obsah mapové aplikace</h4> <p><span class='info-h5'>Lorem ipsum reprehenderit non officia nulla elit id. Officia laboris ipsum deserunt nostrud consequat incididunt qui tempor cillum veniam exercitation consectetur veniam. Reprehenderit elit laboris eiusmod nostrud commodo aliquip ipsum irure laborum qui reprehenderit id. Sint Lorem velit sunt cupidatat ipsum quis quis consectetur Lorem deserunt deserunt proident nulla esse.</p></div></div>",
   

    // Symbologie grafických vrstev
    // ----------------------------
    symbologyGraphicLayer: {
        // Zvýraznění trasy
        highlightLine: {
           type: "simple-line",
           color: [230, 0, 176],
           width: 5
        }
    }
};