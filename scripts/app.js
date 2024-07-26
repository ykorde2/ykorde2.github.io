// First Slide
async function renderFirstChart() {
    const margin = {top: 10, right: 20, bottom: 30, left: 50},
        width = 1000 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;
    const data = await d3.csv("https://rohitmukherjee.github.io/data/1-annual-working-hours-vs-gdp-per-capita-pwt.csv");
    const year = 2015
    const filteredData = data.filter(function (d) {
        return d.year == year && d.total_population != "" && d.average_annual_hours_worked != "" && d.gdp_per_capita != "";
    });

    let svg = d3.select("#chart-1").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Add X axis
    const x = d3.scaleLinear()
        .domain([1000, 70000])
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(d => d + " $/yr"));

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([1200, 2800])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y).tickFormat(d => d + " hr"));

    // Add a scale for bubble size
    const z = getBubbleSizeScale()

    // Add a scale for bubble color
    const myColor = d3.scaleOrdinal()
        .domain(getContinentKeys())
        .range(d3.schemeSet2);

    // -1- Create a tooltip div that is hidden by default:
    const tooltip = d3.select("#slide-1")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "black")
        .style("border-radius", "5px")
        .style("padding", "10")
        .style("color", "white")
        .style("width", "150px")
        .style("height", "50px")

    // Add dots
    svg.append('g')
        .selectAll("scatterplot-dot")
        .data(filteredData)
        .enter()
        .append("circle")
        .attr("class", "bubbles")
        .attr("cx", function (d) {
            return x(Number(d.gdp_per_capita));
        })
        .attr("cy", function (d) {
            return y(Number(d.average_annual_hours_worked));
        })
        .attr("id", function (d) {
            return "bubble-" + d.code;
        })
        .attr("r", function (d) {
            return z(Number(d.total_population));
        })
        .on("mouseover", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(firstChartTooltipHTML(d));
            tooltip.style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px")
        })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .style("fill", function (d) {
            return myColor(d.continent);
        });
    renderLegend(svg, getContinentKeys(), width, myColor);
    countryCodesToAnnotate().forEach(function (countryCode) {
        for (let i = 0; i < filteredData.length; i++) {
            if (filteredData[i].code === countryCode) {
                const countryData = filteredData[i];
                renderFirstChartAnnotations(countryData, x(Number(countryData.gdp_per_capita)), y(Number(countryData.average_annual_hours_worked)), margin);
            }
        }
    })
}

function renderFirstChartAnnotations(d, x, y, margin) {
    const computedDX = d.entity == "France" ? -30 : 30;
    const computedDY = d.entity == "France" ? 30 : -30;
    const annotations = [
        {
            note: {
                label: "$" + Math.round(d.gdp_per_capita) + "/year, " + Math.round(d.average_annual_hours_worked) + " hrs/yr",
                lineType: "none",
                bgPadding: {"top": 15, "left": 10, "right": 10, "bottom": 10},
                title: d.entity,
                orientation: "leftRight",
                "align": "middle"
            },
            type: d3.annotationCallout,
            subject: {radius: 30},
            x: x,
            y: y,
            dx: computedDX,
            dy: computedDY
        },
    ];
    const makeAnnotations = d3.annotation().annotations(annotations);

    d3.select("svg")
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "annotation-group")
        .call(makeAnnotations)
}

function renderSecondChartAnnotations(d, x, y, margin) {
    const computedDX = d.entity == "France" ? -30 : 30;
    const computedDY = d.entity == "France" ? 30 : -30;
    const annotations = [
        {
            note: {
                label: Math.round(d.productivity) + " $/hour, " + Math.round(d.average_annual_hours_worked) + " hrs/yr",
                lineType: "none",
                bgPadding: {"top": 15, "left": 10, "right": 10, "bottom": 10},
                title: d.entity,
                orientation: "leftRight",
                "align": "middle"
            },
            type: d3.annotationCallout,
            subject: {radius: 30},
            x: x,
            y: y,
            dx: computedDX,
            dy: computedDY
        },
    ];
    const makeAnnotations = d3.annotation().annotations(annotations);

    d3.select("svg")
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "annotation-group")
        .call(makeAnnotations)
}

function renderThirdChartAnnotations(d, x, y, margin) {
    d3.select(".annotation-group").remove();
    const annotations = [
        {
            note: {
                label: "An average worker makes " + Math.round(d.productivity) + " $/hour",
                lineType: "none",
                bgPadding: {"top": 15, "left": 10, "right": 10, "bottom": 10},
                title: d.entity,
                orientation: "topBottom",
                align: "top"
            },
            type: d3.annotationCalloutCircle,
            subject: {radius: 30},
            x: x,
            y: y,
            dx: -100,
            dy: -10
        },
    ];
    const makeAnnotations = d3.annotation().annotations(annotations);
    const chart = d3.select("svg")
    chart.transition()
        .duration(1000);
    chart.append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "annotation-group")
        .call(makeAnnotations)
}

function firstChartTooltipHTML(object) {
    return "<div>" + object.entity + "</div><div>$" + Math.round(object.gdp_per_capita) + "/year</div><div>" + Math.round(object.average_annual_hours_worked) + " hrs worked yearly</div>";
}

function countryCodesToAnnotate() {
    return ["CHN", "IND", "USA", "RUS", "KOR"]
}

// Second Slide
async function renderSecondChart() {
    const margin = {top: 10, right: 20, bottom: 30, left: 50},
        width = 1000 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;
    const data = await d3.csv("https://rohitmukherjee.github.io/data/3-productivity-vs-annual-hours-worked.csv");
    const year = 2015
    const filteredData = data.filter(function (d) {
        return d.year == year && d.total_population != "" && d.average_annual_hours_worked != "" && d.productivity != "";
    });

    console.log(filteredData);

    let svg = d3.select("#chart-2").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Add X axis
    const x = d3.scaleLinear()
        .domain([0, 100])
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(d => d + " $/hr"));

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([1200, 2800])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y).tickFormat(d => d + " hr"));
    const z = getBubbleSizeScale();

    // Add a scale for bubble color
    const myColor = d3.scaleOrdinal()
        .domain(getContinentKeys())
        .range(d3.schemeSet2);

    // -1- Create a tooltip div that is hidden by default:
    const tooltip = d3.select("#chart-2")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "black")
        .style("border-radius", "5px")
        .style("color", "white")
        .style("width", "150px")
        .style("height", "50px")

    // Add dots
    svg.append('g')
        .selectAll("dot")
        .data(filteredData)
        .enter()
        .append("circle")
        .attr("class", "bubbles")
        .attr("id", function (d) {
            return "bubble-" + d.code;
        })
        .attr("cx", function (d) {
            return x(Number(d.productivity));
        })
        .attr("cy", function (d) {
            return y(Number(d.average_annual_hours_worked));
        })
        .attr("r", function (d) {
            return z(Number(d.total_population));
        })
        .style("fill", function (d) {
            return myColor(d.continent);
        })
        // -3- Trigger the functions
        .on("mouseover", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(secondChartTooltipHTML(d));
            tooltip.style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px")
        })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .style("fill", function (d) {
            return myColor(d.continent);
        });
    renderLegend(svg, getContinentKeys(), width, myColor);
    countryCodesToAnnotate().forEach(function (countryCode) {
        for (let i = 0; i < filteredData.length; i++) {
            if (filteredData[i].code === countryCode) {
                const countryData = filteredData[i];
                renderSecondChartAnnotations(countryData, x(Number(countryData.productivity)), y(Number(countryData.average_annual_hours_worked)), margin);
            }
        }
    })
}

function secondChartTooltipHTML(object) {
    return "<div>" + object.entity + "</div><div>$" + Math.round(object.productivity) + "\/hour</div><div>" + Math.round(object.average_annual_hours_worked) + " hrs worked yearly</div>";
}


// Third Slide
async function renderThirdChart() {
    const margin = {top: 10, right: 20, bottom: 30, left: 50},
        width = 800 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;
    const data = await d3.csv("https://rohitmukherjee.github.io/data/4-labor-productivity-per-hour-PennWorldTable.csv");
    // append the svg object to the body of the page
    const svg = d3.select("#chart-3")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    const filteredData = data.filter(function (d) {
        return d.productivity != "" && d.year != "";
    });

    const entities = getEntities();
    d3.select("#select-country")
        .selectAll('country-options')
        .data(entities)
        .enter()
        .append('option')
        .text(function (d) {
            return d;
        }) // text showed in the menu
        .attr("value", function (d) {
            return d;
        }) // corresponding value returned by the button


    // A color scale: one color for each group
    const myColor = d3.scaleOrdinal()
        .domain(entities)
        .range(d3.schemeSet2);

    // Add X axis to measure time
    const x = d3.scaleLinear()
        .domain([1950, 2017])
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));
    // Add Y axis
    const y = d3.scaleLinear()
        .domain([0, 100])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y).tickFormat(d => d + " $/hr"));

    // Initialize line with group a
    const firstCountryData = filteredData.filter(function (d) {
        return d.entity === entities[0]
    });
    const line = svg
        .append('g')
        .append("path")
        .attr("id", "line-" + entities[0])
        .datum(firstCountryData)
        .attr("d", d3.line()
            .x(function (d) {
                return x(Number(d.year))
            })
            .y(function (d) {
                return y(Number(d.productivity))
            })
        )
        .attr("stroke", function (d) {
            return myColor(d.entity)
        })
        .style("stroke-width", 4)
        .style("fill", "none")
    const mostRecentFirstCountryData = firstCountryData[firstCountryData.length - 1]
    renderThirdChartAnnotations(mostRecentFirstCountryData, x(Number(mostRecentFirstCountryData.year)) - 10, y(Number(mostRecentFirstCountryData.productivity)) - 10, margin);

    function update(selectedGroup) {
        // Create new data with the selection?
        const countryData = filteredData.filter(function (d) {
            return d.entity === selectedGroup;
        });

        // Give these new data to update line
        line
            .datum(countryData)
            .transition()
            .duration(1000)
            .attr("id", "line-" + selectedGroup)
            .attr("d", d3.line()
                .x(function (d) {
                    return x(Number(d.year))
                })
                .y(function (d) {
                    return y(Number(d.productivity))
                })
            )
            .attr("stroke", function (d) {
                return myColor(selectedGroup)
            })

        // update the annotation
        const finalCountryData = countryData[countryData.length - 1];
        renderThirdChartAnnotations(finalCountryData, x(Number(finalCountryData.year)) - 10, y(finalCountryData.productivity) - 10, margin)
    }

    // When the button is changed, run the updateChart function
    d3.select("#select-country").on("change", function (d) {
        // recover the option that has been chosen
        const selectedOption = d3.select(this).property("value")
        // run the updateChart function with this selected option
        update(selectedOption)

    })

}

// Fourth slide
function renderFourthChart() {
    // The svg
    const svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

// Map and projection
    const projection = d3.geoMercator()
        .scale(70)
        .center([0, 20])
        .translate([width / 2, height / 2]);

    const tooltip = d3.select("#slide-4")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "black")
        .style("border-radius", "5px")
        .style("padding", "10")
        .style("color", "white")
        .style("width", "150px")
        .style("height", "50px")

// Data and color scale
    let data = new Map()
    const colorScale = d3.scaleOrdinal()
        .domain(getContinentKeys())
        .range(d3.schemeSet2);

// Load external data and boot
    Promise.all([
        d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
        d3.csv("https://rohitmukherjee.github.io/data/1-annual-working-hours-vs-gdp-per-capita-pwt.csv", function (d) {
            if (d.year == 2015) {
                data.set(d.code,
                    {
                        year: d.year,
                        gdp_per_capita: Number(d.gdp_per_capita),
                        name: d.entity,
                        population: d.total_population,
                        continent: d.continent
                    });
            }
        })
    ]).then(function (loadData) {
        let topo = loadData[0]

        // Draw the map
        svg.append("g")
            .selectAll("path")
            .data(topo.features)
            .join("path")
            // draw each country
            .attr("d", d3.geoPath()
                .projection(projection)
            )
            // set the color of each country
            .attr("fill", function (d) {
                if (!data.has(d.id)) {
                    return 0;
                } else {
                    return colorScale(data.get(d.id).continent);
                }
            })
            .on("mouseover", function (event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(fourthChartTooltipHTML(data.get(d.id)));
                tooltip.style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px")
            })
            .on("mouseout", function (d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
    })

    renderLegend(d3.select("#chart-4"), getContinentKeys(), width, colorScale);

}

function fourthChartTooltipHTML(object) {
    return "<div>" + object.name + "</div><div>" + object.population + " people</div><div>$" + Math.round(object.gdp_per_capita) + "/year</div>";
}

// Common functions
function getBubbleSizeScale() {
    // Add a scale for bubble size
    const z = d3.scaleLog()
        .domain([200000, 1310000000])
        .range([1, 30]);
    return z;
}

function renderLegend(svg, continentKeys, width, myColor) {
    // Add one dot in the legend for each name.
    svg.selectAll("legend-dots")
        .data(continentKeys)
        .enter()
        .append("circle")
        .attr("cx", width - 100)
        .attr("cy", function (d, i) {
            return 50 + i * 25
        }) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("r", 2)
        .style("fill", function (d) {
            return myColor(d)
        })

    svg.selectAll("legend-labels")
        .data(continentKeys)
        .enter()
        .append("text")
        .attr("x", width + 8 - 100)
        .attr("y", function (d, i) {
            return 50 + i * 25
        }) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function (d) {
            return myColor(d)
        })
        .text(function (d) {
            return d
        })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
}

function getContinentKeys() {
    return ["Asia", "Europe", "North America", "South America", "Africa", "Oceania"];
}

function getEntities() {
    return ["Argentina", "Australia", "Austria", "Bangladesh", "Barbados", "Belgium", "Brazil", "Bulgaria", "Cambodia", "Canada", "Chile", "China",
        "Colombia", "Costa Rica", "Croatia", "Cyprus", "Czechia", "Denmark", "Ecuador", "Estonia", "Finland", "France", "Germany", "Greece", "Hong Kong",
        "Hungary", "Iceland", "India", "Indonesia", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Latvia", "Lithuania", "Luxembourg", "Malaysia", "Malta",
        "Mexico", "Myanmar", "Netherlands", "New Zealand", "Nigeria", "Norway", "Pakistan", "Peru", "Philippines", "Poland", "Portugal", "Romania", "Russia",
        "Saint Lucia", "Singapore", "Slovakia", "Slovenia", "South Africa", "South Korea", "Spain", "Sri Lanka",
        "Sweden", "Switzerland", "Taiwan", "Thailand", "Trinidad and Tobago", "Turkey", "United Kingdom", "United States", "Uruguay", "Venezuela", "Vietnam"]
}

async function renderFifthChart() {
    const margin = {top: 10, right: 20, bottom: 30, left: 50},
        width = 1000 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;
    const data = await d3.csv("https://ykorde2.github.io/data/change-heat-deaths-gdp.csv");  // Update with the URL or path to your new CSV file
    const year = 2015;  // Considering GDP per capita in 2022
    // Filter data for required years
    console.log(data);  // Log filtered data to the console
    const data2021 = data.filter(d => d.Year == 2021);
    const data2030 = data.filter(d => d.Year == 2030);
    const data2015 = data.filter(d => d.Year == 2015);
    console.log(data2021);  // Log filtered data to the console
    console.log(data2030);  // Log filtered data to the console
    console.log(data2015);  // Log filtered data to the console

    // Create a mapping of entity codes to their respective data
    const dataMap = {};

    data2021.forEach(d => {
        if (!dataMap[d.Code]) dataMap[d.Code] = {};
        dataMap[d.Code].GDP = d.GDP;
        dataMap[d.Code].Entity = d.Entity;
    });

    data2030.forEach(d => {
        if (!dataMap[d.Code]) dataMap[d.Code] = {};
        dataMap[d.Code].HeatDeath = d.HeatDeath;
    });

    data2015.forEach(d => {
        if (!dataMap[d.Code]) dataMap[d.Code] = {};
        dataMap[d.Code].Continent = d.Continent;
    });

    // Filter and prepare the final data
    const filteredData = Object.keys(dataMap)
        .map(code => ({ Code: code, ...dataMap[code] }))
        .filter(d => d.Entity && d.GDP && d.HeatDeath && d.Continent);

    console.log(filteredData);  // Log filtered data to the console

    let svg = d3.select("#chart-5").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Add X axis
    const x = d3.scaleLog()
        .domain([750, 120000])  // Adjust domain as necessary
        .range([0, width])
        .base(10);
        const xTicks = [1000, 2000, 5000, 10000, 20000, 50000, 100000];
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x)
            .tickValues(xTicks)
            .tickFormat(d3.format("$.0f")));  // Format tick labels with dollar sign and no decimals

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([-80, 40])  // Adjust domain as necessary
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y).tickFormat(d => d + " %"));

    // Add a scale for bubble color
    const myColor = d3.scaleOrdinal()
        .domain(getContinentKeys())  // Define your function to get continent keys
        .range(d3.schemeSet2);

    svg.append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", y(0))
        .attr("y2", y(0))
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    // -1- Create a tooltip div that is hidden by default:
    const tooltip = d3.select("#slide-5")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "black")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("color", "white")
        .style("width", "150px")
        .style("height", "100px");

    // Add dots
        svg.append('g')
        .selectAll("scatterplot-dot")
        .data(filteredData)
        .enter()
        .append("circle")
        .attr("class", "bubbles")
        .attr("cx", function (d) {
            return x(Number(d.GDP));
        })
        .attr("cy", function (d) {
            return y(Number(d.HeatDeath));
        })
        .attr("r", 5)  // Fixed bubble size, you can adjust or make dynamic based on data
        .on("mouseover", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(fifthChartTooltipHTML(d));
            tooltip.style("left", (event.pageX + 28) + "px")
                .style("top", (event.pageY) + "px");
        })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .style("fill", function (d) {
            return myColor(d.Continent);
        });
        renderLegend(svg, getContinentKeys(), width, myColor);
        countryCodesToAnnotate().forEach(function (countryCode) {
            for (let i = 0; i < filteredData.length; i++) {
                if (filteredData[i].Code === countryCode) {
                    const countryData = filteredData[i];
                    renderFifthChartAnnotations(countryData, x(Number(countryData.GDP)), y(Number(countryData.HeatDeath)), margin);
                }
            }
        });
}

function fifthChartTooltipHTML(d) {
    return "<strong>Entity:</strong> " + d.Entity + "<br>"
         + "<strong>Heat-related death rate:</strong> " + Number(d.HeatDeath).toFixed(2) + "%<br>"
         + "<strong>GDP per capita ($):</strong> " + d.GDP;
}

function renderFifthChartAnnotations(d, x, y, margin) {
    const computedDX = d.Entity === "France" ? -30 : 30;
    const computedDY = d.Entity === "France" ? 30 : -30;
    const annotations = [
        {
            note: {
                label: "GDP: $" + Math.round(d.GDP) + ", Heat Death: " + Math.round(d.HeatDeath) + "%",
                lineType: "none",
                bgPadding: { "top": 15, "left": 10, "right": 10, "bottom": 10 },
                title: d.Entity,
                orientation: "leftRight",
                "align": "middle"
            },
            type: d3.annotationCallout,
            subject: { radius: 30 },
            x: x,
            y: y,
            dx: computedDX,
            dy: computedDY
        },
    ];
    const makeAnnotations = d3.annotation().annotations(annotations);

    d3.select("svg")
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "annotation-group")
        .call(makeAnnotations);
}

async function renderHeatDeathRateChart() {
    const margin = {top: 10, right: 20, bottom: 30, left: 50},
        width = 1000 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;

    const data = await d3.csv("https://ykorde2.github.io/data/change-heat-death-rate.csv");

    const svg = d3.select("#chart-3")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const filteredData = data.filter(d => d.HeatDeathRate != "" && d.Year != "");

    const entities = Array.from(new Set(filteredData.map(d => d.Entity)));
    
    d3.select("#select-country")
        .selectAll('country-options')
        .data(entities)
        .enter()
        .append('option')
        .text(d => d)
        .attr("value", d => d);

    const myColor = d3.scaleOrdinal()
        .domain(entities)
        .range(d3.schemeSet2);

    const x = d3.scaleLinear()
        .domain([2030, 2090])
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    const y = d3.scaleSqrt()
        .domain([-300, 100])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y).tickFormat(d => d + " rate"));

    const firstCountryData = filteredData.filter(d => d.Entity === entities[0]);
    const line = svg
        .append('g')
        .append("path")
        .attr("id", "line-" + entities[0])
        .datum(firstCountryData)
        .attr("d", d3.line()
            .x(d => x(Number(d.Year)))
            .y(d => y(Number(d.HeatDeathRate)))
        )
        .attr("stroke", myColor(entities[0]))
        .style("stroke-width", 4)
        .style("fill", "none");

        const mostRecentFirstCountryData = firstCountryData[firstCountryData.length - 1];
        renderHeatDeathRateAnnotations(mostRecentFirstCountryData, x(Number(mostRecentFirstCountryData.Year)) - 10, y(Number(mostRecentFirstCountryData.HeatDeathRate)) - 10, margin);

    function update(selectedGroup) {
        const countryData = filteredData.filter(d => d.Entity === selectedGroup);

        line
            .datum(countryData)
            .transition()
            .duration(1000)
            .attr("id", "line-" + selectedGroup)
            .attr("d", d3.line()
                .x(d => x(Number(d.Year)))
                .y(d => y(Number(d.HeatDeathRate)))
            )
            .attr("stroke", myColor(selectedGroup));

        const finalCountryData = countryData[countryData.length - 1];
        renderHeatDeathRateAnnotations(finalCountryData, x(Number(finalCountryData.Year)) - 10, y(Number(finalCountryData.HeatDeathRate)) - 10, margin);
    }

    d3.select("#select-country").on("change", function() {
        const selectedOption = d3.select(this).property("value");
        update(selectedOption);
    });

}

function renderHeatDeathRateAnnotations(d, x, y, margin) {
    d3.select(".annotation-group").remove();
    const annotations = [
        {
            note: {
                label: "Heat death rate is " + d.HeatDeathRate,
                lineType: "none",
                bgPadding: {"top": 15, "left": 10, "right": 10, "bottom": 10},
                title: d.Entity,
                orientation: "topBottom",
                align: "top"
            },
            type: d3.annotationCalloutCircle,
            subject: {radius: 30},
            x: x,
            y: y,
            dx: -100,
            dy: -10
        },
    ];
    const makeAnnotations = d3.annotation().annotations(annotations);
    const chart = d3.select("svg")
    chart.transition()
        .duration(1000);
    chart.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "annotation-group")
        .call(makeAnnotations);
}

async function renderHeatDeathRateChart2() {
    const margin = {top: 10, right: 20, bottom: 30, left: 50},
        width = 1000 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;


    const data = await d3.csv("https://ykorde2.github.io/data/deaths-temperature-gasparrini.csv", d => {
        return {
            entity: d.Entity,
            code: d.Code,
            year: +d.Year,
            extremeCold: +d.ExtremeCold,
            moderateCold: +d.ModerateCold,
            moderateHeat: +d.ModerateHeat,
            extremeHeat: +d.ExtremeHeat,
            total: (+d.ExtremeCold + +d.ModerateCold + +d.ModerateHeat + +d.ExtremeHeat).toFixed(2)
        };
    });

    data.sort((a, b) => b.total - a.total);

    console.log(data);
    const svg = d3.select("#chart-2")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

        // Define the subgroups
        const subgroups = ["extremeCold", "moderateCold", "moderateHeat", "extremeHeat"];

        // Extract the groups (country names)
        const groups = data.map(d => d.entity);
    
        // Create the x-axis scale (percentage of deaths)
        const x = d3.scaleLinear()
            .domain([0, d3.max(data, d => +d.total)])
            .range([0, width]);
    
        // Create the y-axis scale (countries)
        const y = d3.scaleBand()
            .domain(groups)
            .range([0, height])
            .padding(0.1);
    
        // Define the color scale using d3.schemeSet2
        const color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(d3.schemeSet2);
    
        // Add the x-axis to the SVG
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(10).tickFormat(d => d + "%"));
    
        // Add the y-axis to the SVG
        svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y));
    
        // Prepare the data for the stacked bar chart
        const stackedData = d3.stack()
            .keys(subgroups)
            (data);
    
        // Create a tooltip for displaying information on hover
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "black")
            .style("border-radius", "5px")
            .style("padding", "10px")
            .style("color", "white")
            .style("width", "150px")
            .style("height", "100px");
    
        // Draw the bars for the stacked chart
        svg.append("g")
            .selectAll("g")
            .data(stackedData)
            .enter()
            .append("g")
            .attr("fill", d => color(d.key))
            .selectAll("rect")
            .data(d => d)
            .enter()
            .append("rect")
            .attr("y", d => y(d.data.entity))
            .attr("x", d => x(d[0]))
            .attr("width", d => x(d[1]) - x(d[0]))
            .attr("height", y.bandwidth())
            .on("mouseover", function(event, d) {
                const total = d.data.total + "%";
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`<div class="tooltip-title">${d.data.entity}</div>
                              Extreme Cold: ${d.data.extremeCold}%<br>
                              Moderate Cold: ${d.data.moderateCold}%<br>
                              Moderate Heat: ${d.data.moderateHeat}%<br>
                              Extreme Heat: ${d.data.extremeHeat}%<br>
                              <strong>Total: ${total}</strong>`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    
        // Add a legend to the chart
        const legend = svg.append("g")
            .attr("transform", `translate(${width - 100},${0})`);
    
        // Draw rectangles for the legend
        legend.selectAll("rect")
            .data(subgroups)
            .enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", (d, i) => i * 20)
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", color);
    
        // Add text labels to the legend
        legend.selectAll("text")
            .data(subgroups)
            .enter()
            .append("text")
            .attr("x", 25)
            .attr("y", (d, i) => i * 20 + 13)
            .text(d => d.charAt(0).toUpperCase() + d.slice(1));
}

async function renderSixthChart() {
    const margin = {top: 10, right: 20, bottom: 30, left: 50},
        width = 1000 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;

    // Load CSV data
    const data = await d3.csv("https://ykorde2.github.io/data/heat-death-rate-vs-co2.csv");  // Update with the URL or path to your new CSV file
    const year = 2015;  // Considering AnnualCO2Emissions in 2022

    // Filter data for required years
    console.log(data);  // Log raw data to the console
    const data2021 = data.filter(d => d.Year == 2021);
    const data2030 = data.filter(d => d.Year == 2030);
    const data2015 = data.filter(d => d.Year == 2015);
    console.log(data2021);  // Log data for 2021
    console.log(data2030);  // Log data for 2030
    console.log(data2015);  // Log data for 2015

    // Create a mapping of entity codes to their respective data
    const dataMap = {};

    data2021.forEach(d => {
        if (!dataMap[d.Code]) dataMap[d.Code] = {};
        dataMap[d.Code].AnnualCO2Emissions = d.AnnualCO2Emissions;
        dataMap[d.Code].Entity = d.Entity;
    });

    data2030.forEach(d => {
        if (!dataMap[d.Code]) dataMap[d.Code] = {};
        dataMap[d.Code].HeatDeath = d.HeatDeath;
    });

    data2015.forEach(d => {
        if (!dataMap[d.Code]) dataMap[d.Code] = {};
        dataMap[d.Code].Continent = d.Continent;
    });

    // Filter and prepare the final data
    const filteredData = Object.keys(dataMap)
        .map(code => ({ Code: code, ...dataMap[code] }))
        .filter(d => d.Entity && d.AnnualCO2Emissions && d.HeatDeath && d.Continent);

    console.log(filteredData);  // Log filtered data to the console

    let svg = d3.select("#chart-6").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Add X axis with linear scale
    const x = d3.scaleLinear()
        .domain([0, 40])  // Adjusted domain for linear scale
        .range([0, width]);

    const xTicks = d3.range(0, 41, 5);  // Tick values from 0 to 40 with a step of 5
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x)
            .tickValues(xTicks)
            .tickFormat(d => d + "T"));  // Format tick labels with "T" suffix

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([-80, 40])  // Adjust domain as necessary
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y).tickFormat(d => d + " %"));

    // Add a scale for bubble color
    const myColor = d3.scaleOrdinal()
        .domain(getContinentKeys())  // Define your function to get continent keys
        .range(d3.schemeSet2);

    svg.append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", y(0))
        .attr("y2", y(0))
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    // -1- Create a tooltip div that is hidden by default:
    const tooltip = d3.select("#slide-6")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "black")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("color", "white")
        .style("width", "150px")
        .style("height", "100px");

    // Add dots
    svg.append('g')
        .selectAll("scatterplot-dot")
        .data(filteredData)
        .enter()
        .append("circle")
        .attr("class", "bubbles")
        .attr("cx", function (d) {
            return x(Number(d.AnnualCO2Emissions));
        })
        .attr("cy", function (d) {
            return y(Number(d.HeatDeath));
        })
        .attr("r", 5)  // Fixed bubble size, you can adjust or make dynamic based on data
        .on("mouseover", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(sixthChartTooltipHTML(d));
            tooltip.style("left", (event.pageX + 28) + "px")
                .style("top", (event.pageY) + "px");
        })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .style("fill", function (d) {
            return myColor(d.Continent);
        });
    renderLegend(svg, getContinentKeys(), width, myColor);
    countryCodesToAnnotate().forEach(function (countryCode) {
        for (let i = 0; i < filteredData.length; i++) {
            if (filteredData[i].Code === countryCode) {
                const countryData = filteredData[i];
                renderSixthChartAnnotations(countryData, x(Number(countryData.AnnualCO2Emissions)), y(Number(countryData.HeatDeath)), margin);
            }
        }
    });
}

function sixthChartTooltipHTML(d) {
    return "<strong>Entity:</strong> " + d.Entity + "<br>"
        + "<strong>Heat-related death rate:</strong> " + Number(d.HeatDeath).toFixed(2) + "%<br>"
        + "<strong>Annual CO2 Emissions:</strong> " + d.AnnualCO2Emissions;
}

function renderSixthChartAnnotations(d, x, y, margin) {
    const computedDX = d.Entity === "France" ? -30 : 30;
    const computedDY = d.Entity === "France" ? 30 : -30;
    const annotations = [
        {
            note: {
                label: "Annual CO2 Emissions: " + Math.round(d.AnnualCO2Emissions) + ", Heat Death: " + Math.round(d.HeatDeath) + "%",
                lineType: "none",
                bgPadding: { "top": 15, "left": 10, "right": 10, "bottom": 10 },
                title: d.Entity,
                orientation: "leftRight",
                "align": "middle"
            },
            type: d3.annotationCallout,
            subject: { radius: 30 },
            x: x,
            y: y,
            dx: computedDX,
            dy: computedDY
        },
    ];
    const makeAnnotations = d3.annotation().annotations(annotations);

    d3.select("svg")
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "annotation-group")
        .call(makeAnnotations);
}
