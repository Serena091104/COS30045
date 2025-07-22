d3.csv("data/Jur_Location_Histogram_2023.csv", d => {
    return {
        Jurisdiction: d["JURISDICTION"],
        TotalViolations: +d["Sum(Total violations)"],
        TotalLicences: +d["Total licences"],
        Locations: [
            { type: "Major Cities", count: +d["Major Cities of Australia"] },
            { type: "Inner Regional", count: +d["Inner Regional Australia"] },
            { type: "Outer Regional", count: +d["Outer Regional Australia"] },
            { type: "Remote", count: +d["Remote Australia"] },
            { type: "Very Remote", count: +d["Very Remote Australia"] },
            //  { type: "Unknown", count: +d["Unknown"] }
        ]
    };
}).then(data => {
   
    console.log("Violation data for donut chart", data);

    const defaultJurisdiction = data.find(d => d.Jurisdiction === "NSW");
    drawDonutChart(defaultJurisdiction.Locations, "NSW");
});

const drawDonutChart = (locationData, jurisdictionName) => {
    const pieChartWidth = 400;
    const pieChartHeight = 480;
    //clear previous chart and message
    d3.select("#donut-chart").html("");
    d3.select("#donut-message").html("");

    const svg = d3.select("#donut-chart")
        .append("svg")
        .attr("viewBox", [0, 0, pieChartWidth, pieChartHeight]);

    const innerChart = svg
        .append("g")
        .attr("transform", `translate(${pieChartWidth / 2 - 60}, ${pieChartHeight / 2 - 60})`);

    const colorScale = d3.scaleOrdinal()
        .domain(locationData.map(d => d.type))
        .range(d3.schemeSet2);

    const filteredData = locationData.filter(d => d.count > 0);
    if (filteredData.length === 0) {
        d3.select("#donut-message")
            .append("div")
            .attr("class", "alert alert-primary text-center")
            .text("Location of violations are undefined");
        return;
    }

    const totalSum = d3.sum(filteredData, d => d.count);

    const pie = d3.pie()
        .value(d => d.count)
        .sort(null);

    const arcs = pie(filteredData);

    const arcGenerator = d3.arc()
        .innerRadius(70)
        .outerRadius(140)
        .padAngle(0.02)
        .cornerRadius(3);
   
    tooltip 
        .attr("id", "donut-tooltip")

    // Draw the arcs
    innerChart.selectAll("path")
        .data(arcs)
        .join("path")
        .attr("d", arcGenerator)
        .attr("fill", d => colorScale(d.data.type))
        .attr("stroke", "white")
        .style("stroke-width", "1px")
        .on("mouseover", function(event, d) {
            const percent = ((d.data.count / totalSum) * 100).toFixed(1);
            tooltip.style("display", "block")
                .html(`<strong>${d.data.type}</strong>: ${percent}%`);
            d3.select(this).attr("opacity", 0.7);
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 12) + "px")
                   .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("display", "none");
            d3.select(this).attr("opacity", 1);
        });

    
    innerChart.selectAll("text")
        .data(arcs)
        .join("text")
        .text(d => {
             const percent = ((d.data.count / totalSum) * 100).toFixed(1);
            return parseFloat(percent) >= 5 ? `${percent}%` : "";
        })
        .attr("transform", d => `translate(${arcGenerator.centroid(d)})`)
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .style("fill", "black");

    // Add chart title
    svg.append("text")
        .attr("x", pieChartWidth / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-weight", "bold")
        // .attr("class", "axis-label")
        .attr("class", "title")
        .text(`Location Breakdown of Violations (${jurisdictionName})`);
    //add legend
    const legendItemWidth = 110; 
    const legendItemHeight = 20;
    const maxLegendWidth = pieChartWidth - 40; 
    const itemsPerRow = Math.floor(maxLegendWidth / legendItemWidth) || 1;

    const legend = svg.append("g")
        .attr("transform", `translate(10, ${pieChartHeight - 120})`);

    
    legend.selectAll("rect")
        .data(filteredData)
        .join("rect")
        .attr("x", (d, i) => (i % itemsPerRow) * legendItemWidth) // move to the next row if needed
        .attr("y", (d, i) => Math.floor(i / itemsPerRow) * legendItemHeight)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", d => colorScale(d.type));

    legend.selectAll("text")
        .data(filteredData)
        .join("text")
        .attr("x", (d, i) => (i % itemsPerRow) * legendItemWidth + 20)
        .attr("y", (d, i) => Math.floor(i / itemsPerRow) * legendItemHeight + 12)
        .style("font-size", "12px")
        .attr("class", "legend-text")
        .text(d => {
            const percent = ((d.count / totalSum) * 100).toFixed(1);
            return parseFloat(percent) < 5 ? `${d.type}: ${percent}%` : d.type;
        });

};
