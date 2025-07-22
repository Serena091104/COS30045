d3.csv("data/Jur_Location_Histogram_2023.csv", d => {
    return {
        Jurisdiction: d["JURISDICTION"],
        TotalViolations: +d["Sum(Total violations)"],
        TotalLicences: +d["Total licences"],
        Per10k: +d["Total licences"] > 0 ? (+d["Sum(Total violations)"] / +d["Total licences"]) * 10000 : 0,
        Locations: [
            { type: "Major Cities", count: +d["Major Cities of Australia"] },
            { type: "Inner Regional", count: +d["Inner Regional Australia"] },
            { type: "Outer Regional", count: +d["Outer Regional Australia"] },
            { type: "Remote", count: +d["Remote Australia"] },
            { type: "Very Remote", count: +d["Very Remote Australia"] }
        ]
    };
}).then(data => {
    data.sort((a, b) => b.Per10k - a.Per10k); 
    console.log("Jurisdiction Data", data);
    drawBarChart(data); 
});

const drawBarChart = (data ) => {
    const svg = d3.select("#bar-chart")
        .append("svg")
         .attr("viewBox", `0 0 ${width} ${height}`)

    innerChart = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // scales
    xScale
        .domain(data.map(d => d.Jurisdiction))
        .range([0, innerWidth])
        .padding(0.1); // Add padding between bars

    const yMax = d3.max(data, d => d.Per10k);

    yScale
        .domain([0, yMax])
        .range([innerHeight, 0])
        .nice();
        
    //x-axis and y-axis
    innerChart.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(d3.axisBottom(xScale));
    
    const leftAxis = d3.axisLeft(yScale)
        .ticks(5) //number of ticks on y axis
        .tickFormat(d3.format(".0f")); 
    innerChart.append("g")
        .attr("class", "y-axis")
        .call(leftAxis)
    
    const bottomAxis = d3.axisBottom(xScale)

    //add the axis to the chart
    innerChart.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(bottomAxis)
    // Increase tick text size
    innerChart.selectAll('.x-axis text, .y-axis text')
        .style('font-size', '16px');

      
    //tooltip
    tooltip
        .attr("id", "bar-tooltip")
    // Add the bars
    innerChart.selectAll(".rect")
        .data(data)
        .join("rect")  
        .attr("class", "bars") 
        .attr("x", d => xScale(d.Jurisdiction))
        .attr("y", d => yScale(d.Per10k))
        .attr("width", xScale.bandwidth())
        .attr("height", d => innerHeight - yScale(d.Per10k))
        .attr("fill", barColor)
        .on("click", (event, d) => { //draw donut chart on click
            drawDonutChart(d.Locations, d.Jurisdiction);
        })
        .on("mouseover", function(event, d) { // Show tooltip on hover
            tooltip.style("display", "block")
                .html(`<strong>Fines:</strong> ${d.TotalViolations.toLocaleString()}<br>
                    <strong>Licenses:</strong> ${d.TotalLicences.toLocaleString()}<br>`)
            d3.select(this).attr("r", 10);
        })
        .on("mousemove", function(event) {
            tooltip
                .style("left", (event.pageX + 12) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("display", "none");
            d3.select(this).attr("r", 4); // Reset radius
        });
        
    
    // Add text on top of the bars
    innerChart.selectAll(".bar-label")
        .data(data)
        .join("text")
        .attr("class", "bar-label")
        .attr("x", d => xScale(d.Jurisdiction) + xScale.bandwidth() / 2) // Center the text
        .attr("y", d => yScale(d.Per10k) - 5) // Position above the bar
        .attr("text-anchor", "middle") // Center align the text
        .style("font-size", "14px")
        .style("fill", "black")

        .text(d => d.Per10k.toFixed(2)); // Display the value
    
    // Add the title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-weight", "bold")
        // .attr("class", "axis-label")
         .attr("class", "title")
        .text(" Violations by Jurisdiction per 10,000 Licences");
    
    //x-axis label
    svg.append("text")  
        .attr("x", width - margin.right)
        .attr("y", height - 5)
        .attr("text-anchor", "middle")
        .style("font-size", "1.2em")
        .attr("class", "axis-label")
        .text("Jurisdiction");
    //y-axis label
    svg.append("text")
        .attr("x", 0)
        .attr("y", 30)
        .attr("class", "axis-label")
        .style("font-size", "1.2em")
        .text("Total Violations");

  
};
