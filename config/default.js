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

    // Typ závady
    problemTyp: [
        {
            name: "Odpady",
            code: "odpady",
            image: ""
        },
        {
            name: "Zeleň",
            code: "zeleň",
            image: ""
        },
        {
            name: "Poškozené věci",
            code: "poškozené věci",
            image: ""
        },
        {
            name: "Osvětlení",
            code: "osvětlení",
            image: ""
        },
        {
            name: "Dětské hřiště",
            code: "dětské hřiště",
            image: ""
        },
        {
            name: "Ostatní",
            code: "ostatní",
            image: ""
        }
    ],
 
    // Obsah widgetu o aplikaci (HTML)
    infoWidgetContent: "<div class='about-widget'><h3>Hlášení závad ve městě</h3><div><h4>Obsah mapové aplikace</h4> <p><span class='info-h5'>Lorem ipsum reprehenderit non officia nulla elit id. Officia laboris ipsum deserunt nostrud consequat incididunt qui tempor cillum veniam exercitation consectetur veniam. Reprehenderit elit laboris eiusmod nostrud commodo aliquip ipsum irure laborum qui reprehenderit id. Sint Lorem velit sunt cupidatat ipsum quis quis consectetur Lorem deserunt deserunt proident nucalcitella esse.</p></div></div>",
};