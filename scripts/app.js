// MODULS ---
require([
    "esri/WebMap",
    "esri/views/MapView",
    "esri/widgets/Popup",
    "esri/core/reactiveUtils",
    "esri/widgets/Expand",
    "esri/widgets/Home",
    "esri/widgets/Locate",
    "esri/widgets/Locate/LocateViewModel",
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
    "esri/widgets/Feature",
    "esri/widgets/Sketch/SketchViewModel"
   ], function(WebMap, MapView, Popup, reactiveUtils, Expand, Home, Locate, LocateVM, LocalBasemapsSource, TileLayer, Basemap, BasemapGallery, Search, FeatureLayer, GraphicsLayer, Graphic, Point, MapImageLayer, esriRequest, Feature, SketchViewModel) {

    // GLOBAL VARIABLES ---
    let sketchViewModel = null;

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
          actionBar: false, // Disable popup actions since JS SDK v. 4.29
        },
        viewModel: {
          includeDefaultActions: false // Disable popup actions before JS SDK v. 4.29
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

    // Sketching layer
    const sketchLayer = new GraphicsLayer();
  
    // Operation layers
    let OperationalLayer_1 = null; // Závady - view
    let OperationalLayer_2 = null; // Katastrální území
    let OperationalLayer_3 = null; // Ulice

    // Messages
    const messageSelectPlace = `<div class="problems-map-message"><calcite-icon icon="pin-tear-f"></calcite-icon> Nyní vyberte místo závady v mapě.</div>`
    const messageSelectPlaceSuccess = `<div class="problems-map-message"><calcite-icon class="problems-map-check-icon" icon="check"></calcite-icon> Místo závady úspěšně vybráno.</div>`
    
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
        // OperationalLayer_3 = map.findLayerById("183a7fdc2b2-layer-4"); // Ulice jako samostatná vrstva - pomalé
        map.findLayerById("18e02e538d9-layer-7").loadAll().then((layer) => {
          OperationalLayer_3 = layer.findSublayerById(3); 
        });

        // Sketching layer
        view.map.add(sketchLayer);

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
        let locateVM = new LocateVM({
          view
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
        // addProblemBtn.setAttribute("disabled", "");
        addProblemBtn.innerHTML = "Nahlásit novou závadu";
          
        addProblemContainer.append(addProblemBtn);

        // Window
        let problemWindowContainer = document.createElement("div");
        problemWindowContainer.classList.add("problems-map-window");
        
        let problemWindowHeader = document.createElement("div");
        problemWindowHeader.classList.add("problems-map-window-header");

        let problemWindowBody = document.createElement("div");
        problemWindowBody.innerHTML = messageSelectPlace;
        problemWindowBody.classList.add("problems-map-window-body");

        // Locate  
        let problemWindowLocateBtn = document.createElement("calcite-button");
        problemWindowLocateBtn.setAttribute("icon-start", "gps-off");
        problemWindowLocateBtn.setAttribute("scale", "s");
        problemWindowLocateBtn.setAttribute("appearance", "solid");
        problemWindowLocateBtn.setAttribute("title", "Získat vaší polohu");
        problemWindowLocateBtn.setAttribute("kind", "neutral");
        problemWindowLocateBtn.innerText = "Získat vaší polohu";
        problemWindowLocateBtn.addEventListener("click", () => {
          problemWindowLocateBtn.setAttribute("disabled", "");
          locateVM.locate().then(() => {
            problemWindowLocateBtn.removeAttribute("disabled");
          });
        });
        problemWindowHeader.append(problemWindowLocateBtn);
          
        // Close button
        let problemWindowCloseBtn = document.createElement("calcite-icon");
        problemWindowCloseBtn.setAttribute("icon", "x");
        problemWindowCloseBtn.setAttribute("scale", "l");
        problemWindowCloseBtn.setAttribute("title", "Zavřít");
        problemWindowCloseBtn.setAttribute("text-label", "Zavřít");
        problemWindowCloseBtn.addEventListener("click", () => {
          closeAddProblemToMapWindow(problemWindowContainer, addProblemBtn, problemWindowBody)
        });
        problemWindowHeader.append(problemWindowCloseBtn);
        
        problemWindowContainer.append(problemWindowHeader);
        problemWindowContainer.append(problemWindowBody);

        // Action bar
        let problemActionBar = document.createElement("div");
        problemActionBar.classList.add("problems-map-action-bar");
 
        let newAddProblemBtn = document.createElement("calcite-button");
        newAddProblemBtn.setAttribute("icon-start", "refresh");
        newAddProblemBtn.setAttribute("scale", "s");
        newAddProblemBtn.setAttribute("appearance", "solid");
        newAddProblemBtn.setAttribute("title", "Změnit místo");
        newAddProblemBtn.setAttribute("kind", "neutral");
        newAddProblemBtn.innerText = "Změnit místo";
        newAddProblemBtn.addEventListener("click", () => {
          resetSketchViewModel(problemWindowBody);
          activeSketchingToMap(problemWindowBody, problemActionBar);
        });
        problemActionBar.append(newAddProblemBtn);

        let goToFormBtn = document.createElement("calcite-button");
        goToFormBtn.setAttribute("icon-start", "caret-right");
        goToFormBtn.setAttribute("scale", "m");
        goToFormBtn.setAttribute("appearance", "solid");
        goToFormBtn.setAttribute("title", "Pokračovat");
        goToFormBtn.innerText = "Pokračovat";
        goToFormBtn.addEventListener("click", () => {
          console.log("Pokračovat");
        });
        problemActionBar.append(goToFormBtn);

        
        // Business
        addProblemBtn.addEventListener("click", () => {
          showAddProblemToMapWindow(addProblemContainer, problemWindowContainer, addProblemBtn);
          activeSketchingToMap(problemWindowBody, problemActionBar);
        });
       

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
        view.ui.add(basemapWidget, "top-left", 2);
        view.ui.add(infoWidget, "top-left", 3);
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
            // About widget
            if (height < 1130) {
              infoNode.style.maxHeight = "none";
            }

            // Add problem button
            addProblemContainer.classList.add("mobile-layout");
            view.ui.add(addProblemContainer, "manual", 1);
          } 
          else {
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

    // FUNCTIONS
    // Show window for adding problem point to map
    let showAddProblemToMapWindow = (container, window, btn) => {
      container.prepend(window);
      btn.style.display = "none";
    }

    // Close window for adding problem point to map
    let closeAddProblemToMapWindow = (window, btn, info) => {
      window.remove(); // Remove window for adding point
      btn.style.display = "flex"; // Enable create button
      resetSketchViewModel(info);
    }

    // Reset sketch view model
    let resetSketchViewModel = (info) => {
      info.innerHTML = messageSelectPlace; // Reset window message to initial state
      sketchLayer.graphics.removeAll(); // Remove graphic from map
      if (sketchViewModel) { sketchViewModel.cancel(); } // Reset sketchViewModel
    }

    // Active sketching point problem in map
    let activeSketchingToMap = (info, actionBar) => {
      // Define sketch symbol 
      sketchSymbol = {
        type: "simple-marker",
        style: "circle",
        size: 10,
        color: "#00F700",
        outline: {
          color: "#ffffff",
          width: 1.5
        }
      }

      // Create model
      sketchViewModel = new SketchViewModel({
        view,
        layer: sketchLayer,
        pointSymbol: sketchSymbol,
        defaultUpdateOptions: {highlightOptions: {enabled: false}}
      });

      // Initialize sketching
      sketchViewModel.create("point");

      // Events
      sketchViewModel.on("create", function(event) {
        if(event.state === "complete") {
          info.innerHTML = messageSelectPlaceSuccess;
          info.append(actionBar);
        }
      });
      sketchViewModel.on("update", function(event) {
        console.log("bod závady přesunut");
      });
    }
});