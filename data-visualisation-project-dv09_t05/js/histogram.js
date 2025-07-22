// Create a separate load-age-data.js file (like your load-data.js)

d3.csv("data/Age_group.csv", d => ({
    Jurisdiction: d["JURISDICTION"],
    AgeGroup: d["AGE_GROUP"],
    Total: +d["TotalFines"]
})).then(data => {
    console.log(data);
    drawHistogram(data);
    populateStateFilter(data);
}).catch(error => {
    console.error("Error loading the CSV file:", error);
});

// Updated shared_constants.js - add dedicated scales for age histogram
const xScaleAge = d3.scaleBand();
const yScaleAge = d3.scaleLinear();
let innerChartAge; // Global variable for age histogram

// Updated histogram.js
const drawHistogram = (data) => {
    d3.select("#histogram").html(""); // Clear existing chart

    // Summarize by age group
    const ageGroups = d3.rollups(
        data,
        v => d3.sum(v, d => d.Total),
        d => d.AgeGroup
    ).map(([ageGroup, total]) => ({ ageGroup, total }));

    const svg = d3.select("#histogram")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`);

    innerChartAge = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    xScaleAge
        .domain(ageGroups.map(d => d.ageGroup))
        .range([0, innerWidth])
        .padding(0.1);

    yScaleAge
        .domain([0, d3.max(ageGroups, d => d.total)])
        .range([innerHeight, 0])
        .nice();

    innerChartAge.selectAll("rect")
        .data(ageGroups)
        .join("rect")
        .attr("class", "histogram-rect")
        .attr("x", d => xScaleAge(d.ageGroup))
        .attr("y", d => yScaleAge(d.total))
        .attr("width", xScaleAge.bandwidth())
        .attr("height", d => innerHeight - yScaleAge(d.total))
        .attr("fill", binColor)
        .attr("stroke", bodyBackgroundColor)
        .attr("stroke-width", 2);

    // Add labels
    innerChartAge.selectAll(".bin-label")
        .data(ageGroups)
        .join("text")
        .attr("class", "bin-label")
        .attr("x", d => xScaleAge(d.ageGroup) + xScaleAge.bandwidth() / 2)
        .attr("y", d => yScaleAge(d.total) - 5)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "black")
        .text(d => d.total.toLocaleString());

    // Axes
    innerChartAge.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(d3.axisBottom(xScaleAge));

    innerChartAge.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScaleAge));

    // Styling and labels
    innerChartAge.selectAll('.x-axis text, .y-axis text')
        .style('font-size', '15px');

    svg.append("text")
        .text("Age Group")
        .attr("text-anchor", "middle")
        .attr("x", width - margin.right)
        .attr("y", height - 5)
        .attr("class", "axis-label")
        .style("font-size", "1.2em");

    svg.append("text")
        .text("Total Fines")
        .attr("x", 15)
        .attr("y", 35)
        .style("font-size", "1.2em")
        .attr("class", "axis-label");

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 25)
        .attr("text-anchor", "middle")
        .attr("class", "title")
        .style("font-size", "1.5em")
        .style("font-weight", "bold")
        .text("Histogram of Total Fines by Age Group");
};

// Updated interactions.js - following your working pattern
const populateStateFilter = (data) => {
    d3.select("#filters-state")
        .selectAll(".filter")
        .data(filters_state)
        .join("button")
        .attr("class", d => `filter ${d.isActive ? "active" : ""}`)
        .text(d => d.label)
        .on("click", (e, d) => {
            console.log("Clicked filter", d);
            if (!d.isActive) {
                filters_state.forEach(filter => {
                    filter.isActive = (d.id === filter.id);
                });
                d3.selectAll("#filters-state .filter")
                    .classed("active", filter => filter.id === d.id);

                updateHistogram(d.id, data);
            }
        });

    // Define updateHistogram here like in your working version
    const updateHistogram = (filterId, data) => {
        const filteredData = filterId === "all"
            ? data
            : data.filter(d => d.Jurisdiction === filterId);

        const updatedGroups = d3.rollups(
            filteredData,
            v => d3.sum(v, d => d.Total),
            d => d.AgeGroup
        ).map(([ageGroup, total]) => ({ ageGroup, total }));

        yScaleAge
            .domain([0, d3.max(updatedGroups, d => d.total)])
            .nice();

        // Update y-axis
        innerChartAge.select(".y-axis")
            .transition()
            .duration(1000)
            .call(d3.axisLeft(yScaleAge));

        innerChartAge.selectAll('.y-axis text')
            .style('font-size', '15px');

        // Update bars - simple like your working version
        d3.selectAll(".histogram-rect")
            .data(updatedGroups)
            .transition()
            .duration(1000)
            .ease(d3.easeCubicInOut)
            .attr("y", d => yScaleAge(d.total))
            .attr("height", d => innerHeight - yScaleAge(d.total));

        // Update labels
        innerChartAge.selectAll(".bin-label")
            .data(updatedGroups)
            .transition()
            .duration(1000)
            .ease(d3.easeCubicInOut)
            .attr("y", d => yScaleAge(d.total) - 5)
            .text(d => d.total.toLocaleString());
    };
};