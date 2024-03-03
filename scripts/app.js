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


// Mimořádnosti
var mimoradnostiCache = null;

// MODULS ---
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

    // APP lAYOUT ---
    // Header bar
    document.querySelector(".title-container").innerHTML = config.headerTitle;
    document.querySelector(".logo-container").innerHTML = 
      `<a href="${config.headerLink}" target="_blank">
        <img class="logo-image" src="images/header-logo-jihlava.svg" alt="logo">
      </a>`;

    // WEBMAP ---
    // Basemaps
    // Ortofoto
    const BaseMapDefault = new Basemap({
      baseLayers: [
        new TileLayer({
          url: "https://gis.jihlava-city.cz/server/rest/services/basemaps/ORP_ortofoto/MapServer",
          opacity: 0.9999,
          title: "Letecká mapa",
        })
      ],
      title: "Letecká mapa",
      thumbnailUrl: "images/bm-letecka-aktual.png"
    });
    // Světlá
    const BaseMap_1 = new Basemap({
      baseLayers: [
        new TileLayer({
          url: "https://gis.jihlava-city.cz/server/rest/services/basemaps/ORP_zabaged_seda/MapServer",
          opacity: 0.9999,
          title: "Základní mapa - světlá"
        })
      ],
      title: "Základní mapa - světlá",
      thumbnailUrl: "images/bm-zakladni-svetla.png"
    });
    // Světlá
    const BaseMap_2 = new Basemap({
      baseLayers: [
        new TileLayer({
          url: "https://gis.jihlava-city.cz/server/rest/services/basemaps/ORP_zabaged/MapServer",
          opacity: 0.9999,
          title: "Základní mapa"
        })
      ],
      title: "Základní mapa",
      thumbnailUrl: "images/bm-zakladni.png"
    });

    // Search layers
    // Base layer
    const SearchLayerDefault = new FeatureLayer({
      url: "https://gis.jihlava-city.cz/server/rest/services/ost/ORP_RUIAN/MapServer/0",
      outFields: ["adresa, adresa_o"]
    })

    // WebMap
    var map = new WebMap({
      basemap: BaseMapDefault,
      portalItem: { 
        portal: {
          url: config.portalUrl
        },
        id: config.webmapId
      }
    });

    // View
    var view = new MapView({
      container: "viewDiv",
      map,
      padding: { top: 55 },
      popup: new Popup({
        visibleElements: {
          actionBar: false,
        }
      }),
      extent: {
        xmin: -670774.494788529,
        ymin: -1131457.7806157435,
        xmax: -668422.3442508945,
        ymax: -1128306.586813356,
        spatialReference: config.webmapSpatialReference
      }
    });

    // Operation layers
    let OperationalLayer_1 = null; // Závady - view
    let OperationalLayer_2 = null; // Katastrální území
    let OperationalLayer_3 = null; // Ulice
    
    // MAIN CODE
    // After view is loaded    
    reactiveUtils.once( () => view.ready === true )
      .then(() => {
        // Loading screen
        document.getElementById("loading-screen").remove();
  
        // Sublayers
        map.findLayerById("184c27dff38-layer-7").loadAll().then((layer) => {
          OperationalLayer_1 = layer.findSublayerById(52); 
        });
        OperationalLayer_2 = map.findLayerById("18419807330-layer-5");
        // OperationalLayer_3 = map.findLayerById("183a7fdc2b2-layer-4"); // Uilce jako samostatná vrstva - pomalé
        map.findLayerById("18e02e538d9-layer-7").loadAll().then((layer) => {
          OperationalLayer_3 = layer.findSublayerById(3); 
        });

        // Widget
        // Tlačítko Home
        var homeWidget = new Home({
          view: view,
          label: "Výchozí zobrazení mapy"
        });

        // Widget
        // Lokalizace
        var locateWidget = new Locate({
          view: view,  
          scale: 2500,
          label: "Najdi moji polohu",
        });

        // Widget
        // Legenda
        var legendNode = document.createElement("div");
        legendNode.style.padding = "10px";
        legendNode.classList.add("esri-widget--panel", "esri-widget");
        legendNode.innerHTML = config.legendWidgetContent;

        var legendWidget = new Expand({
          content: legendNode, 
          view: view,
          expandTooltip: "Legenda",
          collapseTooltip: "Sbalit legendu",
          group: "top-left",
          expandIcon: "list"
        });

        // Widget
        // O aplikaci
        var infoNode = document.createElement("div");
        infoNode.style.padding = "10px";
        infoNode.classList.add("esri-widget--panel", "esri-widget");
        infoNode.innerHTML = config.infoWidgetContent;

        var infoWidget = new Expand({
          content: infoNode, 
          view: view,
          expandTooltip: "O aplikaci",
          collapseTooltip: "Sbalit informace o aplikaci",
          group: "top-left",
          expandIcon: "question"
        });

        // Widget
        // Basemap Gallery
        var basemapWidget = new Expand({
            content: new BasemapGallery({
                view: view,
                source: new LocalBasemapsSource({
                    basemaps: [
                        BaseMapDefault,
                        BaseMap_1,
                        BaseMap_2   
                    ]
                })
            }),
            view: view,
            expandTooltip: "Podkladové mapy",
            collapseTooltip: "Sbalit podkladové mapy",
            group: "top-left"
        });

        // Add problem - map part
        // Container
        let addProblemContainer = document.createElement("div");
        addProblemContainer.classList.add("problems-map-container");

        // Button
        let addProblemBtn = document.createElement("calcite-button");
        addProblemBtn.setAttribute("scale", "l");
        addProblemBtn.setAttribute("icon-start", "plus-circle");
        addProblemBtn.innerHTML = "Nová závada";
        addProblemBtn.addEventListener("click", () => {
          showAddProblemToMapWindow(addProblemContainer, problemWindowContainer, addProblemBtn)
        });

        addProblemContainer.append(addProblemBtn);

        // Window
        let problemWindowContainer = document.createElement("div");
        problemWindowContainer.classList.add("problems-map-window");
        
        let problemWindowHeader = document.createElement("div");
        problemWindowHeader.classList.add("problems-map-window-header");

        let problemWindowBody = document.createElement("div");
        problemWindowBody.innerText = "Logika vkládání zádad.";
        problemWindowBody.classList.add("problems-map-window-body");
        
        
        let problemWindowCloseBtn = document.createElement("calcite-icon");
        problemWindowCloseBtn.setAttribute("icon", "x");
        problemWindowCloseBtn.setAttribute("scale", "l");
        problemWindowCloseBtn.setAttribute("text-label", "Zavřít");
        problemWindowCloseBtn.addEventListener("click", () => {
          closeAddProblemToMapWindow(problemWindowContainer, addProblemBtn)
        });
        problemWindowHeader.append(problemWindowCloseBtn);
        
        problemWindowContainer.append(problemWindowHeader);
        problemWindowContainer.append(problemWindowBody);
        

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

        // --- Widget ---
        // Search
        var searchWidget = new Search({ 
          view,
          includeDefaultSources: false,
          sources: [
            {
              layer: SearchLayerDefault,
              searchFields: ["adresa", "adresa_o"],
              displayField: "adresa",
              exactMatch: false,
              outFields: ["*"],
              name: "Adresní místa",
              placeholder: "Hledat adresu",
              maxResults: 6,
              maxSuggestions: 6,
              suggestionsEnabled: true,
              minSuggestCharacters: 3,
              popupEnabled: false,
              resultSymbol: {
                type: "simple-marker",
                size: "12px",  
                color: [0, 0, 0, 0],
                outline: {  
                  color: [217, 0, 18],
                  width: 2  
                }
              }
            }
          ]
        });

        // --- Layout aplikace ---
        // Uspořádání prvků
        view.ui.add(locateWidget, "top-left", 0);
        view.ui.add(homeWidget, "top-left", 1);
        view.ui.add(legendWidget, "top-left", 2);
        view.ui.add(basemapWidget, "top-left", 3);
        view.ui.add(infoWidget, "top-left", 4);
        view.ui.add(searchWidget, "top-right", 1);
        view.ui.add(addProblemContainer, "bottom-right", 1);
          
        // LAYERS VISIBILITY
        reactiveUtils.watch(function() { return([map.basemap]) }, 
        ([basemap]) => {
          if (basemap.title === 'Letecká mapa') {

            OperationalLayer_2 ? OperationalLayer_2.visible = true : "";
            OperationalLayer_3 ? OperationalLayer_3.visible = true : "";

          } 
          else {
            OperationalLayer_2 ? OperationalLayer_2.visible = false : "";
            OperationalLayer_3 ? OperationalLayer_3.visible = false : "";
          }
        }, 
        {
          initial: true
        }
      ); 

      // ELEMENTS RESIZING AND POSITIONING
      reactiveUtils.watch(function() { return([view.width, view.height]) }, 
        ([width, height]) => {
          if (width < 545) {
              // Legends widget
              if (height < 1130) { 
                legendNode.style.maxHeight = "none";
              }

              // About widget
              if (height < 1130) {
                infoNode.style.maxHeight = "none";
              }

              // Add problem button
              addProblemContainer.classList.add("mobile-layout");
              view.ui.add(addProblemContainer, "manual", 1);
              

          } 
          else {
              // Legends widget
              if (height <= 1130) {
                legendNode.style.maxHeight = (height - 300) + "px";
              }

              // About
              if (height <= 1130) {
                infoNode.style.maxHeight = (height - 350) + "px";
              }

              // Add problem button
              addProblemContainer.classList.remove("mobile-layout");
              view.ui.add(addProblemContainer, "bottom-right", 1);
             }
        }, 
        {
          initial: true
        }
      ); 

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

    // FUNCTIONS
    // Show window for adding problem point to map
    let showAddProblemToMapWindow = (container, window, btn) => {
      container.prepend(window);
      btn.setAttribute("disabled", "")
    }

    // Close window for adding problem point to map
    let closeAddProblemToMapWindow = (window, btn) => {
      window.remove();
      btn.removeAttribute("disabled")
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
        document.querySelector("#title-bar").classList.remove("invisible");
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

});