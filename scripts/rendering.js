var vehicleLabel = {
    symbol: {
      type: "text",  
      color: "white",
      font: {  
        family: "Arial",
        size: 10,
        weight: "bold"
      }
    },
    labelPlacement: "center-center",
    labelExpressionInfo: {
      expression: "$feature.CISLO_LINKY"
    }
};


var vehicleRenderer = [
    {
      value: "PrvniZastavka", 
      symbol: {
        type: "cim",
        data: {
          type: "CIMSymbolReference",
          symbol: symbolVehicleMove([138,138,138,255]),
        }
      },
    },
    {
      value: "Zpozdeni0-Pohyb", 
      symbol: {
        type: "cim",
        data: {
          type: "CIMSymbolReference",
          symbol: symbolVehicleMove([77,179,70,255]),
        }
      },
    },
    {
      value: "Zpozdeni1-Pohyb", 
      symbol: {
        type: "cim",
        data: {
          type: "CIMSymbolReference",
          symbol: symbolVehicleMove([129,176,2,255]),
        }
      },
    },
    {
      value: "Zpozdeni2-Pohyb", 
      symbol: {
        type: "cim",
        data: {
          type: "CIMSymbolReference",
          symbol: symbolVehicleMove([230,158,87,255]),
        }
      },
    },
    {
      value: "Zpozdeni3-Pohyb", 
      symbol: {
        type: "cim",
        data: {
          type: "CIMSymbolReference",
          symbol: symbolVehicleMove([230,58,46,255]),
        }
      },
    },
    {
      value: "Zpozdeni0-Zastavka", 
      symbol: {
        type: "cim",
        data: {
          type: "CIMSymbolReference",
          symbol: symbolVehicleStop([77,179,70,255]),
        }
      },
    },
    {
      value: "Zpozdeni1-Zastavka", 
      symbol: {
        type: "cim",
        data: {
          type: "CIMSymbolReference",
          symbol: symbolVehicleStop([129,176,2,255]),
        }
      },
    },
    {
      value: "Zpozdeni2-Zastavka", 
      symbol: {
        type: "cim",
        data: {
          type: "CIMSymbolReference",
          symbol: symbolVehicleStop([230,158,87,255]),
        }
      },
    },
    {
      value: "Zpozdeni3-Zastavka", 
      symbol: {
        type: "cim",
        data: {
          type: "CIMSymbolReference",
          symbol: symbolVehicleStop([230,58,46,255]),
        }
      },
    }
];

function symbolVehicleMove (color) {
    return {
    "type": "CIMPointSymbol",
    "symbolLayers": [
      {
        "type": "CIMVectorMarker",
        "enable": true,
        "anchorPoint": {
          "x": 0,
          "y": 0
        },
        "anchorPointUnits": "Relative",
        "dominantSizeAxis3D": "Y",
        "size": 18,
        "billboardMode3D": "FaceNearPlane",
        "frame": {
          "xmin": 0,
          "ymin": 0,
          "xmax": 17,
          "ymax": 17
        },
        "markerGraphics": [
          {
            "type": "CIMMarkerGraphic",
            "geometry": {
              "rings": [
                [
                  [
                    8.5,
                    0
                  ],
                  [
                    7.02,
                    0.13
                  ],
                  [
                    5.59,
                    0.51
                  ],
                  [
                    4.25,
                    1.14
                  ],
                  [
                    3.04,
                    1.99
                  ],
                  [
                    1.99,
                    3.04
                  ],
                  [
                    1.14,
                    4.25
                  ],
                  [
                    0.51,
                    5.59
                  ],
                  [
                    0.13,
                    7.02
                  ],
                  [
                    0,
                    8.5
                  ],
                  [
                    0.13,
                    9.98
                  ],
                  [
                    0.51,
                    11.41
                  ],
                  [
                    1.14,
                    12.75
                  ],
                  [
                    1.99,
                    13.96
                  ],
                  [
                    3.04,
                    15.01
                  ],
                  [
                    4.25,
                    15.86
                  ],
                  [
                    5.59,
                    16.49
                  ],
                  [
                    7.02,
                    16.87
                  ],
                  [
                    8.5,
                    17
                  ],
                  [
                    9.98,
                    16.87
                  ],
                  [
                    11.41,
                    16.49
                  ],
                  [
                    12.75,
                    15.86
                  ],
                  [
                    13.96,
                    15.01
                  ],
                  [
                    15.01,
                    13.96
                  ],
                  [
                    15.86,
                    12.75
                  ],
                  [
                    16.49,
                    11.41
                  ],
                  [
                    16.87,
                    9.98
                  ],
                  [
                    17,
                    8.5
                  ],
                  [
                    16.87,
                    7.02
                  ],
                  [
                    16.49,
                    5.59
                  ],
                  [
                    15.86,
                    4.25
                  ],
                  [
                    15.01,
                    3.04
                  ],
                  [
                    13.96,
                    1.99
                  ],
                  [
                    12.75,
                    1.14
                  ],
                  [
                    11.41,
                    0.51
                  ],
                  [
                    9.98,
                    0.13
                  ],
                  [
                    8.5,
                    0
                  ]
                ]
              ]
            },
            "symbol": {
              "type": "CIMPolygonSymbol",
              "symbolLayers": [
                {
                  "type": "CIMSolidStroke",
                  "enable": true,
                  "capStyle": "Round",
                  "joinStyle": "Round",
                  "lineStyle3D": "Strip",
                  "miterLimit": 10,
                  "width": 1.5,
                  "color": [
                    255,
                    255,
                    255,
                    255
                  ]
                },
                {
                  "type": "CIMSolidFill",
                  "enable": true,
                  "color": color
                }
              ]
            }
          }
        ],
        "scaleSymbolsProportionally": true,
        "respectFrame": true,
        "rotation": 0
      },
      {
        "type": "CIMVectorMarker",
        "enable": true,
        "anchorPointUnits": "Relative",
        "dominantSizeAxis3D": "Y",
        "size": 13,
        "billboardMode3D": "FaceNearPlane",
        "frame": {
          "xmin": 0,
          "ymin": 0,
          "xmax": 17,
          "ymax": 17
        },
        "markerGraphics": [
          {
            "type": "CIMMarkerGraphic",
            "geometry": {
              "rings": [
                [
                  [
                    0,
                    0.65
                  ],
                  [
                    8.5,
                    16.35
                  ],
                  [
                    17,
                    0.65
                  ],
                  [
                    0,
                    0.65
                  ]
                ]
              ]
            },
            "symbol": {
              "type": "CIMPolygonSymbol",
              "symbolLayers": [
                {
                  "type": "CIMSolidStroke",
                  "enable": true,
                  "capStyle": "Round",
                  "joinStyle": "Round",
                  "lineStyle3D": "Strip",
                  "miterLimit": 10,
                  "width": 2,
                  "color": [
                    255,
                    255,
                    255,
                    255
                  ]
                },
                {
                  "type": "CIMSolidFill",
                  "enable": true,
                  "color": color
                }
              ]
            }
          }
        ],
        "scaleSymbolsProportionally": true,
        "respectFrame": true,
        "offsetY": 10,
        "anchorPoint": {
          "x": 0,
          "y": 0
        },
        "rotateClockwise": false,
        "rotation": 0
      },
      {
        "type": "CIMVectorMarker",
        "enable": true,
        "anchorPoint": {
          "x": 0,
          "y": 0
        },
        "anchorPointUnits": "Relative",
        "dominantSizeAxis3D": "Y",
        "size": 37,
        "billboardMode3D": "FaceNearPlane",
        "frame": {
          "xmin": 0,
          "ymin": 0,
          "xmax": 17,
          "ymax": 17
        },
        "markerGraphics": [
          {
            "type": "CIMMarkerGraphic",
            "geometry": {
              "rings": [
                [
                  [
                    8.5,
                    0
                  ],
                  [
                    7.02,
                    0.13
                  ],
                  [
                    5.59,
                    0.51
                  ],
                  [
                    4.25,
                    1.14
                  ],
                  [
                    3.04,
                    1.99
                  ],
                  [
                    1.99,
                    3.04
                  ],
                  [
                    1.14,
                    4.25
                  ],
                  [
                    0.51,
                    5.59
                  ],
                  [
                    0.13,
                    7.02
                  ],
                  [
                    0,
                    8.5
                  ],
                  [
                    0.13,
                    9.98
                  ],
                  [
                    0.51,
                    11.41
                  ],
                  [
                    1.14,
                    12.75
                  ],
                  [
                    1.99,
                    13.96
                  ],
                  [
                    3.04,
                    15.01
                  ],
                  [
                    4.25,
                    15.86
                  ],
                  [
                    5.59,
                    16.49
                  ],
                  [
                    7.02,
                    16.87
                  ],
                  [
                    8.5,
                    17
                  ],
                  [
                    9.98,
                    16.87
                  ],
                  [
                    11.41,
                    16.49
                  ],
                  [
                    12.75,
                    15.86
                  ],
                  [
                    13.96,
                    15.01
                  ],
                  [
                    15.01,
                    13.96
                  ],
                  [
                    15.86,
                    12.75
                  ],
                  [
                    16.49,
                    11.41
                  ],
                  [
                    16.87,
                    9.98
                  ],
                  [
                    17,
                    8.5
                  ],
                  [
                    16.87,
                    7.02
                  ],
                  [
                    16.49,
                    5.59
                  ],
                  [
                    15.86,
                    4.25
                  ],
                  [
                    15.01,
                    3.04
                  ],
                  [
                    13.96,
                    1.99
                  ],
                  [
                    12.75,
                    1.14
                  ],
                  [
                    11.41,
                    0.51
                  ],
                  [
                    9.98,
                    0.13
                  ],
                  [
                    8.5,
                    0
                  ]
                ]
              ]
            },
            "symbol": {
              "type": "CIMPolygonSymbol",
              "symbolLayers": [
                {
                  "type": "CIMSolidStroke",
                  "enable": true,
                  "capStyle": "Round",
                  "joinStyle": "Round",
                  "lineStyle3D": "Strip",
                  "miterLimit": 10,
                  "width": 0,
                  "color": [
                    0,
                    0,
                    0,
                    255
                  ]
                },
                {
                  "type": "CIMSolidFill",
                  "enable": true,
                  "color": [
                    51,
                    51,
                    51,
                    0
                  ]
                }
              ]
            }
          }
        ],
        "scaleSymbolsProportionally": true,
        "respectFrame": true
      }
    ]
  } 
}

function symbolVehicleStop (color) {
    return {
        "type": "CIMPointSymbol",
        "symbolLayers": [
          {
            "type": "CIMVectorMarker",
            "enable": true,
            "anchorPoint": {
              "x": 0,
              "y": 0
            },
            "anchorPointUnits": "Relative",
            "dominantSizeAxis3D": "Y",
            "size": 18,
            "billboardMode3D": "FaceNearPlane",
            "frame": {
              "xmin": 0,
              "ymin": 0,
              "xmax": 17,
              "ymax": 17
            },
            "markerGraphics": [
              {
                "type": "CIMMarkerGraphic",
                "geometry": {
                  "rings": [
                    [
                      [
                        8.5,
                        0
                      ],
                      [
                        7.02,
                        0.13
                      ],
                      [
                        5.59,
                        0.51
                      ],
                      [
                        4.25,
                        1.14
                      ],
                      [
                        3.04,
                        1.99
                      ],
                      [
                        1.99,
                        3.04
                      ],
                      [
                        1.14,
                        4.25
                      ],
                      [
                        0.51,
                        5.59
                      ],
                      [
                        0.13,
                        7.02
                      ],
                      [
                        0,
                        8.5
                      ],
                      [
                        0.13,
                        9.98
                      ],
                      [
                        0.51,
                        11.41
                      ],
                      [
                        1.14,
                        12.75
                      ],
                      [
                        1.99,
                        13.96
                      ],
                      [
                        3.04,
                        15.01
                      ],
                      [
                        4.25,
                        15.86
                      ],
                      [
                        5.59,
                        16.49
                      ],
                      [
                        7.02,
                        16.87
                      ],
                      [
                        8.5,
                        17
                      ],
                      [
                        9.98,
                        16.87
                      ],
                      [
                        11.41,
                        16.49
                      ],
                      [
                        12.75,
                        15.86
                      ],
                      [
                        13.96,
                        15.01
                      ],
                      [
                        15.01,
                        13.96
                      ],
                      [
                        15.86,
                        12.75
                      ],
                      [
                        16.49,
                        11.41
                      ],
                      [
                        16.87,
                        9.98
                      ],
                      [
                        17,
                        8.5
                      ],
                      [
                        16.87,
                        7.02
                      ],
                      [
                        16.49,
                        5.59
                      ],
                      [
                        15.86,
                        4.25
                      ],
                      [
                        15.01,
                        3.04
                      ],
                      [
                        13.96,
                        1.99
                      ],
                      [
                        12.75,
                        1.14
                      ],
                      [
                        11.41,
                        0.51
                      ],
                      [
                        9.98,
                        0.13
                      ],
                      [
                        8.5,
                        0
                      ]
                    ]
                  ]
                },
                "symbol": {
                  "type": "CIMPolygonSymbol",
                  "symbolLayers": [
                    {
                      "type": "CIMSolidStroke",
                      "enable": true,
                      "capStyle": "Round",
                      "joinStyle": "Round",
                      "lineStyle3D": "Strip",
                      "miterLimit": 10,
                      "width": 1.5,
                      "color": [
                        255,
                        255,
                        255,
                        255
                      ]
                    },
                    {
                      "type": "CIMSolidFill",
                      "enable": true,
                      "color": color
                    }
                  ]
                }
              }
            ],
            "scaleSymbolsProportionally": true,
            "respectFrame": true,
            "rotation": 0
          },
          {
            "type": "CIMVectorMarker",
            "enable": true,
            "anchorPoint": {
              "x": 0,
              "y": 0
            },
            "anchorPointUnits": "Relative",
            "dominantSizeAxis3D": "Y",
            "size": 21,
            "billboardMode3D": "FaceNearPlane",
            "frame": {
              "xmin": 0,
              "ymin": 0,
              "xmax": 17,
              "ymax": 17
            },
            "markerGraphics": [
              {
                "type": "CIMMarkerGraphic",
                "geometry": {
                  "rings": [
                    [
                      [
                        8.5,
                        0
                      ],
                      [
                        7.02,
                        0.13
                      ],
                      [
                        5.59,
                        0.51
                      ],
                      [
                        4.25,
                        1.14
                      ],
                      [
                        3.04,
                        1.99
                      ],
                      [
                        1.99,
                        3.04
                      ],
                      [
                        1.14,
                        4.25
                      ],
                      [
                        0.51,
                        5.59
                      ],
                      [
                        0.13,
                        7.02
                      ],
                      [
                        0,
                        8.5
                      ],
                      [
                        0.13,
                        9.98
                      ],
                      [
                        0.51,
                        11.41
                      ],
                      [
                        1.14,
                        12.75
                      ],
                      [
                        1.99,
                        13.96
                      ],
                      [
                        3.04,
                        15.01
                      ],
                      [
                        4.25,
                        15.86
                      ],
                      [
                        5.59,
                        16.49
                      ],
                      [
                        7.02,
                        16.87
                      ],
                      [
                        8.5,
                        17
                      ],
                      [
                        9.98,
                        16.87
                      ],
                      [
                        11.41,
                        16.49
                      ],
                      [
                        12.75,
                        15.86
                      ],
                      [
                        13.96,
                        15.01
                      ],
                      [
                        15.01,
                        13.96
                      ],
                      [
                        15.86,
                        12.75
                      ],
                      [
                        16.49,
                        11.41
                      ],
                      [
                        16.87,
                        9.98
                      ],
                      [
                        17,
                        8.5
                      ],
                      [
                        16.87,
                        7.02
                      ],
                      [
                        16.49,
                        5.59
                      ],
                      [
                        15.86,
                        4.25
                      ],
                      [
                        15.01,
                        3.04
                      ],
                      [
                        13.96,
                        1.99
                      ],
                      [
                        12.75,
                        1.14
                      ],
                      [
                        11.41,
                        0.51
                      ],
                      [
                        9.98,
                        0.13
                      ],
                      [
                        8.5,
                        0
                      ]
                    ]
                  ]
                },
                "symbol": {
                  "type": "CIMPolygonSymbol",
                  "symbolLayers": [
                    {
                      "type": "CIMSolidStroke",
                      "enable": true,
                      "capStyle": "Round",
                      "joinStyle": "Round",
                      "lineStyle3D": "Strip",
                      "miterLimit": 10,
                      "width": 0,
                      "color": [
                        255,
                        255,
                        255,
                        255
                      ]
                    },
                    {
                      "type": "CIMSolidFill",
                      "enable": true,
                      "color": color
                    }
                  ]
                }
              }
            ],
            "scaleSymbolsProportionally": true,
            "respectFrame": true,
            "rotation": 0
          }
        ]
      }
}