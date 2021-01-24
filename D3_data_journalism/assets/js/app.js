console.log('JS Connected');

//Step 1: Setup chart
let svgWidth = 900;
let svgHeight = 600;
let margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};
let width = svgWidth - margin.left - margin.right
let height = svgHeight - margin.top - margin.bottom

//Step 2: Create an SVG Wrapper
let svg = d3.select('#scatter')
    .append('svg')
    .attr('width',svgWidth)
    .attr('height',svgHeight)

let chartGroup = svg.append('g')
    .attr('transform',`translate(${margin.left},${margin.top})`)

//Bonus functions:
//Initialize parameters
let chosenXAxis = "poverty";
let chosenYAxis = "healthcare";

/**
 * update X-scale upon click on axis label
 * @param {object} data Data
 * @param {string} chosenXAxis Selected X axis in chart
 */
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
      d3.max(data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;
}

/**
 * update Y-scale upon click on axis label
 * @param {object} data Data
 * @param {string} chosenYAxis Selected Y axis in chart
 */
function yScale(data, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
      d3.max(data, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]);

  return yLinearScale;
}

/**
 * Update X-axis var upon click on axis label
 * @param {object} newXScale Linear Scale for X
 * @param {string} xAxis Selected X-axis
 */
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

/**
 * Update Y-axis var upon click on axis label
 * @param {object} newYScale Linear Scale for Y
 * @param {string} yAxis Selected Y-axis
 */
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

/**
 * Render circles group with transition based on selection
 * @param {object} circlesGroup D3 SVG circles group
 * @param {object} newXScale Linear Scale for X
 * @param {object} chosenXAxis Selected X-axis
 * @param {object} newYScale Linear Scale for Y
 * @param {object} chosenYAxis Selected Y-axis
 */
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.selectAll('circle').transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  circlesGroup.selectAll('text').transition()
    .duration(1000)
    .attr("dx", d => newXScale(d[chosenXAxis])-10)
    .attr("dy", d => newYScale(d[chosenYAxis])+5);

  return circlesGroup;
}

/**
 * Update Chart ToolTip based on selection
 * @param {object} chosenXAxis Selected X-axis
 * @param {object} circlesGroup D3 SVG circles group
 * @param {object} chosenYAxis Selected Y-axis
 */
function updateToolTip(chosenXAxis, circlesGroup, chosenYAxis) {

  var label;
  var labelSymbol = '';

  if (chosenXAxis === "poverty") {
    label = "Poverty:";
    labelSymbol = "%";
  } 
  else if (chosenXAxis === "age"){
    label = "Age:";
  }
  else{
    label = "Household:";
  }

  var ylabel;

  if (chosenYAxis === "healthcare") {
    ylabel = "Healthcare:";
  } 
  else if (chosenYAxis === "obese"){
    ylabel = "Obese:";
  }
  else{
    ylabel = "Smokes:";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${label} ${d[chosenXAxis]}${labelSymbol}<br>${ylabel} ${d[chosenYAxis]}%`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

//Step 3: Import data from file
console.log(window.location.href)
d3.csv("assets/data/data.csv").then(journData=> {
  //if (err) throw err;

  //Step 4: Parse the data
  journData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.age = +data.age;
    data.income = +data.income;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
    data.abbr = data.abbr;
  });

  //Step 5 & 6: Create the scales
  let xLinearScale = xScale(journData, chosenXAxis);
  let yLinearScale = yScale(journData, chosenYAxis);

  //Setup 7: Create the Axes
  let bottomAxis = d3.axisBottom(xLinearScale);
  let leftAxis = d3.axisLeft(yLinearScale);

  //Step 8: Append the Axes
  //Append x axis
  let xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);
  //Append y axis
  let yAxis = chartGroup.append("g")
    .call(leftAxis);

  //Step 9: Setup circles generators
  var circlesGroup = chartGroup.selectAll("g")
    .data(journData)
    .enter()
    .append("g")

  let circles = circlesGroup.append('circle')
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 15)
    .attr("fill", "blue")
    
    circlesGroup.append('text')
    .attr('dx', d => xLinearScale(d[chosenXAxis])-8)
    .attr('dy', d => yLinearScale(d[chosenYAxis])+5)
    .classed('circleText', true)
    .text(d=>d.abbr);

  //Step 10: Add AXES labels
  //Create group for x-axis labels
  let labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  let povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  let ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  let householdLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

  //Create group for y-axis labels
  let labelsGroupY = chartGroup.append("g")
    .attr("transform", `translate(${width / 60}, ${height - 450})`);
  
  let healthcareLabel = labelsGroupY.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2)+15)
    .attr("value", "healthcare") // value to grab for event listener
    .attr("dy", "1em")
    .classed("active", true)
    .text("Lacks Healthcare (%)");

  let obesityLabel = labelsGroupY.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left+20)
    .attr("x", 0 - (height / 2)+25)
    .attr("value", "obesity") // value to grab for event listener
    .attr("dy", "1em")
    .classed("inactive", true)
    .text("Obese (%)");

  let smokesLabel = labelsGroupY.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left+40)
    .attr("x", 0 - (height / 2)+25)
    .attr("value", "smokes") // value to grab for event listener
    .attr("dy", "1em")
    .classed("inactive", true)
    .text("Smokes (%)");
    
  //Update ToolTip based on selection
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup, chosenYAxis);

  //X axis - event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      //Get selected
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {
        //Replaces chosenXAxis with value
        chosenXAxis = value;
        //Updates x scale for new data
        xLinearScale = xScale(journData, chosenXAxis);
        //Updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);
        //Updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        //Updates ToolTip with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup, chosenYAxis);
        //Changes css classes to show selected labels
        if (chosenXAxis === "age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          householdLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "poverty"){
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          householdLabel
            .classed("active", false)
            .classed("inactive", true);
        }else{
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          householdLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });

  //Y axis event listener
  labelsGroupY.selectAll("text")
    .on("click", function() {
      //Get selected
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {
        //Replaces chosenYAxis with value
        chosenYAxis = value;
        //Updates y scale for new data
        yLinearScale = yScale(journData, chosenYAxis);
        //Updates y axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);
        //Updates circles with new y values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        //Updates ToolTip with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup, chosenYAxis);
        //Changes css classes to show selected labels
        if (chosenYAxis === "healthcare") {
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "obesity"){
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
        }else{
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}).catch(e=>{
  console.log(e);
});


