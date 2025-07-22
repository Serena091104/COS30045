
d3.csv("data/Monthly_DetectionMethods.csv", d => ({
    Month: +d["Month (Number)"],
    Police: +d["Police issued"],
    Mobile: +d["Mobile camera"]
})).then(data => {
    drawLineChart(data, 1);
    
    d3.select("#y-scale-control").on("input", function () {
        const scale = +this.value;
        d3.select("#scale-value").text(scale);
        drawLineChart(data, scale);
     
    });
});

function drawLineChart(data, scaleFactor = 1) {
    d3.select("#line-chart").html(""); // Clear chart

    svg = d3.select("#line-chart")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`);

     innerChart = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    xScaleL
        .domain(d3.extent(data, d => d.Month))
        .range([0, innerWidth]);

    const allValues = data.flatMap(d => [d.Police, d.Mobile]);
    const yMax = d3.max(allValues) * scaleFactor;
    yScaleL.domain([0, yMax]).range([innerHeight, 0]);

    // Axes
    innerChart.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(d3.axisBottom(xScaleL).tickFormat(d3.format("d")));

    innerChart.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScaleL));

    innerChart.selectAll('.x-axis text, .y-axis text')
        .style('font-size', '15px');

    // Axis labels
    svg.append("text")  
        .attr("x", width - margin.right)
        .attr("y", height - 5)
        .attr("text-anchor", "middle")
        .style("font-size", "1.2em")
        .attr("class", "axis-label")
        .text("Month");

     svg.append("text")
        .attr("x", 0)
        .attr("y", 50)
        .attr("class", "axis-label")
        .style("font-size", "1.2em")
        .text("Violations count");

    const colors = { Police: "#1f77b4", Mobile: "#75485E" };
    const methods = [
        { name: "Police issued", key: "Police" },
        { name: "Mobile camera", key: "Mobile" }
    ];

    const lineGenerator = d3.line()
        .x(d => xScaleL(d.Month))
        .y(d => yScaleL(d.value));

    methods.forEach(method => {
        const lineData = data.map(d => ({
            Month: d.Month,
            value: d[method.key]
        }));

        innerChart.append("path")
            .datum(lineData)
            .attr("fill", "none")
            .attr("stroke", colors[method.key])
            .attr("stroke-width", 2)
            .attr("d", lineGenerator);

        // Add label at the end of each line
        const last = lineData[lineData.length - 1];
        innerChart.append("text")
            .attr("x", xScaleL(last.Month)  )
            .attr("y", yScaleL(last.value) - 10)
            .attr("text-anchor", "middle")
            .attr("font-weight", "bold")
            .style("font-size", "13px")
            .style("fill", colors[method.key])
            .text(method.name);
    });
    // Tooltip
   tooltip
        .attr("id", "line-tooltip")
    // Dots for Police
    innerChart.selectAll(".dot-police")
        .data(data)
        .join("circle")
        .attr("class", "dot dot-police")
        .attr("cx", d => xScaleL(d.Month))
        .attr("cy", d => yScaleL(d.Police))
        .attr("r", 4)
        .attr("fill", colors.Police)
        .on("mouseover", function(event, d) {
            tooltip.style("display", "block")
                .html(`<strong>Month:</strong> ${d.Month}<br>
                    <strong>Police:</strong> ${d.Police}<br>
                    <strong>Mobile:</strong> ${d.Mobile}`);
            d3.select(this).attr("r", 5);
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

    // Dots for Mobile
    innerChart.selectAll(".dot-mobile")
        .data(data)
        .join("circle")
        .attr("class", "dot dot-mobile")
        .attr("cx", d => xScaleL(d.Month))
        .attr("cy", d => yScaleL(d.Mobile))
        .attr("r", 4)
        .attr("fill", colors.Mobile)
        .on("mouseover", function(event, d) {
            tooltip.style("display", "block")
                .html(`<strong>Month:</strong> ${d.Month}<br>
                    <strong>Police:</strong> ${d.Police}<br>
                    <strong>Mobile:</strong> ${d.Mobile}`);
            d3.select(this).attr("r", 5); 
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
      
    // Legend
    const legend = svg.append("g")
       .attr("font-size", "16px")
       .attr("transform", `translate(${innerWidth + 45}, 0)`);

    methods.forEach((method, i) => {
        const row = legend.append("g")
            .attr("transform", `translate(-20, ${i * 20})`);
        row.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", colors[method.key]);
        row.append("text")
            .attr("x", 15)
            .attr("y", 10)
            .text(method.name)
            .style("font-size", "13px");
    });
    // Chart title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", (margin.top / 2)- 15)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-weight", "bold")
        // .attr("class", "axis-label")
        .attr("class", "title")
        .text("Monthly Violations by Detection Method");
}