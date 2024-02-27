// -----------------------------------------------------------------------------------
// NASTAVENÍ MAPOVÉ APLIKACE 
// Vybraná nastavení lze provádět pomocí tohoto konfiguračního souboru (viz komentáře)
// Jiná nastavení je nutné provádět přímo v aplikaci
// -----------------------------------------------------------------------------------

var config = {

    // Obecná nastavení aplikace
    // -------------------------
    appSettings: {
        // Text v horní liště mapové aplikace
        headerTitle: "Hlášení závad",
        // Odkazy na web DPmML (odkazy jsou použity v pop-up zastávkových odjezdů)
        stopLinkfields: {
            // Odkaz na rozcestník zastávkových jízdních řádů
            schedule: "https://www.dpmost.cz/jizdnirady", 
            // Odkaz na schéma linek
            lineScheme: "https://www.dpmost.cz/mhd-mapa"
        }
    },

    // Vrstvy mapových služeb ArcGIS Server (AGS) nebo Koop
    // ----------------------------------------------------
    mapServices: {
        // Vrstva polohy vozidel MHD Koop (typ: FeatureServer)
        locationVehiclesLayer: {
            url: "https://mapy.mesto-most.cz/koop/rest/services/mhd/FeatureServer",
            title: "Poloha vozů MHD",
            sublayers: {
                // Vrstva vozidel
                vehiclesLayer: {
                    layerId: 0, // ID v rámci mapové služby
                    delayMinFormatField: "ZPOZDENI_MIN_FORMAT", // Pole: Zpoždění (formátované)
                    speedFormatField: "RYCHLOST_KM_H_FORMAT", // Pole: Rychlost (formátovaná)
                    lastStopNameField: "POSLEDNI_ZASTAVKA_NAME", // Pole: Název poslední projeté zastávky
                    barrierField: "BEZBARIEROVOST_FORMAT", // Pole: Bezbariérovost (formátovaná)
                    popupTitleField: "POPUP_TITLE", // Pole: Titulek pop-up okna
                    lineField: "CISLO_LINKY", // Pole: Číslo linky
                    vehicleNumberField: "CISLO_VOZIDLA", // Pole: Číslo vozidla
                    azimutField: "AZIMUT", // Pole: Azimut
                },
                // Neprostorová vrstva zastávkových odjezdů
                // - slouží pro generování obsahu pop-up oken u klasické bodové vrstvy zastávek publikované z AGS
                stopTable: {
                    layerId: 1, // ID v rámci mapové služby
                    popupRowField: "POPUP_ROW",
                },
            }
        },
        // Mapová služba zastávek a linek (typ: MapServer)
        linesStopLayer: {
            url: "https://mapy.mesto-most.cz/server/rest/services/Gisprojekty/MhdMost/MapServer",
            title: "Zastávky a trasy linek MHD",
            sublayers: {
                // Vrstva zastávek
                stopLayer: {
                    layerId: 0, // ID v rámci mapové služby
                    popupRefreshInterval: 15, // Interval automatického obnovení pop-up okna v sekundách
                    stopIdField: "IdZastavka", // Pole: ID zastávky
                    postIdField: "SLOUPEK", // Pole: ID směru (zastávkového sloupku)
                    stopNameField: "NAZEV", // Pole: Název zastávky
                    typeField: "TYP", // Pole: ID typu MHD (autobus nebo tramvaj)
                    typeNameField: "TYP_NAZEV", // Pole: Název typu MHD (autobus nebo tramvaj)
                    linesField: "LINKY", // Pole: Seznam linek, která zastávka obsluhuje
                    directionField: "SMER", // Pole: Název směru (zastávkového sloupku) podle OGIS
                    zoneField: "PASMO" // Pole: Tarifní pásmo
                },
                // Vrstva linií linek AGS
                linesLayer: {
                    lineField: "LINKY", // Pole: Čísla linek
                },
            }
        },
        // Mapová služba mimořádností MHD (typ: MapServer)
        mimoradnostiService: {
            refreshInterval: 2, // Interval automatického obnovení panelu s mimořádnostmi a prvků mimořádností v mapě v minutách (lze zadávat i desetinná čísla)
            url: "https://mapy.mesto-most.cz/server/rest/services/Gisprojekty/MhdMostMimoradnosti_view/MapServer",
            title: "Mimořádné události"
        },
        // Vrstva adresních míst AGS pro hledání widgetem Search (typ: MapServer)
        ruianSearchLayer: {
            url: "https://mapy.mesto-most.cz/server/rest/services/RUIAN/RUIAN_Geocoding/MapServer",
            sublayers: {
                // Adresní místa
                adresyLayer: {
                    layerId: 1,
                },
                // Bloky
                blokyLayer: {
                    layerId: 3,
                }
            }
        },
    },

    // Webová mapa
    // -----------
    webmap: {
        // Souřadnicový systém webové mapy
        spatialReference: 5514,
    },

    // Widgety mapové aplikace
    // -----------------------
    appWidgets: {
        // Widget Filtr linek
        filterWidget: {
            // Seznam linek DPmML (typ: array)
            linesList: [1, 2, 3, 4, 5, 8, 9, 10, 12, 13, 14, 15, 16, 17, 18, 20, 21, 22, 23, 25, 27, 28, 30, 31, 40, 50, 51, 53, 60],
        },
        // Widget O aplikaci
        infoWidget: {
            // Text popisující aplikaci, lze vkládat HTML tagy (typ: string)
            // Pro úpravu lze použít soubor "o_aplikaci_sablona.html" a postupovat dle komentářů v něm
            content: "<div class='custom-info-widget'> <h3>Poloha vozidel MHD v Mostě a Litvínově</h3><div class='custom-info-widget cutom-block-info'><h4>Instalace aplikace</h4><p>Ačkoliv lze tuto aplikaci používat standardně v jakémkoliv webovém prohlížeči, je možné ji také instalovat do zařízení jako tzv. <a target='_blank' href='https://web.dev/progressive-web-apps/'>progresivní webovou aplikaci (PWA)</a>. Po instalaci se pak aplikace chová jako ostatní aplikace pro Android, iOS apod. Instalace se provádí přímo z webového prohlížeče. V případě mobilního Chrome je možné instalaci provést takto: <b>1. Klik na tři tečky vpravo nahoře; 2. Instalovat aplikaci</b>. V případě dalších prohlížečů se může postup drobně lišit. </p></div><div class='custom-info-widget cutom-block-info'> <h4>Obsah mapové aplikace</h4> <p><span class='info-h5'>Aktuální poloha vozidel MHD</span><br> Poloha je aktualizována s cca 6s až 10s zpožděním oproti realitě. Vozidla jsou v mapě barevně odlišena dle jejich aktuálního zpoždění a stavu - více v legendě. V případě pohybu vozidla je zobrazován jeho směr pomocí šipky. Po kliknutí na vozidlo se zobrazí podrobnosti a je vyznačena trasa linky. Pokud má linka více tras, jsou vyznačeny všechny - není zohledněna trasa aktuálně vybraného vozidla. </p> <p><span class='info-h5'>Zastávky MHD</span><br> Po kliknutí na zastávku se zobrazí aktuální zastávkové odjezdy, přehled linek a tarifní pásmo. Zastávkové odjezdy jsou automaticky aktualizovány. </p> <p> <span class='info-h5'>Trasy linek MHD</span><br> Vyznačené trasy jsou doplněny dynamickými popisky linek, které do daného úseku zajíždějí. </p> </div> <div class='custom-info-widget cutom-block-info'> <h4>Práce s aplikací</h4> <p><span class='esri-icon esri-icon-locate custom-icon'></span> <span class='info-h5'>Najdi moji polohu</span><br> Pokud na svém zařízení povolíte přístup k poloze, aplikace zobrazí vaši polohu v mapě. </p> <p><span class='bookmarks-info'>MO</span>&nbsp;&nbsp;|&nbsp<span class='bookmarks-info'>LIT</span><span class='info-h5'>&nbsp;&nbsp;Přiblížit na...</span><br> Pomocí nástrojů Přiblížit na Most a Přiblížit na Litvínov lze mapu rychle zoomovat na požadované město. </p> <p><span class='esri-collapse__icon esri-icon-layer-list custom-icon'></span> <span class='info-h5'>Legenda</span><br> Nástroj vysvětluje význam symbolů a jejich barev v mapě. </p> <p><span class='esri-collapse__icon esri-icon-basemap custom-icon'></span> <span class='info-h5'>Podkladové mapy</span><br> Nástroj umožňuje přepnout podkladovou mapu, např. na letecký snímek. </p> <p><span class='esri-collapse__icon esri-icon-filter custom-icon'></span> <span class='info-h5'>Filter linek</span><br> Nástroj umožňuje zobrazit v mapě vozidla pouze vybraných linek. Ostatní (nevybrané) linky se skyryjí. </p> <p><span class='esri-icon-search custom-icon'></span> <span class='info-h5'>Hledání</span><br> Vyhledávání zastávek MHD, adres a bloků budov (bloky pouze pro město Most). Hledání je po startu aplikace nastaveno na hledání zastávek. Pro hledání adres a bloků budov je nutné nástroj přepnout pomocí šipky dolů. </p> </div> <div class='custom-info-widget cutom-block-info'> <h4>Data</h4> <p> V aplikaci jsou využívána real-time data <a href='http://www.dpmost.cz/' target='_blank'>Dopravního podniku měst Mostu a Litvínova, a.s.</a> Aplikace má pouze informativní charakter a nenahrazuje platné <a href='http://www.dpmost.cz/jizdnirady' target='_blank'>jízdní řády</a>. </p> </div> <div class='custom-info-widget cutom-block-info'> <h4>Kontakty</h4> <p> Statutární město Most, Odbor informačního systému, oddělení GIS (kontakty <a href='https://www.mesto-most.cz/oddeleni-gis/os-1053' target='_blank'>ZDE</a>).</p></div></div>"
        },
        legendWidget: {
            // Obsah widgetu legenda, lze vkládat HTML tagy (typ: string)
            // Pro úpravu lze použít soubor "legend_sablona.html" a postupovat dle komentářů v něm
            content: "<div class='custom-legend-widget'> <h3>Legenda</h3> <div class='custom-legend-widget cutom-block-info'><h4>Zpoždění vozidla MHD</h4><table><tr><td><img src='images/legend-bez-zpozdeni.svg' alt='Bez zpoždění'></td> <td>Bez zpoždění</td></tr><tr><td><img src='images/legend-zpozdeni-1-minuta.svg' alt='Zpoždění 1 minuta'></td> <td>Zpoždění 1 minuta</td></tr><tr><td><img src='images/legend-zpozdeni-2-4-minut.svg' alt='Zpoždění 2-4 minuty'></td> <td>Zpoždění 2-4 minuty</td></tr><tr><td><img src='images/legend-zpozdeni-5-minut.svg' alt='Zpoždění 5 minut a více'></td><td>Zpoždění 5 minut a více</td></tr></table></div><div class='custom-legend-widget cutom-block-info'> <h4>Linka MHD</h4> <table> <tr> <td><img src='images/legend-cislo-linky.svg' alt='Číslo linky'></td> <td>Číslo linky</td> </tr> </table> </div> <div class='custom-legend-widget cutom-block-info'><h4>Stav vozidla MHD</h4> <table> <tr> <td><img src='images/legend-ve-stanici.svg' alt='Ve stanici'></td> <td>Ve stanici</td></tr><!-- <tr> <td> <img src='images/legend-cekani.svg' alt='Čekání před jízdou'></td> <td>Čekání před jízdou</td> </tr> --><tr><td><img src='images/legend-pohyb.svg' alt='V pohybu'></td> <td>Jízda mezi zastávkami</td> </tr> <tr> <td><img src='images/legend-prvni-zastavka.svg' alt='Jízda na 1. zastávku na trase'></td> <td>Jízda na 1. zastávku na trase</td> </tr> </table> </div> <div class='custom-legend-widget cutom-block-info'> <h4>Zastávky a trasy</h4> <table> <tr> <td><img src='images/legend-zastavka.svg' alt='Zastávka MHD'></td> <td>Zastávka MHD</td> </tr> <tr> <td><img src='images/legend-trasa.svg' alt='Trasa linky'></td> <td>Zastávka MHD</td></tr></table></div></div>"
        }
    },

    // Informační banner
    // -----------------
    infoBanner: {
        enable: true,
        type: "danger", // Může nabývat hodnot: danger, warning, success
        content: "Vážení uživatelé, aplikace Poloha vozidel MHD nebude o víkendu <b>8.10. - 9.10. 2022</b> plně funkční. Za komplikace se omlouváme."
    },

    // Cookies lišta
    cookiesBar: {
        enable: true,
        content: "Tato aplikace používá soubory cookies, více <a href='https://www.mesto-most.cz/vismo/o-webu.asp#cookies' target='_blank'>ZDE</a>."
    },

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