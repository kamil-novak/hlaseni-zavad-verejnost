// --- URL parametry ---
var queryString = window.location.search;
var urlParams = new URLSearchParams(queryString);
var urlTown = urlParams.get('m');
var urlStop = urlParams.get('stop');

// --- Globální proměnné ---
// Zastávky
var copyStopLinkAction = {
  title: "Kopírovat URL zastávky",
  id: "copy-stop-url",
  image: "./images/popup-copy.svg"
};  

var zastavkaPopupTemplate =  {
  outFields: [config.mapServices.linesStopLayer.sublayers.stopLayer.stopIdField,
              config.mapServices.linesStopLayer.sublayers.stopLayer.postIdField,
              config.mapServices.linesStopLayer.sublayers.stopLayer.stopNameField,
              config.mapServices.linesStopLayer.sublayers.stopLayer.typeField,
              config.mapServices.linesStopLayer.sublayers.stopLayer.typeNameField,
              config.mapServices.linesStopLayer.sublayers.stopLayer.linesField ,
              config.mapServices.linesStopLayer.sublayers.stopLayer.directionField,
              config.mapServices.linesStopLayer.sublayers.stopLayer.zoneField],
  actions: [copyStopLinkAction],
};

// Poloha vozidel
var zoomVehicleAction = {
  title: "Přiblížit vozidlo",
  id: "zoom-vehicle",
  image: "./images/popup-zoom.svg",
  disabled: false,
};  

var trackVehicleAction = {
  title: "Sledovat vozidlo",
  id: "track-vehicle",
  image: "./images/popup-track.svg",
  className: "track-vehicle",
}; 
var trackVehicleHandler; 

var polohaVozidlaMhdFc;
var vozidloPopupTemplate = {
  outFields: [config.mapServices.locationVehiclesLayer.sublayers.vehiclesLayer.delayMinFormatField,
              config.mapServices.locationVehiclesLayer.sublayers.vehiclesLayer.speedFormatField,
              config.mapServices.locationVehiclesLayer.sublayers.vehiclesLayer.lastStopNameField,
              config.mapServices.locationVehiclesLayer.sublayers.vehiclesLayer.barrierField,
              config.mapServices.locationVehiclesLayer.sublayers.vehiclesLayer.popupTitleField,
              config.mapServices.locationVehiclesLayer.sublayers.vehiclesLayer.lineField,
              config.mapServices.locationVehiclesLayer.sublayers.vehiclesLayer.vehicleNumberField], 
  actions: [zoomVehicleAction, trackVehicleAction],
  overwriteActions: true,
};

// Mimořádnosti
var mimoradnostiCache = null;


require([
    "esri/WebMap",
    "esri/views/MapView",
    "esri/widgets/Popup",
    "esri/core/reactiveUtils",
    "esri/widgets/Expand",
    "esri/widgets/Home",
    "esri/widgets/Locate",
    "esri/widgets/BasemapGallery/support/LocalBasemapsSource",
    "esri/layers/TileLayer",
    "esri/Basemap",
    "esri/widgets/BasemapGallery",
    "esri/widgets/Search",
    "esri/layers/FeatureLayer",
    "esri/layers/GraphicsLayer",
    "esri/Graphic",
    "esri/geometry/Point",
    "esri/layers/MapImageLayer",
    "esri/request",
    "esri/widgets/Feature"
   ], function(WebMap, MapView, Popup, reactiveUtils, Expand, Home, Locate, LocalBasemapsSource, TileLayer, Basemap, BasemapGallery, Search, FeatureLayer, GraphicsLayer, Graphic, Point, MapImageLayer, esriRequest, Feature) {


    // --- Layout aplikace ---
    // Hlavní lišta
    document.getElementById("title").innerHTML = config.appSettings.headerTitle;
    document.getElementById("logo").innerHTML = '<img id="logo-img" src="images/header-logo-jihlava.svg" alt="logo">';


    // --- Webová mapa ---
    
    // Podkladové mapy
    // Základní - světlá
    var zakladniMapa = new Basemap({
      baseLayers: [
        new TileLayer({
          url: "https://mapy.mesto-most.cz/server/rest/services/Podklad/SvetlaZabaged/MapServer",
          opacity: 0.9999,
          title: "Základní mapa - světlá",
        })
      ],
      title: "Základní mapa",
      thumbnailUrl: "images/bm-zakladni-mapa.png"
    });

    // Letecká
    var leteckaMapa = new Basemap({
      baseLayers: [
        new TileLayer({
          url: "https://mapy.mesto-most.cz/server/rest/services/Ortofoto/Ortofoto2023Cuzk/MapServer",
          opacity: 0.9999,
          title: "Letecká mapa 2023",
        })
      ],
      title: "Letecká mapa 2023",
      thumbnailUrl: "images/bm-letecka2023.png"
    });

    // Plán města
    var planMestaMost = new Basemap({
      baseLayers: [
        new TileLayer({
          url: "https://mapy.mesto-most.cz/server/rest/services/Podklad/PlanMesta/MapServer",
          opacity: 0.40,
          title: "Plán města Most"
        })
      ],
      title: "Plán města Most",
      thumbnailUrl: "images/bm-plan-mesta.png"
    });

    // Operační vrstvy
    // Popisky linek
    var linkaPopiskyMs = new MapImageLayer({
      title: config.mapServices.linesStopLayer.title,
      url: config.mapServices.linesStopLayer.url,   
      visibility: true,
      visibleLayers: [2],
      sublayers: [
        {
          id: 2,
        },
      ],
      opacity: 1,
      showLegend: false,
    });

    // Zastávky a linie linek
    var linkaZastavkaMhdMs = new MapImageLayer({
      title: config.mapServices.linesStopLayer.title,
      url: config.mapServices.linesStopLayer.url,
      visibility: true,
      visibleLayers: [0,1],
      opacity: 0.9999,
      showLegend: false,
      sublayers: [
        {
          id: 1,
          legendEnabled: true,
          popupEnabled: false
        },
        {
          id: 0,
          legendEnabled: true,
          popupEnabled: true,
          popupTemplate: zastavkaPopupTemplate,
        }
      ]
    });
    // Zastávky - sublayer
    var zastavkaMhdLr = linkaZastavkaMhdMs.findSublayerById(0);
    zastavkaMhdLr.popupTemplate.content = createStopPopup; 
    // Linky - sublayer
    var linkaMhdLr = linkaZastavkaMhdMs.findSublayerById(1);

    // Vozidla
    polohaVozidlaMhdFc = new FeatureLayer({
      title: config.mapServices.locationVehiclesLayer.sublayers.vehiclesLayer.title,
      url: config.mapServices.locationVehiclesLayer.url + "/" + config.mapServices.locationVehiclesLayer.sublayers.vehiclesLayer.layerId,
      id: "koop_vozidla",
      visibility: true,
      opacity: 1,
      refreshInterval: 0.1,
      showLabels: true,
      showLegend: false,
      legendEnabled: false,
      popupEnabled: true,
      labelsVisible: true,
      renderer: {
        type: "unique-value",
        field: "SYMBOLOGY",
        uniqueValueInfos: vehicleRenderer,
        visualVariables: [
          {
            type: "rotation", 
            field: config.mapServices.locationVehiclesLayer.sublayers.vehiclesLayer.azimutField, 
            rotationType: "geographic"
          }
        ]
      },
      labelingInfo: [vehicleLabel],
      popupTemplate: vozidloPopupTemplate,
    });
    polohaVozidlaMhdFc.popupTemplate.content = createVozidloPopup;

    // Mimořádnosti
    var mimoradnostiMhdMs = new MapImageLayer({
      title: config.mapServices.mimoradnostiService.title,
      url: config.mapServices.mimoradnostiService.url,
      id: "mimoradnosti",
      visibility: true,
      refreshInterval: config.mapServices.mimoradnostiService.refreshInterval,
      sublayers: [
        {
          id: 2,
          popupEnabled: false,
          visibility: false,
          popupTemplate: {
            content: '<div class="mimoradnosti-popup-container"><div>{TEXT_UDALOSTI}</div><div>'
          }
        },
        {
          id: 1,
          popupEnabled: true,
          popupTemplate: {
            title: '<div class="mimoradnosti-popup-title">Událost v provozu</div>',
            content: '<div class="mimoradnosti-popup-container">{TEXT_UDALOSTI}<div>'
          }
        },
        {
          id: 0,
          popupEnabled: true,
          popupTemplate: {
            title: '<div class="mimoradnosti-popup-title">Událost v provozu</div>', 
            content: '<div class="mimoradnosti-popup-container">{TEXT_UDALOSTI}<div>'
          }
        }
      ]
    })

    // Pomocné vrstvy
    // Zvýrazňování tras a identifikovaných zastávek
    var graphicsLayerHighlight = new GraphicsLayer({
      title: "Zvýraznění trasy linky",
      opacity: 0.6,
      legendEnabled: false,
      popupEnabled: false,
    });

    // Hledání adres
    var adresyFl = new FeatureLayer({
      url: config.mapServices.ruianSearchLayer.url + "/" + config.mapServices.ruianSearchLayer.sublayers.adresyLayer.layerId,
      visible: false,
    });

    // Hledání bloků
    var blokyFl = new FeatureLayer({
      url: config.mapServices.ruianSearchLayer.url + "/" + config.mapServices.ruianSearchLayer.sublayers.blokyLayer.layerId,
      visible: false,
    });

    // Hledání zastávek
    var zastavkaMhdFl = new FeatureLayer({
      url: config.mapServices.linesStopLayer.url + "/" + config.mapServices.linesStopLayer.sublayers.stopLayer.layerId,
      popupTemplate: zastavkaPopupTemplate,
      visible: false,
    });
    zastavkaMhdFl.popupTemplate.content = createStopPopup;

    // Webová mapa
    var webmap = new WebMap({
      basemap: zakladniMapa,
      layers: [linkaZastavkaMhdMs, graphicsLayerHighlight, mimoradnostiMhdMs, linkaPopiskyMs, polohaVozidlaMhdFc],
    });

    // --- View ---
    // Vytvoření pohledu na webovou mapu
    var view = new MapView({
      container: "viewDiv",
      map: webmap,
      padding: {
        top: 55
      },
      popup: new Popup({
        dockOptions: {
          breakpoint: false,
          position: "bottom-right"
        },
        dockEnabled: true,
      }),
      extent: {
        xmin: -793122.592183364,
        ymin: -991002.6900442013,
        xmax: -789635.3768756,
        ymax: -987740.3710195633,
        spatialReference: config.webmap.spatialReference
      }
    });

    // --- Layout aplikace ---
    // Loading screen
    reactiveUtils.once(
      function() {return(view.ready === true)})
        .then(() => {
          document.getElementById("loading-screen").remove();
    });

    
    // Pokud je načteno view
    view.when(function() {

      // --- Widget ---
      // Tlačítko Home
      var homeWidget = new Home({
        view: view,
        label: "Výchozí zobrazení mapy"
      });

      // --- Widget ---
      // Lokalizace
      var locateWidget = new Locate({
        view: view,  
        scale: 2500,
        label: "Najdi moji polohu",
      });

      // --- Widget ---
      // Legenda
      var legendNode = document.createElement("div");
      legendNode.style.padding = "10px";
      legendNode.classList.add("esri-widget--panel", "esri-widget");
      legendNode.innerHTML = config.appWidgets.legendWidget.content;

      var legendWidget = new Expand({
        content: legendNode, 
        view: view,
        expandTooltip: "Legenda",
        collapseTooltip: "Sbalit legendu",
        group: "top-left",
        expandIcon: "list"
      });

      // --- Widget ---
      // O aplikaci
      var infoNode = document.createElement("div");
      infoNode.style.padding = "10px";
      infoNode.classList.add("esri-widget--panel", "esri-widget");
      infoNode.innerHTML = config.appWidgets.infoWidget.content;

      var infoWidget = new Expand({
        content: infoNode, 
        view: view,
        expandTooltip: "O aplikaci",
        collapseTooltip: "Sbalit informace o aplikaci",
        group: "top-left",
        expandIcon: "question"
      });

      // --- Widget ---
      // Basemap Gallery
      var basemapWidget = new Expand({
          content: new BasemapGallery({
              view: view,
              source: new LocalBasemapsSource({
                  basemaps: [
                      zakladniMapa,
                      leteckaMapa, 
                      planMestaMost    
                  ]
              })
          }),
          view: view,
          expandTooltip: "Podkladové mapy",
          collapseTooltip: "Sbalit podkladové mapy",
          group: "top-left"
      });

      // --- Widget ---
      // Mimořádnosti
      var mimoradnostiNode = document.createElement("div");
      mimoradnostiNode.id = "mimoradnosti-node";
      mimoradnostiNode.style.padding = "10px";
      mimoradnostiNode.classList.add("esri-widget--panel", "esri-widget", "mimoradnosti-widget-container");
      mimoradnostiNode.innerHTML = "<h3>Události v provozu</h3>"

      var mimoradnostiWidget = new Expand({
        content: mimoradnostiNode,
        view: view,
        expandTooltip: "Události v provozu",
        collapseTooltip: "Sbalit události v provozu",
        group: "top-left",
        expandIcon: "speech-bubble-exclamation"
      });

      checkMhdIssues(mimoradnostiMhdMs, mimoradnostiNode, mimoradnostiWidget, true);
      mimoradnostiMhdMs.on("refresh", function(){
        checkMhdIssues(mimoradnostiMhdMs, mimoradnostiNode, mimoradnostiWidget);
      });

      // --- Widget ---
      // Filter linek
      var linesArr = config.appWidgets.filterWidget.linesList;
      var checkedLines = [];

      // Obsah widgetu
      var filterNode = document.createElement("div");
      filterNode.style.padding = "10px";
      filterNode.classList.add("esri-widget--panel", "esri-widget");
      filterNode.innerHTML = 'Vyberte linky, které chcete zobrazit v mapě. Ostatní linky se skryjí.<div class="filter-container"></div><div class="clear-filter filter-btn">Zobrazit všechny</div>'

      // Vytvoření widgetu a vložení obsahu
      var filterWidget = new Expand({
        content: filterNode, 
        view: view,
        expandTooltip: "Filtr linek",
        collapseTooltip: "Sbalit filtr linek",
        group: "top-left",
        expandIcon: "filter"
      });
      
      // Vytažení HTML elementů z obsahu widgetu
      var filterContainer = filterNode.querySelector(".filter-container");
      var clearFilter = filterNode.querySelector(".clear-filter");

      // Vložení HTML elementů jednotlivých linek v obsahu widgetu
      linesArr.forEach(function(line){
        var lineNode = document.createElement("div");
        lineNode.classList.add("filter-btn");
        lineNode.innerHTML = '<label><input type="checkbox" value="1"><span>' + line + '</span></label>'

        filterContainer.append(lineNode);        
      });

      // Výběr linek (samotný filter)
      var lineNums = filterContainer.querySelectorAll(".filter-btn span");
      filterLines(polohaVozidlaMhdFc, lineNums, checkedLines);
      
      // Obnovení zobrazení všech linek
      clearFilterLines(polohaVozidlaMhdFc, clearFilter, lineNums, checkedLines);
      
      // --- Widget ---
      // Záložky Most a Litvínov
      // URL parametry Most a Litvínov

      // Vytvoření tlačítek Most a Litvínov
      var bookmarkMost = document.createElement("div");
      bookmarkMost.classList.add("esri-widget--button", "bookmark-most");
      bookmarkMost.title = "Přiblížit na Most";
      bookmarkMost.innerText = "MO";

      var bookmarkLitvinov = document.createElement("div");
      bookmarkLitvinov.classList.add("esri-widget--button", "bookmark-litvinov");
      bookmarkLitvinov.title = "Přiblížit na Litvínov";
      bookmarkLitvinov.innerText = "LIT";

      // Souřadnice pro zoom
      var ptMost = new Point({
        x: -791237.224,
        y: -989622.461,
        spatialReference: config.webmap.spatialReference
      });

      var ptLitvinov = new Point({
        x: -791855.192,
        y: -978361.715,
        spatialReference: config.webmap.spatialReference
      });

      // Měřítko pro zoom
      var gotoScale = 25000;

      // Zoom po kliknutí na tlačítka
      bookmarkMost.addEventListener("click", function(){ goToTown(ptMost, gotoScale);});
      bookmarkLitvinov.addEventListener("click", function(){ goToTown(ptLitvinov, gotoScale);});

      // Informační banner
      var infoBannerEl = document.createElement("div");
      infoBannerEl.classList.add("info-banner", config.infoBanner.type);

      var infoBannerContent = document.createElement("div");
      infoBannerContent.classList.add("info-content");
      infoBannerContent.innerHTML = config.infoBanner.content;

      infoBannerEl.append(infoBannerContent)

      var infoBannerCloseBtn = document.createElement("div");
      infoBannerCloseBtn.classList.add("info-close");

      var infoBannerCloseIco = document.createElement("span");
      infoBannerCloseIco.classList.add("esri-icon-close");

      infoBannerCloseBtn.append(infoBannerCloseIco)
      infoBannerEl.prepend(infoBannerCloseBtn)
      infoBannerCloseBtn.addEventListener("click", function(){
        infoBannerEl.style.display = "none"
      })

      // Cookies lišta
      var cookiesBarEl = document.createElement("div");
      cookiesBarEl.classList.add("cookies-bar");
      cookiesBarEl.innerHTML = config.cookiesBar.content;
   
      // --- Práce s URL parametry ---
      // Zoom na město (paranetr "m")
      if (urlTown && !urlStop) {
        if (urlTown === 'most') {goToTown(ptMost, gotoScale);}
        if (urlTown === 'litvinov') {goToTown(ptLitvinov, gotoScale);}
      }

      // Zoom na zastávku (parametr = "stop", hodnota parametru = IdZastavka-SLOUPEK)
      if (urlStop) {  
        urlStopArr = urlStop.split('-');

        var queryStop = {
          outFields: [config.mapServices.linesStopLayer.sublayers.stopLayer.stopIdField,
                      config.mapServices.linesStopLayer.sublayers.stopLayer.postIdField,
                      config.mapServices.linesStopLayer.sublayers.stopLayer.stopNameField,
                      config.mapServices.linesStopLayer.sublayers.stopLayer.typeField,
                      config.mapServices.linesStopLayer.sublayers.stopLayer.typeNameField,
                      config.mapServices.linesStopLayer.sublayers.stopLayer.linesField,
                      config.mapServices.linesStopLayer.sublayers.stopLayer.directionField,
                      config.mapServices.linesStopLayer.sublayers.stopLayer.zoneField],
          returnGeometry: true,
          where: "IdZastavka='" + urlStopArr[0] + "' AND SLOUPEK=" + urlStopArr[1]
        };

        // Zvýraznění - vložení nové Graphic do graphicLayer
        zastavkaMhdLr.queryFeatures(queryStop).then(function(result) {
          if(result.features[0]) {
            view.popup.open({
              features: [result.features[0]]
            });
            view.goTo({target: result.features[0].geometry, scale: 2500});
            view.popup.collapsed = false;
          }
        });
      }

      // --- Layout aplikace ---
      // Uspořádání prvků
      view.ui.add(homeWidget, "top-left", 0);
      view.ui.add(locateWidget, "top-left", 1);
      view.ui.add(bookmarkMost, "top-left", 2);
      view.ui.add(bookmarkLitvinov, "top-left", 3);
      view.ui.add(mimoradnostiWidget, "top-left", 4);
      view.ui.add(legendWidget, "top-left", 5);
      view.ui.add(basemapWidget, "top-left", 6);
      view.ui.add(filterWidget, "top-left", 7);
      view.ui.add(infoWidget, "top-left", 8);
          

      // Pokud je mapa načtena
      webmap.when(function() {

        // --- Widget ---
        // Search
        var searchWidget = new Search({
          view: view,
          allPlaceholder: "zastávky, adresy, ...",
          includeDefaultSources: false,
          label: "Hledat",
          sources: [
            {
              layer: zastavkaMhdFl,
              searchFields: [config.mapServices.linesStopLayer.sublayers.stopLayer.stopNameField],
              displayField: config.mapServices.linesStopLayer.sublayers.stopLayer.stopNameField,
              suggestionTemplate: "{" + config.mapServices.linesStopLayer.sublayers.stopLayer.stopNameField + "} <span style='color: #b3b3b3; font-size: 11px'>({" + config.mapServices.linesStopLayer.sublayers.stopLayer.typeNameField + "}, směr {" + config.mapServices.linesStopLayer.sublayers.stopLayer.directionField + "})</span>",
              exactMatch: false,
              outFields: [config.mapServices.linesStopLayer.sublayers.stopLayer.stopIdField,
                          config.mapServices.linesStopLayer.sublayers.stopLayer.postIdField,
                          config.mapServices.linesStopLayer.sublayers.stopLayer.stopNameField,
                          config.mapServices.linesStopLayer.sublayers.stopLayer.typeField,
                          config.mapServices.linesStopLayer.sublayers.stopLayer.typeNameField,
                          config.mapServices.linesStopLayer.sublayers.stopLayer.linesField,
                          config.mapServices.linesStopLayer.sublayers.stopLayer.directionField,
                          config.mapServices.linesStopLayer.sublayers.stopLayer.zoneField],
              name: "Zastávka",
              placeholder: "např. 14.ZŠ",
              zoomScale: 2500, 
              maxSuggestions: 10,
              resultSymbol: {
                  type: "simple-marker",
                  style: "square",
                  color: [0, 255, 255, 0.3],
                  size: "16px",
                  outline: {
                    color: [0, 255, 255],
                    width: "2.7px"
                  }
              }
            },
            {
              layer: adresyFl,
              searchFields: ["Adresa"],
              displayField: "Adresa",
              exactMatch: false,
              outFields: ["Adresa"],
              placeholder: "např. Radniční 1/2",
              name: "Adresa",
              zoomScale: 2500, // Nefunkční - bug Esri
              minSuggestCharacters: 3,
              maxSuggestions: 10,
              resultSymbol: {
                type: "simple-marker",
                style: "circle",
                color: [0, 255, 255, 0.3],
                size: "16px",
                outline: {
                  color: [0, 255, 255],
                  width: "2.7px"
                }
              },
              popupTemplate: {
                title: "Adresa",
                content: "{Adresa}"
              }
            },
            {
              layer: blokyFl,
              searchFields: ["BLOK"],
              displayField: "BLOK",
              exactMatch: false,
              outFields: ["BLOK"],
              placeholder: "např. 701",
              name: "Bloky budov",
              zoomScale: 2500, 
              minSuggestCharacters: 1,
              maxSuggestions: 6,
              resultSymbol: {
                type: "simple-fill",
                style: "solid",
                color: [0, 255, 255, 0.3],
                size: "16px",
                outline: {
                  color: [0, 255, 255],
                  width: "2.7px"
                }
              },
              popupTemplate: {
                title: "Blok",
                content: "{BLOK}"
              }
            }
          ]
        });

        view.ui.add(searchWidget, "top-right", 1);

        // --- Informační banner ---
        // Přidat do aplikace
        if(config.infoBanner.enable === true) {
          view.ui.add(infoBannerEl, "top-right", 2)
        }

        // --- Cookies lišta ---
        // Přidat do aplikace
        if(config.cookiesBar.enable === true) {
          view.ui.add(cookiesBarEl, "manual")
        }
      });

      // --- Layout aplikace ---
      reactiveUtils.watch(function() { return([view.width, view.height]) }, 
        function([width, height]) {
          if (width < 545) {
              // Title
              setTitleMobile(true);
              
              // Popup
              view.popup.dockEnabled = true;
              view.popup.dockOptions.position = "bottom-center";

              // Legenda widget
              if (height < 1130) { 
                legendNode.style.maxHeight = "none";
              }

              // Mimořádnosti widget
              if (height < 1130) {
                mimoradnostiNode.style.maxHeight = "none";
              }

              // O aplikaci widget
              if (height < 1130) {
                infoNode.style.maxHeight = "none";
              }

          } 
          else {
              // Title
              setTitleMobile(false);
              
              // Popup
              view.popup.dockEnabled = true;
              view.popup.dockOptions.position = "bottom-right";

              // Legenda widget
              if (height <= 1130) {
                legendNode.style.maxHeight = (height - 405) + "px";
              }

              // Mimořádnosti widget
              if (height <= 1130) {
                mimoradnostiNode.style.maxHeight = (height - 365) + "px";
              }

              // O aplikaci widget 
              if (height <= 1130) {
                infoNode.style.maxHeight = (height - 540) + "px";
              }
          }
        }, 
        {
          initial: true
        }
      ); 

    });


    // Akce po vybrání (select) mapového prvku
    view.popup.watch("selectedFeature", function(selectedFeature) {

      if(selectedFeature) {

        // Odebrání rámečku aktivní položky v panelu mimořádností
        removeActiveMhdIssues();

        // Smazání předchozí grafiky
        graphicsLayerHighlight.removeAll();

        // --- Zvýraznění trasy po identifikaci vozidla ---
        if (selectedFeature.layer) {
          if (selectedFeature.layer.id === "koop_vozidla") {

            // Zjištění čísla linky z headeru pop-up okna
            var lineNumber = selectedFeature.attributes[config.mapServices.locationVehiclesLayer.sublayers.vehiclesLayer.lineField];

            // Konstrukce atributového dotazu
            var query = {
              outFields: [config.mapServices.linesStopLayer.sublayers.linesLayer.lineField],
              returnGeometry: true,
              where: config.mapServices.linesStopLayer.sublayers.linesLayer.lineField + " LIKE '%(" + lineNumber + ")%'"
            };

            // Zvýraznění trasy
            linkaMhdLr.queryFeatures(query).then(function(result) {
                addGraphics(result, config.symbologyGraphicLayer.highlightLine);
            });
            
          }
        }

        // Zvýraznění vybrané zastávky
        if (selectedFeature.attributes[config.mapServices.linesStopLayer.sublayers.stopLayer.stopIdField]) {
            // Vypnutí trackování vozidla (ošetření situace listování pop-up okny z trackovaného vozidla na zastávku)
            if(trackVehicleHandler) {
              trackVehicleHandler.remove();
            }
        }
      }

      // Smazání grafik po kliknutí do mapy
      else {
        graphicsLayerHighlight.removeAll();
      }

    });

    // Smazání grafik po zavření popup okna
    view.popup.watch("visible", function(visible) { 
      if (visible === false) {
        graphicsLayerHighlight.removeAll();
        if(trackVehicleHandler) {
          trackVehicleHandler.remove();
        }
      }
    });

    // Akce popup oken
    view.popup.on("trigger-action", function(event) {
      // Kopírovat zastávku
      if (event.action.id === "copy-stop-url") {
        copyUrl(view.popup.selectedFeature.attributes);
      }
      // Zoom na vozidlo - akce popup okna
      if (event.action.id === "zoom-vehicle") {
          zoomVehicle(view.popup.selectedFeature.attributes, 2500);
      }
      // Trackovat vozidlo - akce popup okna
      if (event.action.id === "track-vehicle") {
        
        var trackVehicleBtn = document.getElementsByClassName("track-vehicle")[0];

        // Vypnutí trackování
        if (trackVehicleBtn.classList.contains("track-vehicle-active")){ 
          trackVehicleBtn.classList.remove("track-vehicle-active");
          trackVehicleHandler.remove();
        }
        // Zapnutí trackování
        else {
          // Prvotní zoom na vozidlo
          zoomVehicle(view.popup.selectedFeature.attributes);
          trackVehicleBtn.classList.add("track-vehicle-active");

          // Sledování po updatu mapy
          trackVehicleHandler = reactiveUtils.watch(function() {return([view.updating, view.navigating])}, function([updating, navigating]){
            if (updating === true && navigating === false) {
              zoomVehicle(view.popup.selectedFeature.attributes);
            }
          });
        }
      }
    });
    // Vypnutí trackování po identifikaci jiného vozidla (resp. kliku do mapy)
    view.on("click", function(){
      if(trackVehicleHandler) {
        trackVehicleHandler.remove();
      }
    });


    // --- Funkce ---
    // Volání funkcí pro vytvoření pop-up okna vozidel
    function createVozidloPopup (feature) {

      // Prvotní naplnění pop-up okna
      if(feature) {
        getVehicleData(feature, feature.graphic);
      }

      var queryVozidlo = {
        outFields: vozidloPopupTemplate.outFields,
        returnGeometry: true,
        where: config.mapServices.locationVehiclesLayer.sublayers.vehiclesLayer.vehicleNumberField + " = " + feature.graphic.attributes[config.mapServices.locationVehiclesLayer.sublayers.vehiclesLayer.vehicleNumberField],
      };

      // Přepsání hodnot pop-up okna po novém requestu na vrstvu polohy vozidel
      var watchViewUpdating =  view.watch("updating", function(updating){
          if (updating === true) {
            polohaVozidlaMhdFc.queryFeatures(queryVozidlo).then(function(result) {

              // Nastavení obsahu pop-up okna
              if (result.features.length > 0) {
                getVehicleData(feature, result.features[0]);
              }

            }).catch(function(error){
              console.log(error);
            });
          }
        });

      // Reset obnovování pop-up okna po jeho zavření
      view.popup.watch("visible", function(visible) {
        if (visible === false) {
          if(watchViewUpdating) {
            watchViewUpdating.remove();
          }
          
        }
      });

      // Reset obnovování pop-up okna po identifikaci nového vozidla
      view.on("click", function(){
        if(watchViewUpdating) {
          watchViewUpdating.remove();
          // BUG ARCGIS JS API 4.19: viz komentář v kódu výše
          /* view.popup.featureNavigationEnabled = true; */
        }
      });
    }

    // --- Funkce ---
    // Obsah pop-up okna vozidel
    function getVehicleData(feature, graphic) {

      // Popup title
      var popupTitle = graphic.attributes[config.mapServices.locationVehiclesLayer.sublayers.vehiclesLayer.popupTitleField];

      // Pop-up tabulka
      var popupTable = document.createElement("table");
      popupTable.classList.add("esri-widget__table");
      var popupTableBody = document.createElement("tbody");

      // Pop-up řádky tabulky
      var rowDelay = document.createElement("tr");
      rowDelay.innerHTML = '<th class="esri-feature-fields__field-header">Zpoždění</th><td class="esri-feature-fields__field-data">' + graphic.attributes[config.mapServices.locationVehiclesLayer.sublayers.vehiclesLayer.delayMinFormatField] + '</td>';

      var rowSpeed = document.createElement("tr");
      rowSpeed.innerHTML = '<th class="esri-feature-fields__field-header">Rychlost / stav</th><td class="esri-feature-fields__field-data">' + graphic.attributes[config.mapServices.locationVehiclesLayer.sublayers.vehiclesLayer.speedFormatField] + '</td>';

      var rowLastStop = document.createElement("tr");
      rowLastStop.innerHTML = '<th class="esri-feature-fields__field-header">Poslední projetá zastávka</th><td class="esri-feature-fields__field-data">' + graphic.attributes[config.mapServices.locationVehiclesLayer.sublayers.vehiclesLayer.lastStopNameField] + '</td>';

      var rowBarrier = document.createElement("tr");
      rowBarrier.innerHTML = '<th class="esri-feature-fields__field-header">Bezbariérovost</th><td class="esri-feature-fields__field-data">' + graphic.attributes[config.mapServices.locationVehiclesLayer.sublayers.vehiclesLayer.barrierField] + '</td>';
      
      // Složení výstupního HTML elementu
      popupTable.append(popupTableBody);
      popupTableBody.append(rowDelay);
      popupTableBody.append(rowSpeed);
      popupTableBody.append(rowLastStop);
      popupTableBody.append(rowBarrier);
      
      // Nastavení popupTemplate
      feature.graphic.popupTemplate = {
        title: popupTitle,
        content: popupTable,
      };
    }

    // --- Funkce ---
    // Volání Sprinter WS API (Odjezdy - GetNearDepartures)
    function createStopPopup(feature) {
 
      // Prvotní nastavení pop-up okna
      getStopPopupData(feature, "first-iteration");
  
      // START interval
      var autorefresh = setInterval(function(){

        // Nastavení pop-up okna po opakovaném volání dat ze Sprinter API
        getStopPopupData(feature, "next-iteration");

      }, config.mapServices.linesStopLayer.sublayers.stopLayer.popupRefreshInterval * 1000); // END interval

      // Reset intervalu po zavření pop-up okna
      view.popup.watch("visible", function(visible) {
        if (visible === false) {
          resetInterval(autorefresh);
          // BUG ARCGIS JS API 4.19: viz komentář v kódu výše
          /* view.popup.featureNavigationEnabled = true; */
        }
      });

      // Reset intervalu po identifikaci nové zastávky v mapě (původní pop-up okno nebylo zavřeno)
      view.on("click", function(){
        resetInterval(autorefresh);
        // BUG ARCGIS JS API 4.19: viz komentář v kódu výše
        /* view.popup.featureNavigationEnabled = true; */
      });
    }

    // --- Funkce ---
    // Obsah pop-up okna zastávek
    function getStopPopupData(feature, iteration) {

      // Popup title
      var popupTitle = '<div class="stop-popup-title">Zastávka ' + feature.graphic.attributes[config.mapServices.linesStopLayer.sublayers.stopLayer.stopNameField] + ' <span style="color: #6e6e6e; font-weight: 300">(směr ' + feature.graphic.attributes[config.mapServices.linesStopLayer.sublayers.stopLayer.directionField] + ')</span></div>';

      // Volání Sprinter WS API (Odjezdy - GetNearDepartures)
      esriRequest(config.mapServices.locationVehiclesLayer.url + "/" + config.mapServices.locationVehiclesLayer.sublayers.stopTable.layerId + "/query/?stopid=" + feature.graphic.attributes[config.mapServices.linesStopLayer.sublayers.stopLayer.stopIdField] + "&postid=" + feature.graphic.attributes[config.mapServices.linesStopLayer.sublayers.stopLayer.postIdField]).then(function(data){ // START promise

        // Pokud existují odjezdy
        if (data.data.features.length > 0) {
          
          // Pop-up kontejner
          var popupContainer = document.createElement("div"); 
          popupContainer.classList.add("odjezdy-popup-container");

          // Linky a pásmo
          var linesArr = feature.graphic.attributes[config.mapServices.linesStopLayer.sublayers.stopLayer.linesField].split(',');
          var linesFormatArr = linesArr.map(function(line){
            return '<span class="line">' + line + '</span>';
          });
          var linesFormat = linesFormatArr.join('');

          var vehicleIcon;
          if (feature.graphic.attributes[config.mapServices.linesStopLayer.sublayers.stopLayer.typeField] === 1) {
            vehicleIcon = "icon-tram";
          }
          if (feature.graphic.attributes[config.mapServices.linesStopLayer.sublayers.stopLayer.typeField] === 2) {
            vehicleIcon = "icon-bus";
          }

          var popupLinesZone = document.createElement("div");
          popupLinesZone.classList.add("odjezdy-popup-lines-zone");
          popupLinesZone.innerHTML = '<span class="vehicle-icon ' + vehicleIcon + '">Vozidlo</span>' + linesFormat + '<span class="zone">pásmo ' + feature.graphic.attributes[config.mapServices.linesStopLayer.sublayers.stopLayer.zoneField] + '</span>';
                
          // Tabulka odjezdů 
          var odjezdyTable = document.createElement("table");
          odjezdyTable.classList.add("odjezdy-popup-table");
          odjezdyTable.innerHTML = '<thead><td class="linka">Linka</td><td class="cil-st">Cílová stanice</td><td class="cas">Odjezd</td></thead>';  
          
          var odjezdyTbody = document.createElement("tbody");

          // Grafický timer sledující refresh
          var graphicTimerIconContainer = document.createElement("span"); 
          graphicTimerIconContainer.classList.add("odjezdy-timer-icon");
          var graphicTimerIcon = document.createElement("span");
          graphicTimerIcon.classList.add("esri-icon-refresh");

          // Odkaz na jízdní řády
          var popupLinkfields = document.createElement("div");
          popupLinkfields.classList.add("odjezdy-popup-linkfields");
          popupLinkfields.innerHTML = '<span>Kompletní přehled jízdních řádů <a href="' + config.appSettings.stopLinkfields.schedule + '" target="_blank">ZDE</a>, schéma linek <a href="' + config.appSettings.stopLinkfields.lineScheme + '" target="_blank">ZDE</a>.</span>';
          
          // Složení výstupního HTML elementu
          odjezdyTable.append(odjezdyTbody);
          graphicTimerIconContainer.append(graphicTimerIcon);
          popupContainer.append(popupLinesZone);
          popupContainer.append(odjezdyTable);
          popupContainer.append(popupLinkfields); 
          popupLinesZone.append(graphicTimerIconContainer);
          
          // Obsah tabulky odjezdů
          data.data.features.forEach(function(attr){
            odjezdyTbody.innerHTML += attr.attributes[config.mapServices.locationVehiclesLayer.sublayers.stopTable.popupRowField];
          });

          // Nastavení doby trvání animace grafického timeru
          if(iteration === "next-iteration") {
            graphicTimerIcon.style.animationDuration = "0.8s"; 
          }
                  
          // Nastavení popupTemplate
          feature.graphic.popupTemplate = {
            title: popupTitle,
            content: popupContainer,
          };
    
        }
        // Pokud odjezdy neexistují - prázdné pole features
        else {
          // Pop-up kontejner
          var popupContainerNoDepartures = document.createElement("div"); 
          popupContainerNoDepartures.classList.add("odjezdy-popup-container");
          popupContainerNoDepartures.innerHTML = 'Aktuální odjezdy nebyly nalezeny nebo se jedná o <span style="font-weight: 600">cílovou zastávku.</span>';

          // Nastavení popupTemplate
          feature.graphic.popupTemplate = {
            title: popupTitle,
            content: popupContainerNoDepartures
          };
        }
      }); // END promise
    }

    // --- Funkce ---
    // Resetování intervalu
    function resetInterval (interval) {
      clearInterval(interval);
    }

    // --- Funkce ---
    // Zvýraznění trasy identifikovaného vozidla, případně kliknutých zastávek, nebo zastávek otevřených pomocí URL parametru
    function addGraphics(result, symbology) {

      if(result.features) {
        result.features.forEach(function(feature){
          createGraphic(feature);
        });
      }
      else {
        createGraphic(result);
      }
      
      function createGraphic(feature){
        var g = new Graphic({
          geometry: feature.geometry,
          symbol: symbology,
        });
        graphicsLayerHighlight.add(g);
      }
    }

    // --- Funkce ---
    // Zoom na město
    function goToTown  (ptTown, goToScale) {
      view.goTo({
          center: ptTown,
          scale: goToScale
      });
    }

    // --- Funkce ---
    // Filtrace linek - nástroj Filtr
    function filterLines(polohaVozidlaMhdFc, lineNums, checkedLines) {
      lineNums.forEach( function(linkaNum){
        linkaNum.addEventListener("click", function(){
          
          if ( this.parentNode.querySelector("input:checked") === null ) {
            checkedLines.push(this.textContent);
          }
          else {
            var index = checkedLines.indexOf(this.textContent);
            if (index > -1) {
                checkedLines.splice(index, 1);
            }
          }

          if ( checkedLines.length > 0 ) {
            polohaVozidlaMhdFc.definitionExpression = "CISLO_LINKY in(" + checkedLines.join(',') + ")";
          }
          else {
            polohaVozidlaMhdFc.definitionExpression = null;
          }
        });
      });
    }

    // --- Funkce ---
    // Zrušení filtru linek - nástroj Filtr
    function clearFilterLines(polohaVozidlaMhdFc, clearFilter, lineNums, checkedLines) {
      clearFilter.addEventListener("click", function(){
        lineNums.forEach( function(linkaNum){
          linkaNum.parentNode.querySelector("input").checked = false;
        });
        
        if (checkedLines.length > 0 ) {
          checkedLines.length = 0;
          polohaVozidlaMhdFc.definitionExpression = null;
        }
      });
    }

    // --- Funkce ---
    // Skrývání hlavní lišty aplikace
    function setTitleMobile(isMobile) {
      if (isMobile) {
        /* document.querySelector("#titleDiv").classList.add("invisible");
        view.padding = {
          top: 0
        }; */
      } else {
        document.querySelector("#titleDiv").classList.remove("invisible");
        view.padding = {
          top: 55
        };
      }
    }

    // --- Funkce ---
    // Kopírovat URL zastávky
    function copyUrl(attr) {

      var copyLink = window.location.href.split('?')[0] + "?stop=" + 
                  attr[config.mapServices.linesStopLayer.sublayers.stopLayer.stopIdField] + "-" +
                  attr[config.mapServices.linesStopLayer.sublayers.stopLayer.postIdField];

      var clipboardInput = document.createElement('textarea');
          clipboardInput.value = copyLink;
          clipboardInput.setAttribute('readonly', '');
          clipboardInput.style.position = 'absolute';
          clipboardInput.style.left = '-9999px';
    
          document.body.appendChild(clipboardInput);
          clipboardInput.select();
          navigator.clipboard.writeText(copyLink);
          document.body.removeChild(clipboardInput);

      // Message
      var messageId = 'copy-message-' + Math.floor(Math.random() * 10000);
      var copyMessage = document.createElement("div");
      copyMessage.innerHTML = 'Webová adresa zastávky byla zkopírována do schránky.<br><a href="' + copyLink + '">' + copyLink + '</a>';
      copyMessage.classList.add('copy-message'); 
      copyMessage.id = messageId;
      view.ui.add(copyMessage, 'top-right');

      setTimeout(function(){
        view.ui.remove(messageId);
      }, 4000);

    } 

    // --- Funkce ---
    // Zoom na vozidlo
    function zoomVehicle(attr, scale) {
      
      var queryVozidlo = {
        outFields: vozidloPopupTemplate.outFields,
        returnGeometry: true,
        where: config.mapServices.locationVehiclesLayer.sublayers.vehiclesLayer.vehicleNumberField + " = " + attr[config.mapServices.locationVehiclesLayer.sublayers.vehiclesLayer.vehicleNumberField],
        outSpatialReference: config.webmap.spatialReference,
      };

      polohaVozidlaMhdFc.queryFeatures(queryVozidlo).then(function (result) {

        var ptVehicle = new Point({
          x: result.features[0].geometry.x,
          y: result.features[0].geometry.y,
          spatialReference: config.webmap.spatialReference,
        });

        view.goTo({
          center: ptVehicle,
          scale: scale,
        });
      });
      
    }

    // --- Funkce ---
    // Kontrola, zda existují mimořádné události
    function checkMhdIssues(service, node, widget, firstStart=false) {

      var mimoradnostiLr = service.findSublayerById(2);
      var now = Date.now().toString(); // bug: browser kešuje odpovědi
      mimoradnostiLr.queryFeatures({where: now + "=" + now, returnGeometry: true, orderByFields: ["ZMENENO DESC"],  outFields: ["ID", "TEXT_UDALOSTI"]}).then(function(data) {

        // Pokud nový request na službu obsahuje stejné výsledky, nepřekresluj HTML element
        if (JSON.stringify(data.features) === JSON.stringify(mimoradnostiCache)) {
          mimoradnostiCache = data.features;
        }
        // Pokud nový request na službu obsahuje jiné výsledky, překresli HTML element
        else {
          var messagesCount = data.features.length;

          if (messagesCount > 0) {
            node.innerHTML = "<h3>Události v provozu</h3>";
            node.querySelector("h3").append(" (" + messagesCount + ")");

            if (window.innerWidth >= 545) {
              if (firstStart === true) {
                widget.expand();
              }
            }

            data.features.forEach(function(feature, index){
              
              var mimoradnostFeature = new Feature({
                id: "udalost-" + feature.attributes.ID,
                container: node.id,
                graphic: feature,
                map: view.map,
                spatialReference: view.spatialReference
              });

              mimoradnostFeature.when(function(){
                mimoradnostFeature.container.childNodes[index+1].addEventListener("click", function(e){
                  removeActiveMhdIssues();
                  this.classList.add("mimoradnosti-active");
                  view.goTo({
                    target: mimoradnostFeature.graphic,
                    zoom: 5
                  })
                });
              });
  
            })
          }
          else {
            node.innerHTML = '<h3>Události v provozu</h3><div class="mimoradnosti-no-messages"><calcite-icon icon="check-circle-f" scale="m"></calcite-icon><div>Nejsou hlášeny žádné události v provozu.</div></div>';
          }

          widget.iconNumber = messagesCount;
          mimoradnostiCache = data.features;
        }
        
      })
    }

    // --- Funkce ---
    // Odebrání rámečku aktivní položky v panelu mimořádných události
    function removeActiveMhdIssues() {
      var nodes = document.querySelectorAll(".mimoradnosti-widget-container .mimoradnosti-active");
      nodes.forEach(function(node) {
        node.classList.remove("mimoradnosti-active")
      });
    }

});