const margin = { top: 20, left: 50, right: 20, bottom: 20 };
const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;


let data;
let reverse = false;
let type = d3.select('#group-by').node().value;

const svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .attr("role", "graphics-document")
  .attr("aria-roledescription", "bar chart")
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

const xScale = d3
  .scaleBand()
  .rangeRound([0, width])
  .paddingInner(0.1);

const yScale = d3.scaleLinear().range([height, 0]);

svg.append('g')
  .attr('class', 'axis x-axis')
  .attr("transform", "translate(0," + height + ")");

svg.append('g')
  .attr('class', 'axis y-axis');

svg.append("text")
    .attr("class", "y-axis-title")
    .attr("text-anchor", "middle")
    .attr('font-size', '12px')
    .attr("y", -10)
    .attr("x", 0);

function update(data, type, reverse){
  
  console.log('data', data);

  data.sort((a, b)=>b[type] - a[type]);  
  
  if (reverse){
    data.reverse();
  }
  
  xScale.domain(data.map(d=>d.company));
  
  console.log(xScale.domain())
  
  
  yScale.domain([0, d3.max(data,d=>d[type])]);
  
 
  const bars = svg.selectAll('.bar')
    .data(data, d=>d.company)
  
  bars.enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('fill', '#1f76b4')
    .attr('x', d=>xScale(d.company))
    .attr('width', d=>xScale.bandwidth())
  	.attr("height",0)
	  .attr("y",height)
    .merge(bars)
    .transition()
    .delay((d,i)=>i*100)
    .duration(1000)
    .attr('x', d=>xScale(d.company))
    .attr('y', d=>yScale(d[type]))
    .attr('height', d=>height-yScale(d[type]))
  
  bars.exit().remove();
  
  const xAxis = d3.axisBottom(xScale);
  
  svg.select('.x-axis')
    .transition()
    .duration(1000)
    .call(xAxis);
  
  const yAxis = d3.axisLeft(yScale);
  
  svg.select('.y-axis')
    .transition()
    .duration(1000)
    .call(yAxis);
  
  d3.select('.y-axis-title').text(type==="stores"? "Stores" : "Billion USD")

  const rev_label = "Bar chart showing the total revenue of leading coffee house chains in billions of U.S. dollars.  Starbucks leads with about 16 billion USD, while Tim Hortons and Panera bread have about 3 billion and 2.5 billion USD in revenue respectively."
  const store_label = "Bar chart showing the total number of stores of leading coffee house chains worldwide. Starbucks leads with about 22,000 stores, while Dunkin and Tim Hortons have about 11,000 and 5,000 stores respectively."

  const chart = d3.select(".chart").select("svg")

  chart.attr("aria-label", () => {
    if (type == "stores") {
      return store_label
    }
    if (type == "revenue") {
      return rev_label
    }
  })
    .attr("tabindex", 0)

  chart.selectAll(".bar")
    .attr("role", "graphics-symbol")
    .attr("aria-roledescription", "bar element")
    .attr("aria-label", d => {
      if (type == "stores") {
        return `${d.company} has ${d.stores} stores.`
      }
      if (type == "revenue") {
        return `${d.company} makes ${d.revenue} billion USD in revenue`
      }
    })
    .attr("tabindex", 0)

    chart.selectAll(".axis")
      .attr("aria-hidden", true)

    chart.selectAll(".y-axis-title")
      .attr("aria-hidden", true)
}


d3.csv("coffee-house-chains.csv", d3.autoType).then(_data => {
  data = _data;
  
  update(data, type, reverse);
  
})


d3.select('#group-by').on('change', (event)=>{
  type = d3.select('#group-by').node().value;
  update(data, type, reverse);
})

d3.select('#sort-btn').on('click', (event)=>{
  console.log('sort button clicked');
  reverse = !reverse;
  update(data, type, reverse);
})