
function countryCodesToAnnotate() {
    return ["RUS", "USA", "KWT", "PAK"]
}

function getContinentKeys() {
    return ["Africa", "Asia", "Europe", "North America", "Oceania", "South America"];
}

function renderLegend(svg, continentKeys, width, myColor) {
    // Define constants for spacing and positioning
    const circleRadius = 2;
    const initialYPosition = 50;
    const ySpacing = 25;
    const labelOffsetX = 8;

    // Create a group for legend items for better structure
    const legendGroup = svg.selectAll("legend-item")
        .data(continentKeys)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${initialYPosition + i * ySpacing})`);

    // Append circles to the legend group
    legendGroup.append("circle")
        .attr("cx", width - 100)
        .attr("cy", 0) // Adjusted to be within the group's transform
        .attr("r", circleRadius)
        .style("fill", myColor);

    // Append text labels to the legend group
    legendGroup.append("text")
        .attr("x", width - 100 + labelOffsetX)
        .attr("y", 0) // Adjusted to be within the group's transform
        .style("fill", myColor)
        .text(d => d)
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle");
}

async function renderTemperatureDeathRateChart() {
    const margin = {top: 10, right: 20, bottom: 30, left: 50},
        width = 1200 - margin.left - margin.right,
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
        .attr("transform", `translate(${margin.left + 50},${margin.top})`); // Push chart to the right by 50 pixels

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
    
        // Define the color scale using d3.schemeTableau10
        const color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(d3.schemeTableau10);
    
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
            .attr("transform", `translate(${width - 150},${height - subgroups.length * 20 - 20})`);
    
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

async function renderHeatDeathRateChart() {
    const margin = {top: 10, right: 20, bottom: 30, left: 50},
        width = 1200 - margin.left - margin.right,
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
        .range(d3.schemeTableau10);

    const x = d3.scaleLinear()
        .domain([2030, 2090])
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    const y = d3.scaleLinear()
        .domain([-300, 150])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y).tickFormat(d => d + " %"));

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

async function renderHeatDeathGDPChart() {
    const margin = {top: 10, right: 20, bottom: 30, left: 50},
        width = 1200 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;
    const data = await d3.csv("https://ykorde2.github.io/data/change-heat-deaths-gdp.csv");  // Update with the URL or path to your new CSV file
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

    let svg = d3.select("#chart-4").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Add X axis
    const x = d3.scaleLog()
        .domain([700, 120000])  // Adjust domain as necessary
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
        .range(d3.schemeTableau10);

    svg.append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", y(0))
        .attr("y2", y(0))
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    // -1- Create a tooltip div that is hidden by default:
    const tooltip = d3.select("#slide-4")
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
            tooltip.html(heatDeathGDPChartTooltipHTML(d));
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
                    renderHeatDeathGDPChartAnnotations(countryData, x(Number(countryData.GDP)), y(Number(countryData.HeatDeath)), margin);
                }
            }
        });
}

function heatDeathGDPChartTooltipHTML(d) {
    return "<strong>Entity:</strong> " + d.Entity + "<br>"
         + "<strong>Heat-related death rate:</strong> " + Number(d.HeatDeath).toFixed(2) + "%<br>"
         + "<strong>GDP per capita ($):</strong> " + d.GDP;
}

function renderHeatDeathGDPChartAnnotations(d, x, y, margin) {
     switch (d.Entity) {
        case "Russia":
            computedDX = -30;
            computedDY = 30;
            break;
        case "United States":
            computedDX = 0;
            computedDY = 90;
            break;
        case "Kuwait":
            computedDX = -30;
            computedDY = -30;
        default:
            computedDX = -30;
            computedDY = -30;
            break;
    }
    
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

async function renderHeatDeathCO2Chart() {
    const margin = {top: 10, right: 20, bottom: 30, left: 50},
        width = 1200 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;

    // Load CSV data
    const data = await d3.csv("https://ykorde2.github.io/data/heat-death-rate-vs-co2.csv");  // Update with the URL or path to your new CSV file

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

    let svg = d3.select("#chart-5").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Add X axis with linear scale
    const x = d3.scaleSqrt()
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
        .range(d3.schemeTableau10);

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
            tooltip.html(heatDeathCO2ChartTooltipHTML(d));
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
                renderHeatDeathCO2ChartAnnotations(countryData, x(Number(countryData.AnnualCO2Emissions)), y(Number(countryData.HeatDeath)), margin);
            }
        }
    });
}

function heatDeathCO2ChartTooltipHTML(d) {
    return "<strong>Entity:</strong> " + d.Entity + "<br>"
        + "<strong>Heat-related death rate:</strong> " + Number(d.HeatDeath).toFixed(2) + "%<br>"
        + "<strong>Annual CO2 Emissions (T):</strong> " + Number(d.AnnualCO2Emissions).toFixed(6);
}

function renderHeatDeathCO2ChartAnnotations(d, x, y, margin) {
    let computedDX, computedDY;

    switch (d.Entity) {
        case "Russia":
            computedDX = 30;
            computedDY = 0;
            break;
        case "United States":
            computedDX = 30;
            computedDY = 30;
            break;
        case "Kuwait":
            computedDX = 0;
            computedDY = -30;
        default:
            computedDX = 0;
            computedDY = -45;
            break;
    }
    const annotations = [
        {
            note: {
                label: "Annual CO2 Emissions: " + Math.round(d.AnnualCO2Emissions) + " T, Heat Death: " + Math.round(d.HeatDeath) + "%",
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
