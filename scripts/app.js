// ARCGIS JS API MODULS ---
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

    // Sketching state
    let sketchingState = false;

    // Form state
    let formState = {
      geometry: null,
      category: null,
      description: null,
      email: null,
      attachment: null
    };

    // DOM ---
    // MESSAGES
    const messageSelectPlace = `
      <div class="problems-map-message-select problems-info">
        <div>
          <calcite-icon icon="cursor-selection" scale="s"></calcite-icon> 
          Kliknutím vyberte místo závady v mapě.
        </div> 
        <div>
          Místo závady je možné vybrat také automaticky na základě vaší aktuální polohy.
          <span>
            <calcite-link id="locate-tooltip">[ ? ]</calcite-link>
            <calcite-tooltip label="Nápověda" reference-element="locate-tooltip">
              <span>Povolte zjišťování polohy ve svém prohlížeči. Nastavení se nejčastěji nachází v oblasti adresního řádku.</span>
            </calcite-tooltip>
          </span>
        </div>
      </div>`
    const messageSelectPlaceSuccess = `
      <div class="problems-map-message-selected">
        <calcite-icon class="problems-map-check-icon" icon="check"></calcite-icon> 
        Místo závady úspěšně vybráno.
      </div>`
    const messageInitialFormCategory = "Typ závady nezvolen";
    const messageInitialFormDescription = "Popis závady nevložen.";
    const messageInitialFormEmail = "e-mail nevložen.";
    const messageInitialFormAttachment = "Fotografie nepřipojena.";
    

    // PROBLEM WINDOW
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

    // Window container
    let problemWindowContainer = document.createElement("div");
    problemWindowContainer.classList.add("problems-map-window");
    
    // Window header
    let problemWindowHeader = document.createElement("div");
    problemWindowHeader.classList.add("problems-header");

    // Window title
    let problemWindowTitle = document.createElement("div");
    problemWindowTitle.innerText = "Místo závady";
    problemWindowTitle.classList.add("problems-map-window-title");
    problemWindowHeader.append(problemWindowTitle);

    // Locate  
    let problemWindowLocateBtn = document.createElement("calcite-button");
    problemWindowLocateBtn.setAttribute("icon-start", "gps-off");
    problemWindowLocateBtn.setAttribute("kind", "neutral");
    problemWindowLocateBtn.setAttribute("scale", "m");
    problemWindowLocateBtn.setAttribute("alignment", "start");
    problemWindowLocateBtn.innerText = "Moje poloha";
    
    // Close button
    let problemWindowCloseBtn = document.createElement("calcite-icon");
    problemWindowCloseBtn.setAttribute("icon", "x");
    problemWindowCloseBtn.setAttribute("scale", "l");
    problemWindowCloseBtn.setAttribute("title", "Zavřít");
    problemWindowCloseBtn.setAttribute("text-label", "Zavřít");
    problemWindowCloseBtn.addEventListener("click", () => {
      closeAddProblemToMapWindow();
    });
    problemWindowHeader.append(problemWindowCloseBtn);

    // Window body
    let problemWindowBody = document.createElement("div");
    problemWindowBody.innerHTML = messageSelectPlace;
    problemWindowBody.append(problemWindowLocateBtn);
    problemWindowBody.classList.add("problems-body");
    
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
      resetSketchViewModel();
      activateSketchingToMap(problemWindowBody, problemActionBar);
    });
    problemActionBar.append(newAddProblemBtn);

    let goToFormBtn = document.createElement("calcite-button");
    goToFormBtn.setAttribute("icon-start", "caret-right");
    goToFormBtn.setAttribute("scale", "m");
    goToFormBtn.setAttribute("appearance", "solid");
    goToFormBtn.setAttribute("title", "Pokračovat");
    goToFormBtn.innerText = "Pokračovat";
    goToFormBtn.addEventListener("click", () => {
      showProblemFormContainer();
    });
    problemActionBar.append(goToFormBtn);

    // PROBLEM FORM
    // Container
    let problemFormContainer = document.getElementById("problems-form-container");
    let overlayEl = document.querySelector(".overlay");
    let problemLoading = document.querySelector(".problem-loading");
    let problemFormCloseBtn = document.querySelector("#problems-form-container .problems-close");
    let problemSendBtn = document.querySelector("#problems-form-container .problems-footer calcite-button");
    // Form
    let problemFormCategory = document.querySelector("#problems-form-container .problem-category");
    let problemFormDescription = document.querySelector("#problems-form-container .problem-description");
    let problemFormEmail = document.querySelector("#problems-form-container .problem-email");
    // Attachment
    let problemFormAttachment = document.querySelector("#problems-form-container .problem-attachment");
    let attachmentFormEl = document.getElementById("attachmentForm");
		let attachmentInputEl = document.getElementById("attachmentInput");
		let removeAttachmentBtn = document.getElementById("attachmentRemove");
		let addAttachmentBtn = document.getElementById("addAttachmentBtn");
    
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

    // Sketching layer and model
    const sketchLayer = new GraphicsLayer();

    const sketchSymbol = {
      type: "simple-marker",
      style: "circle",
      size: 15,
      color: "#00F700",
      outline: {
        color: "#ffffff",
        width: 1.5
      }
    }
    
    const sketchViewModelOptions = {
      view,
      layer: sketchLayer,
      pointSymbol: sketchSymbol,
      defaultUpdateOptions: {highlightOptions: {enabled: false}}
    };

    // Edit layer
    const EditLayer = new FeatureLayer({
      url: config.editFeatureUrl,
      outFields: ["*"]
    })
    
    // Locate layer
    const locateLayer = new GraphicsLayer();
  
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
        // OperationalLayer_3 = map.findLayerById("183a7fdc2b2-layer-4"); // Ulice jako samostatná vrstva - pomalé
        map.findLayerById("18e02e538d9-layer-7").loadAll().then((layer) => {
          OperationalLayer_3 = layer.findSublayerById(3); 
        });

        // Locate layer
        view.map.add(locateLayer);

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
          view,
          scale: 500,
          popupEnabled: false,
          label: "Najdi moji polohu",
        });
        let locateVM = new LocateVM({
          view,
          scale: 500,
          popupEnabled: false,
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

        // Widget
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

        // Custom widget
        // Add problem window
        addProblemBtn.addEventListener("click", () => {
          showAddProblemToMapWindow();
          activateSketchingToMap();
        });
        problemWindowLocateBtn.addEventListener("click", () => {
          problemWindowLocateBtn.setAttribute("loading", "");
          problemWindowLocateBtn.removeAttribute("icon-start");
          problemWindowLocateBtn.setAttribute("disabled", "");
          locateVM.locate().then((e) => {
            view.graphics.removeAll();  
            placeSketchToMapDirectly(e);
            problemWindowLocateBtn.removeAttribute("disabled");
            problemWindowLocateBtn.removeAttribute("loading");
            problemWindowLocateBtn.setAttribute("icon-start", "gps-off");
          });
        });
        // Form
        // Category
        config.problemTyp.forEach((category) => {
          let categoryCardEl = document.createElement("calcite-card");
          let categoryImage = document.createElement("img");
          categoryImage.setAttribute("slot", "thumbnail");
          categoryImage.setAttribute("alt", `${category.name}`);
          categoryImage.setAttribute("src", `${category.image}`);
          let categoryTitle = document.createElement("span");
          categoryTitle.setAttribute("slot", "title");
          categoryTitle.innerText = `${category.name}`;
          categoryCardEl.append(categoryImage);
          categoryCardEl.append(categoryTitle);
          categoryCardEl.addEventListener("click", () => {
            resetAllCardSelection();
            selectCategory(categoryCardEl, category);
            setState("category", category.code);
          })
          problemFormCategory.children[1].append(categoryCardEl);
        })
        setValidationMessage(problemFormCategory, "invalid", "information", messageInitialFormCategory)
        // Description
        problemFormDescription.querySelector("calcite-text-area").addEventListener("calciteTextAreaInput", (e) => {
          let actualTextLength = e.target.value.length;
          let maxTextLength = e.target.maxLength;
          if (actualTextLength > 0 && actualTextLength <= maxTextLength) {
            setValidationMessage(problemFormDescription, "valid", "check", "Popis závady vložen.");
            setState("description", e.target.value);
          }
          else if (actualTextLength === 0) {
            setValidationMessage(problemFormDescription, "invalid", "exclamation-mark-triangle", "Chybí popis závady.");
            setState("description", null);
          }
          else if (actualTextLength > maxTextLength) {
            setValidationMessage(problemFormDescription, "invalid", "exclamation-mark-triangle", "Překročen povolený počet znaků pro popis závady.")
            setState("description", null);
          }
        })
        setValidationMessage(problemFormDescription, "invalid", "information", messageInitialFormDescription);
        // Email
        problemFormEmail.querySelector("calcite-input").addEventListener("calciteInputInput", (e) => {
          if (e.target.value.length > 0) {
            if(validateEmail(e.target.value)) {
              setValidationMessage(problemFormEmail, "valid", "check", "e-mail vložen.");
              setState("email", e.target.value)
            }
            else {
              setValidationMessage(problemFormEmail, "invalid", "exclamation-mark-triangle", "Chybný e-mail.");
              setState("email", null);
            }
          }
          else {
            setValidationMessage(problemFormEmail, "invalid", "exclamation-mark-triangle", messageInitialFormEmail);
            setState("email", null);
          }  
        })
        setValidationMessage(problemFormEmail, "invalid", "information", messageInitialFormEmail);
        // Attachment
        addAttachmentBtn.addEventListener("click", () => {
          attachmentInputEl.click();
        });
        attachmentInputEl.addEventListener("change", (e) => {
          if (e.target.files[0]) {
            let file = e.target.files[0];
            let fileType = file.type.split("/")[0]
            if (fileType === "image") {
                setState("attachment", attachmentFormEl);
                afterAttachmentLoaded(file);
            }
            else {
              setState("attachment", null);
              afterBadFileLoaded();
            }
          }
        })
        removeAttachmentBtn.addEventListener("click", () => {
          setState("attachment", null);
          removeAttachment();		
        })
        setValidationMessage(problemFormAttachment, "invalid", "information", messageInitialFormAttachment)
        // Close form
        problemFormCloseBtn.addEventListener("click", () => {
          closeProblemFormContainer();
        });
        overlayEl.addEventListener("click", (e) => {
          if(e.target === overlayEl) {
            closeProblemFormContainer();
          }
        });
        // Send form
        problemSendBtn.addEventListener("click", () => {
          let featureForSend = createFeatureForSend();
          addLoadingScreenOverForm();
          EditLayer.applyEdits( {addFeatures: [featureForSend]} )
            .then((result) => {
              let featureId = result.addFeatureResults[0].globalId;
              EditLayer.queryFeatures({
                where: `globalid='${featureId}'`,
                outFields: ["*"]
              }).then((result) => {
                EditLayer.addAttachment(result.features[0], formState.attachment).then((result) => {
                  removeLoadingScreenOverForm();
                  resetApp();
                })
              })
            })
            .catch((error) => {
              console.log(error);
              removeLoadingScreenOverForm();
              resetApp();
            })
        })

        // Widgets positioning
        view.ui.add(locateWidget, "top-left", 0);
        view.ui.add(homeWidget, "top-left", 1);
        view.ui.add(basemapWidget, "top-left", 2);
        view.ui.add(infoWidget, "top-left", 3);
        view.ui.add(searchWidget, "top-right", 1);
        view.ui.add(addProblemContainer, "bottom-right", 1);
          
        // WATCHING EVENTS
        // Layers visibility
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

        // Elements resizing and positioning
        reactiveUtils.watch(function() { return([view.width, view.height]) }, 
          ([width, height]) => {
            if (width < 545) {
              // About widget
              if (height < 1130) {
                infoNode.style.maxHeight = "none";
              }

              // Add problem button
              addProblemContainer.classList.add("mobile-layout");
              problemFormContainer.classList.add("mobile-layout");
              problemLoading.classList.add("mobile-layout");
              view.ui.add(addProblemContainer, "manual", 1);
            } 
            else {
              // About
              if (height <= 1130) {
                infoNode.style.maxHeight = (height - 350) + "px";
              }

              // Add problem button
              addProblemContainer.classList.remove("mobile-layout");
              problemFormContainer.classList.remove("mobile-layout");
              problemLoading.classList.remove("mobile-layout");
              view.ui.add(addProblemContainer, "bottom-right", 1);
            }
          }, 
          {
            initial: true
          }
        ); 

        // Disable sketching when map pan
        reactiveUtils.watch(function() { return([view.interacting]) }, 
          ([interacting]) => {
            if(sketchingState === true) {
              if (interacting ===  true) {
                resetSketchViewModel();
              } 
              else {
                activateSketchingToMap();
              }
            }
          }
        ); 

        // Locate
        locateWidget.on("locate", () => {
          moveLocateGraphicUnderSketch();
        })
    });

    // FUNCTIONS ---
    // HTML
    // Problem window
    // Show window for adding problem point to map
    let showAddProblemToMapWindow = () => {
      addProblemContainer.prepend(problemWindowContainer);
      addProblemBtn.style.display = "none";

      sketchingState = true;
    }

    // Close window for adding problem point to map
    let closeAddProblemToMapWindow = () => {
      problemWindowContainer.remove(); // Remove window for adding point
      addProblemBtn.style.display = "flex"; // Enable create button
      resetSketchViewModel();
      
      sketchingState = false;
    }

    let changeMessageInProblemToMapWindow = (message, actionBar) => {
      problemWindowBody.innerHTML = message;
      problemWindowBody.append(actionBar);
    }

    // Problems form
    // Show problems form
    let showProblemFormContainer = () => {
      overlayEl.classList.add("opened");
    }
    let closeProblemFormContainer = () => {
      overlayEl.classList.remove("opened");
    }

    // Category
    let selectCategory = (categoryCardEl, category) => {
      setValidationMessage(problemFormCategory, "valid", "check", `Zvolen typ závady: ${category.name}`)
      categoryCardEl.setAttribute("selected", "");
    }

    let resetAllCardSelection = () => {
      problemFormCategory.querySelectorAll("calcite-card").forEach((card) => {
        card.removeAttribute("selected");
      })
    }

    // Attachment
    // Remove attachement
    const removeAttachment = () => {
      setValidationMessage(problemFormAttachment, "invalid", "exclamation-mark-triangle", messageInitialFormAttachment)
      removeAttachmentBtn.style.display = "none";
      attachmentFormEl.reset();
    }

    // DOM after image loaded
    const afterAttachmentLoaded = (imageFile) => {
      removeAttachmentBtn.style.display = "inline-block";
      addInfoAboutImageToInput(imageFile);
    }

    // DOM after bad file loaded
    const afterBadFileLoaded = () => {
      setValidationMessage(problemFormAttachment, "invalid", "exclamation-mark-triangle", "Nepodporovaný soubor!")
      removeAttachmentBtn.style.display = "none";
    }

    // Info about added image
    const addInfoAboutImageToInput = (imageFile) => {
      setValidationMessage(problemFormAttachment, "valid", "check", `${imageFile.name} (${formatFileSize(imageFile.size)})`)
    }

    // Validation message
    let setValidationMessage = (el, status, icon, text) => {
      let messageEl = el.querySelector("calcite-input-message");
      messageEl.innerText = text;
      messageEl.status = status;
      messageEl.icon = icon;
    }

    // Loading over form
    let addLoadingScreenOverForm = () => {
      problemLoading.style.display = "block";
    }
    let removeLoadingScreenOverForm = () => {
      problemLoading.style.display = "none";
    }

    // Reset form inputs
    let resetForm = () => {
      resetAllCardSelection();
      document.querySelectorAll(".problem-input").forEach((input) => {
        input.value = null;
      });

      attachmentFormEl.reset();
      removeAttachment();	

      setValidationMessage(problemFormCategory, "invalid", "information", messageInitialFormCategory)
      setValidationMessage(problemFormDescription, "invalid", "information", messageInitialFormDescription);
      setValidationMessage(problemFormEmail, "invalid", "information", messageInitialFormEmail);
      setValidationMessage(problemFormAttachment, "invalid", "information", messageInitialFormAttachment);

      closeAddProblemToMapWindow();
    }
    
    // BUSINESS - MAIN
    // Geometry
    // Reset sketch view model
    let resetSketchViewModel = () => {
      changeMessageInProblemToMapWindow(messageSelectPlace, problemWindowLocateBtn); 
      sketchLayer.graphics.removeAll(); // Remove graphic from map
      if (sketchViewModel) { sketchViewModel.cancel(); } // Reset sketchViewModel

      setState("geometry", null);
    }

    // Active sketching point problem in map
    let activateSketchingToMap = () => {
      // Create model
      sketchViewModel = new SketchViewModel(sketchViewModelOptions);
      // Initialize sketching
      sketchViewModel.create("point");
      // Move locate graphic under závada graphic
      moveLocateGraphicUnderSketch()
      // Events
      sketchViewModel.on("create", function(e) {
        console.log(e.state);
        if(e.state === "complete") {
          changeMessageInProblemToMapWindow(messageSelectPlaceSuccess, problemActionBar); 
          
          setState("geometry", e.graphic);
        }
      });
      sketchViewModel.on("update", function(e) {

        setState("geometry", e.graphics[0]);
      });
    }

    // Geometry from location
    let placeSketchToMapDirectly = (e) => {
      sketchViewModel.cancel();
      // Create map graphic
      let graphic = new Graphic({
        geometry: {
          type: "point",
          longitude: e.coords.longitude, 
          latitude: e.coords.latitude
        },
        symbol: sketchSymbol
      });
      sketchLayer.graphics.add(graphic);
      changeMessageInProblemToMapWindow(messageSelectPlaceSuccess, problemActionBar); 
      
      setState("geometry", graphic);
    }

    // Validate send form button
    let validateSendButton = () => {
      let valid = false;
      for (let prop in formState) {
        if (formState[prop] === null) {
            valid = false;
            break;
        }
        else {
          valid = true;
        }
      }
      valid ? problemSendBtn.removeAttribute("disabled") : problemSendBtn.setAttribute("disabled", "");
    }

    // Create feature for send 
    let createFeatureForSend = () => {
      let feature = formState.geometry;
      feature.setAttribute("typ", formState.category);
      feature.setAttribute("email", formState.email);
      feature.setAttribute("poznamka", formState.description);
      return(feature)
    }

    let resetApp = () => {
      resetState();
      resetForm();
      console.log("TODO: close form");
      console.log("TODO: close window");
      console.log("TODO: success message");
    }

    // Set state
    let setState = (type, value) => {
      formState[type] = value;
      validateSendButton();
      console.log(`State update - ${type}: `, formState);
    }

    let resetState = () => {
      for(var props in formState) {
        formState[props] = null
      }
      console.log(`State reset: `, formState);
    }

    // BUSINESS - OTHER
    // Move locate graphic under závada graphic
    let moveLocateGraphicUnderSketch = () => {
      if (view.graphics) {
        view.graphics.forEach(graphic => {
          if (graphic.attributes) {
            if ('altitudeAccuracy' in graphic.attributes) {
              view.graphics.removeAll(); 
              locateLayer.add(graphic);
            }
          }
        });
      }
    }

    // Email validation
    let validateEmail = (email) => {
      return String(email)
        .toLowerCase()
        .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    };

    // Format file size
    let formatFileSize = (size) => {
      if(size < 1000000){
        return(Math.floor(size/1000) + ' kB');
      }
      else {
        return(Math.floor(size/1000000) + ' MB');  
      }
    } 
});