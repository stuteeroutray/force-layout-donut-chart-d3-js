document.addEventListener('DOMContentLoaded', function() {
  var width = 1000,
      height = 800;
  var root;
  
  var tool_tip = d3.select("body").append("div")
                    .attr("id","tooltip")
                    .style("position", "absolute")
                    .style("z-index", "10")
                    .style("display", "none")
                    .style("background-color", "#f2eecb")
                    .style("opacity","0.8")
                    .style("border", "solid")
                    .style("border-width", "1px")
                    .style("border-radius", "5px")
                    .style("padding", "8px");

  var chart = d3.select("#chart").append("svg").attr("width", width).attr("height", height);
  var force = d3.layout.force(); 
   
  d3.json("data/data.json", function(json) {
    root = json;
    root.fixed = true;
    root.x = width / 2;
    root.y = height / 2;
   
    var defs = chart.insert("svg:defs")
                    .data(["end"]);
   
    defs.enter()
        .append("svg:path")
        .attr("d", "M 130 110 C 120 140, 180 140, 170 110");

    plotGraph(); 
    drawLegend();
  });
   
  function plotGraph() {
      var nodes = getChildren(root),
          links = d3.layout.tree().links(nodes);
     
      force.nodes(nodes)
            .links(links)
            .gravity(0.07)
            .charge(-1000)
            .linkDistance(50)
            .friction(0.5)
            .linkStrength(function(l, i) {return 1; })
            .size([width, height])
            .on("tick", customTick)
            .start();
   
      var path = chart.selectAll("path.link")
        .data(links, function(d) { return d.target.id; });
   
      path.enter().insert("svg:path")
        .attr("class", "link")
        .style("stroke", "#b3aa9d");
     
      path.exit().remove();
     
      var node = chart.selectAll("g.node")
          .data(nodes, function(d) { return d.id; });
     
      var enterNode = node.enter().append("svg:g")
          .attr("class", "node")
          .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
          .on("click", toggleOnClick)
          .call(force.drag);
      
      //add images
      var images = enterNode.append("svg:image")
            .attr("xlink:href",  function(d) { return d.img;})
            .attr("x", function(d) { return -20;})
            .attr("y", function(d) { return -20;})
            .attr("height", 40)
            .attr("width", 40);
      
      images.on( 'mouseenter', function() {
                  d3.select( this )
                    .transition()
                    .attr("x", function(d) { return -60;})
                    .attr("y", function(d) { return -60;})
                    //make images grow by changing height and width
                    .attr("height", 80)
                    .attr("width", 80);
              })
              .on( 'mouseleave', function() {
                d3.select( this )
                  .transition()
                  .attr("x", function(d) { return -20;})
                  .attr("y", function(d) { return -20;})
                  .attr("height", 40)
                  .attr("width", 40);
              });

      enterNode.append("text")
          .attr("class", "nodetext")
          .attr("x", 20)
          .attr("y", 40)
          .attr("fill", "#000000")
          .text(function(d) { if(d.img === "images/rocket.png") return d.name; }); //show name of rockets

      //add year tooltip     
      enterNode.on('mouseover', function(d,i) {
                  if(typeof d.year !== 'undefined'){
                    d3.select('#tooltip')
                      .style("display", "inline")
                    drawTooltip(d.name,d.year.split("-")[0],d.year.split("-")[1],d.year.split("-")[2]);}
                })
                .on('mousemove',function(d,i) {
                  if(typeof d.year !== 'undefined'){
                    d3.select('#tooltip')
                      .style("left", (d3.event.pageX+20) + "px")
                      .style("top", (d3.event.pageY-20) + "px");}
                })
                .on('mouseout', function(d,i) {
                  if(typeof d.year !== 'undefined'){
                    d3.select('#tooltip').selectAll('*').remove();
                    d3.select('#tooltip')
                      .style("display", "none");}
                });


      node.exit().remove();
    
      path = chart.selectAll("path.link");
      node = chart.selectAll("g.node");
     
      function customTick() {
          path.attr("d", function(d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
                return   "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
            });
            node.attr("transform", nodeTransform);    
          }
  }

  function toggleOnClick(d) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } 
      else {
        d.children = d._children;
        d._children = null;
      }
      plotGraph();
  }

  function nodeTransform(d) {
      d.x =  Math.max(50, Math.min(width - (d.imgwidth/2 || 16), d.x));
      d.y =  Math.max(50, Math.min(height - (d.imgheight/2 || 16), d.y));
      return "translate(" + d.x + "," + d.y + ")";
     }

  function getChildren(root) {
      var nodes = [], i = 1;
     
      function recurse(node) {
        if (node.children) 
          node.children.forEach(recurse);
        if (!node.id) 
          node.id = i++;
        nodes.push(node);
      }
     
      recurse(root);
      return nodes;
  }

  //draw donut chart
  function drawTooltip(name,year,monthid,day){
      var margin = {left: 20, top: 20, right: 20, bottom: 20},
          width = 200 - margin.left - margin.right,
          height = 200 - margin.top - margin.bottom;

      var svg = d3.select("#tooltip").append("svg")
                  .attr("width", (width + margin.left + margin.right))
                  .attr("height", (height + margin.top + margin.bottom))
                  .append("g").attr("class", "wrapper")
                  .attr("transform", "translate(" + (width / 2 + margin.left) + "," + (height / 2 + margin.top) + ")");

      var months = [
      {month: "January",  startDate: 0, endDate: 30, id:"01"},
      {month: "February", startDate: 31, endDate: 58, id:"02"},
      {month: "March", startDate: 59, endDate: 89, id:"03"},
      {month: "April", startDate: 90, endDate: 119, id:"04"},
      {month: "May", startDate: 120, endDate: 150, id:"05"},
      {month: "June", startDate: 151, endDate: 180, id:"06"},
      {month: "July", startDate: 181, endDate: 211, id:"07"},
      {month: "August", startDate: 212, endDate: 242, id:"08"},
      {month: "September", startDate: 243, endDate: 272, id:"09"},
      {month: "October", startDate: 273, endDate: 303, id:"10"},
      {month: "November", startDate: 306, endDate: 333, id:"11"},
      {month: "December", startDate: 334, endDate: 364, id:"12"}
      ];

      var arc = d3.svg.arc()
        .innerRadius(width*0.8/2) 
        .outerRadius(width*0.8/2 + 30);

      var pie = d3.layout.pie()
        .value(function(d) { return d.endDate - d.startDate; })
        .padAngle(.01)
        .sort(null);

      svg.selectAll(".arc")
        .data(pie(months))
         .enter().append("path")
        .attr("class", "arc")
        .attr("id", function(d,i) { return "arc_"+i; })
        .attr("fill", function(d) {
               if(d.data.id === monthid) return "#6e807e";
               return "#ededed";
            })
        .attr("d", arc);

      svg.selectAll(".monthText")
        .data(months)
        .enter().append("text")
        .attr("class", "monthText")
        .attr("x", 5)
        .attr("dy", 18)
        .append("textPath")
        .attr("xlink:href",function(d,i){return "#arc_"+i;})
        .text(function(d){return d.month;});
      
      svg.append("text")
         .attr("text-anchor", "middle")
         .attr('font-size', '1.25em')
         .attr('y', 0)
         .text(name);

      svg.append("text")
         .attr("text-anchor", "middle")
         .attr('font-size', '1.5em')
         .attr('y', 30)
         .text(year);

      svg.append("text")
         .attr("text-anchor", "middle")
         .attr('font-size', '1em')
         .attr('y', 50)
         .text(monthid+"/"+day);
  }

  function drawLegend(){
      var width = 350,height = 800, yimage = 60, ytext = 80;
      var legend = d3.select("#legend").append("svg").attr("width", width).attr("height", height);

      legend.append("text")
            .attr("x", 25)             
            .attr("y", 20)
            .style("font-size", "25px") 
            .attr("font-weight", "bold")
            .attr("text-decoration", "underline")
            .attr("fill", "#454444")
            .text("The Space Dogs");

      legend.append("text")
            .attr("x", 25)             
            .attr("y", 45)
            .style("font-size", "22px") 
            .attr("font-weight", "bold")
            .attr("fill", "#454444")
            .text("How to read the graph :");

      legend.append("svg:image")
            .attr("xlink:href",  "images/bowtie.png")
            .attr("x", 25)
            .attr("y", yimage) 
            .attr("height", 25)
            .attr("width", 25);

      legend.append("text")
            .attr("x", 60)
            .attr("y", ytext)
            .attr("font-size", "22px")
            .text("Female | Alive")
            .attr("fill", "#7d7d7d")
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle");

      legend.append("svg:image")
          .attr("xlink:href",  "images/bowtie-grey.png")
          .attr("x", 25)
          .attr("y", yimage+=30) 
          .attr("height", 25)
          .attr("width", 25);

      legend.append("text")
            .attr("x", 60)
            .attr("y", ytext+=30)
            .attr("font-size", "22px")
            .text("Female | Dead")
            .attr("fill", "#7d7d7d")
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle");

      legend.append("svg:image")
          .attr("xlink:href",  "images/tie.png")
          .attr("x", 25)
          .attr("y", yimage+=30) 
          .attr("height", 25)
          .attr("width", 25);

      legend.append("text")
            .attr("x", 60)
            .attr("y", ytext+=30)
            .attr("font-size", "22px")
            .text("Male | Alive")
            .attr("fill", "#7d7d7d")
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle");

      legend.append("svg:image")
          .attr("xlink:href",  "images/tie-grey.png")
          .attr("x", 25)
          .attr("y", yimage+=30) 
          .attr("height", 25)
          .attr("width", 25);

      legend.append("text")
            .attr("x", 60)
            .attr("y", ytext+=30)
            .attr("font-size", "22px")
            .text("Male | Dead")
            .attr("fill", "#7d7d7d")
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle");

      legend.append("svg:image")
          .attr("xlink:href",  "images/paw-prints.png")
          .attr("x", 25)
          .attr("y", yimage+=50) 
          .attr("height", 25)
          .attr("width", 25);

      legend.append("text")
            .attr("x", 60)
            .attr("y", ytext+=50)
            .attr("font-size", "22px")
            .text("Counted as 1 dog | Alive. Hover to see donut chart.")
            .attr("fill", "#7d7d7d")
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle");

      legend.append("svg:image")
          .attr("xlink:href",  "images/paw-prints-grey.png")
          .attr("x", 25)
          .attr("y", yimage+=30) 
          .attr("height", 25)
          .attr("width", 25);

      legend.append("text")
            .attr("x", 60)
            .attr("y", ytext+=30)
            .attr("font-size", "22px")
            .text("Counted as 1 dog | Dead. Hover to see donut chart.")
            .attr("fill", "#7d7d7d")
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle");

      legend.append("svg:image")
          .attr("xlink:href",  "images/rocket.png")
          .attr("x", 25)
          .attr("y", yimage+=50) 
          .attr("height", 30)
          .attr("width", 30);

      legend.append("text")
            .attr("x", 60)
            .attr("y", ytext+=50)
            .attr("font-size", "22px")
            .text("Rocket.  Hover to see its Name.")
            .attr("fill", "#7d7d7d")
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle");

      legend.append("text")
            .attr("x", 25)             
            .attr("y", ytext+=50)
            .attr("fill", "#454444")
            .style("font-size", "22px") 
            .attr("font-weight", "bold")
            .text("Every rocket icon has child nodes coming out of it,");
      legend.append("text")
            .attr("x", 25)             
            .attr("y", ytext+=20)
            .attr("fill", "#454444")
            .style("font-size", "22px") 
            .attr("font-weight", "bold")
            .text("showing the dogs that went on a mission on that rocket.");
      legend.append("text")
            .attr("x", 25)             
            .attr("y", ytext+=25)
            .attr("fill", "#454444")
            .style("font-size", "22px") 
            .attr("font-weight", "bold")
            .text("Click on nodes to toggle between hiding/showing child nodes.");

      legend.append("svg:image")
          .attr("xlink:href",  "images/yeardonut.png")
          .attr("x", 55)
          .attr("y", ytext+=40) 
          .attr("height", 125)
          .attr("width", 125);

      legend.append("text")
            .attr("x", 25)
            .attr("y", ytext+=125)
            .attr("font-size", "22px")
            .text("Displayed when hovered over leaf nodes.")
            .attr("fill", "#7d7d7d")
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle");
      legend.append("text")
            .attr("x", 25)             
            .attr("y", ytext+=20)
            .attr("fill", "#7d7d7d")
            .style("font-size", "22px") 
            .text("Shows Latin name of Dog, date of flight,");
      legend.append("text")
            .attr("x", 25)             
            .attr("y", ytext+=20)
            .attr("fill", "#7d7d7d")
            .style("font-size", "22px") 
            .text("and the month of travel colored in the donut chart.");
  }
});