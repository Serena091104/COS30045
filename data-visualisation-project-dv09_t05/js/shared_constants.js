const margin = { top: 60, right: 70, bottom: 50, left: 60 };
const width = 850;
const height = 500;
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

const bodyBackgroundColor = "#fffaf0";
const barColor = "#0077b6";
// const binColor = "#69b3a2";
const binColor = "#337B7E"; // Color for histogram bins

const tooltipWidth = 65; 
const tooltipHeight = 32; 

const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("background", "rgba(0,0,0,0.8)")
    .style("color", "#fff")
    .style("padding", "6px 12px")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("font-size", "13px")
    .style("z-index", 1000)
    .style("display", "none");

const xScale =d3.scaleBand();
const yScale = d3.scaleLinear();

const xScaleL = d3.scaleTime(); // For line chart
const yScaleL = d3.scaleLinear(); // For line chart
  //create bin generator for histogram
const binGenerator = d3.bin()
    .value(d => d.energyConsumption) //value to bin

const xScaleH = d3.scaleBand().padding(0.2); // For histogram
const yScaleH = d3.scaleLinear();

const filters_state = [
    { id: "all", label: "All", isActive: true },
    { id: "ACT", label: "ACT", isActive: false },
    { id: "NSW", label: "NSW", isActive: false },
    { id: "NT", label: "NT", isActive: false },
    { id: "SA", label: "SA", isActive: false },
    { id: "TAS", label: "TAS", isActive: false },
    { id: "VIC", label: "VIC", isActive: false },
    { id: "WA", label: "WA", isActive: false }
];


// dynamic scales for the chart  
// const xScale = d3.scaleBand().range([0, innerWidth]).padding(0.1);
// const yScale = d3.scaleLinear().range([innerHeight, 0]);

