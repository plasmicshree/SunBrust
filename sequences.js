// Dimensions of sunburst.
var width = 1000;
var height = 750;
var radius = Math.min(width, height) / 2;

// Breadcrumb dimensions: width, height, spacing, width of tip/tail.
var b = {
  w: 150, h: 30, s: 3, t: 10
};

// Mapping of step names to colors.
var colors = {
  "Pradesh_1": "#5687d1",
  "Pradesh_2": "#7b615c",
  "Pradesh_3": "#de783b",
  "Pradesh_4": "#6ab975",
  "Pradesh_5": "#a173d1",
  "Pradesh_6": "#bb3bbb",
  "Pradesh_7": "#bbb27b",
   "Taplejung": "#7bc880", "Panchthar": "#c721e0", "Ilam": "#fe70f3", "Jhapa": "#47be65", "Sankhuwasabha": "#e0755e", "Terhathum": "#71de1b", "Bhojpur": "#1bb40c", "Dhankuta": "#6cf41d", "Morang": "#403074", "Sunsari": "#87a72c", "Solukhumbu": "#1bcfe1", "Khotang": "#9c5a44", "Okhaldhunga": "#fd6257", "Udayapur": "#c83de7", "Saptari": "#751f4a", "Siraha": "#471995", "Dhanusha": "#b734d3", "Mahottari": "#1e9082", "Sarlahi": "#15fdf1", "Rautahat": "#193604", "Bara": "#8f300c", "Parsa": "#5b3e99", "Dolakha": "#e637f3", "Ramechaap": "#52f257", "Sindhuli": "#8597cc", "Rasuwa": "#c7fca2", "Dhading": "#54f7e3", "Nuwakot": "#218002", "Kathmandu": "#ff8d94", "Bhaktapur": "#ed61ad", "Lalitpur": "#29912f", "Kavrepalanchowk": "#171f53", "Sindhupalchowk": "#107a62", "Makwanpur": "#ec91df", "Chitwan": "#cfbeff", "Gorkha": "#7b442a", "Manang": "#bd1555", "Lamjung": "#7f6887", "Kaski": "#5d8db1", "Tanahun": "#e3a74f", "Synagja": "#f20c4d", "Nawalpur": "#8075e4", "Mustang": "#a3a841", "Myagdi": "#8dbf7a", "Baglung": "#6ebf7d", "Parbat": "#71ffbc", "Gulmi": "#acfec1", "Palpa": "#f65f74", "Arghakhaanchi": "#c21e6c", "Rupandehi": "#639f86", "Kapilbastu": "#446e56", "East Rukum": "#2f5c4f", "Rolpa": "#6e98ea", "Pyuthan": "#d11001", "Dang": "#d44ea4", "Banke": "#a30f2a", "Bardiya": "#7a433b", "Parasi": "#ef9cb0", "Salyan": "#35437d", "Dolpa": "#6ca909", "Mugu": "#8a863d", "Jumla": "#76ce3b", "Kalikot": "#57dc6c", "Humla": "#568329", "Jajarkot": "#45a3de", "Dailekh": "#84f684", "Surkhet": "#97806c", "West Rukum": "#c80286", "Bajura": "#61a23f", "Accham": "#c9f731", "Bajhang": "#a1e652", "Doti": "#7db765", "Kailali": "#67b18e", "Darchula": "#bc4ffd", "Baitadi": "#3883c2", "Dadeldhura": "#f98ef8", "Kanchanpur": "#343d9d", "1":"#5883c2","2":"#439f86","3": "#6597cc", "4": "#c5fca2", "5": "#74f7e3", "6": "#418002", "7": "#ff8d76", "8": "#ed63ad", "9": "#29914f", "10": "#371f53",
    "NCP_UML": "#FF8062", "Bibeksheel_Sajha":"#418002", "Independent":"#418002", "Nepali_Congress": "#29912f", "Nepali_Congress_BP":"#418002","Nepal_Majdur_Kisaan_Party":"#418002",  "Sanghiya_Samajbadi_Forum_Nepal": "#AA912f", "NCP_Maobadi": "#BB912f", "RPP_Democratic":"#acfec1",  "RPP":"#ccfec1", "Rastriya_Janamorcha":"#21fe44", "Rastriya_Janamukti_Party": "#4123de", "Unified_RPP_Rastrabadi":"#4111de", "Mangol_National_Org":"#45e3ae", "Rastriya_Janata_Party":"#43c3de",
"NayaSakti":"#AAa3de", "Deshbhakta_Ganatantrik_Morcha" : "#15a6da",
"Nepal_Dalit_Party": "#41a32e", "Sanghiya_Loktantrik":"#45F34e"

};

// Total size of all segments; we set this later, after loading the data.
var totalSize = 0; 

var vis = d3.select("#chart").append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    .append("svg:g")
    .attr("id", "container")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var partition = d3.partition()
    .size([2 * Math.PI, radius * radius]);

var arc = d3.arc()
    .startAngle(function(d) { return d.x0; })
    .endAngle(function(d) { return d.x1; })
    .innerRadius(function(d) { return Math.sqrt(d.y0); })
    .outerRadius(function(d) { return Math.sqrt(d.y1); });

// Use d3.text and d3.csvParseRows so that we do not need to have a header
// row, and can receive the csv as an array of arrays.
d3.text("NepalElec.csv", function(text) {
  var csv = d3.csvParseRows(text);
  var json = buildHierarchy(csv);
  createVisualization(json);
});

// Main function to draw and set up the visualization, once we have the data.
function createVisualization(json) {

  // Basic setup of page elements.
  initializeBreadcrumbTrail();
  drawLegend();
  d3.select("#togglelegend").on("click", toggleLegend);

  // Bounding circle underneath the sunburst, to make it easier to detect
  // when the mouse leaves the parent g.
  vis.append("svg:circle")
      .attr("r", radius)
      .style("opacity", 0);

  // Turn the data into a d3 hierarchy and calculate the sums.
  var root = d3.hierarchy(json)
      .sum(function(d) { return d.size; })
      .sort(function(a, b) { return b.value - a.value; });
  
  // For efficiency, filter nodes to keep only those large enough to see.
  var nodes = partition(root).descendants()
      .filter(function(d) {
          return (d.x1 - d.x0 > 0.005); // 0.005 radians = 0.29 degrees
      });

  var path = vis.data([json]).selectAll("path")
      .data(nodes)
      .enter().append("svg:path")
      .attr("display", function(d) { return d.depth ? null : "none"; })
      .attr("d", arc)
      .attr("fill-rule", "evenodd")
      .style("fill", function(d) { return colors[d.data.name]; })
      .style("opacity", 1)
      .on("mouseover", mouseover);

  // Add the mouseleave handler to the bounding circle.
  d3.select("#container").on("mouseleave", mouseleave);

  // Get total size of the tree = value of root node from partition.
  totalSize = path.datum().value;
 };

// Fade all but the current sequence, and show it in the breadcrumb trail.
function mouseover(d) {

  var percentage = (100 * d.value / totalSize).toPrecision(3);
  var percentageString = percentage + "%";
  if (percentage < 0.1) {
    percentageString = "< 0.1%";
  }

  d3.select("#percentage")
      .text(percentageString);

  d3.select("#explanation")
      .style("visibility", "");

  var sequenceArray = d.ancestors().reverse();
  sequenceArray.shift(); // remove root node from the array
  updateBreadcrumbs(sequenceArray, percentageString);

  // Fade all the segments.
  d3.selectAll("path")
      .style("opacity", 0.3);

  // Then highlight only those that are an ancestor of the current segment.
  vis.selectAll("path")
      .filter(function(node) {
                return (sequenceArray.indexOf(node) >= 0);
              })
      .style("opacity", 1);
}

// Restore everything to full opacity when moving off the visualization.
function mouseleave(d) {

  // Hide the breadcrumb trail
  d3.select("#trail")
      .style("visibility", "hidden");

  // Deactivate all segments during transition.
  d3.selectAll("path").on("mouseover", null);

  // Transition each segment to full opacity and then reactivate it.
  d3.selectAll("path")
      .transition()
      .duration(1000)
      .style("opacity", 1)
      .on("end", function() {
              d3.select(this).on("mouseover", mouseover);
            });

  d3.select("#explanation")
      .style("visibility", "hidden");
}

function initializeBreadcrumbTrail() {
  // Add the svg area.
  var trail = d3.select("#sequence").append("svg:svg")
      .attr("width", width)
      .attr("height", 50)
      .attr("id", "trail");
  // Add the label at the end, for the percentage.
  trail.append("svg:text")
    .attr("id", "endlabel")
    .style("fill", "#000");
}

// Generate a string that describes the points of a breadcrumb polygon.
function breadcrumbPoints(d, i) {
  var points = [];
  points.push("0,0");
  points.push(b.w + ",0");
  points.push(b.w + b.t + "," + (b.h / 2));
  points.push(b.w + "," + b.h);
  points.push("0," + b.h);
  if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
    points.push(b.t + "," + (b.h / 2));
  }
  return points.join(" ");
}

// Update the breadcrumb trail to show the current sequence and percentage.
function updateBreadcrumbs(nodeArray, percentageString) {

  // Data join; key function combines name and depth (= position in sequence).
  var trail = d3.select("#trail")
      .selectAll("g")
      .data(nodeArray, function(d) { return d.data.name + d.depth; });

  // Remove exiting nodes.
  trail.exit().remove();

  // Add breadcrumb and label for entering nodes.
  var entering = trail.enter().append("svg:g");

  entering.append("svg:polygon")
      .attr("points", breadcrumbPoints)
      .style("fill", function(d) { return colors[d.data.name]; });

  entering.append("svg:text")
      .attr("x", (b.w + b.t) / 2)
      .attr("y", b.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(function(d) { return d.data.name; });

  // Merge enter and update selections; set position for all nodes.
  entering.merge(trail).attr("transform", function(d, i) {
    return "translate(" + i * (b.w + b.s) + ", 0)";
  });

  // Now move and update the percentage at the end.
  d3.select("#trail").select("#endlabel")
      .attr("x", (nodeArray.length + 0.5) * (b.w + b.s))
      .attr("y", b.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(percentageString);

  // Make the breadcrumb trail visible, if it's hidden.
  d3.select("#trail")
      .style("visibility", "");

}

function drawLegend() {

  // Dimensions of legend item: width, height, spacing, radius of rounded rect.
  var li = {
    w: 75, h: 30, s: 3, r: 3
  };

  var legend = d3.select("#legend").append("svg:svg")
      .attr("width", li.w)
      .attr("height", d3.keys(colors).length * (li.h + li.s));

  var g = legend.selectAll("g")
      .data(d3.entries(colors))
      .enter().append("svg:g")
      .attr("transform", function(d, i) {
              return "translate(0," + i * (li.h + li.s) + ")";
           });

  g.append("svg:rect")
      .attr("rx", li.r)
      .attr("ry", li.r)
      .attr("width", li.w)
      .attr("height", li.h)
      .style("fill", function(d) { return d.value; });

  g.append("svg:text")
      .attr("x", li.w / 2)
      .attr("y", li.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(function(d) { return d.key; });
}

function toggleLegend() {
  var legend = d3.select("#legend");
  if (legend.style("visibility") == "hidden") {
    legend.style("visibility", "");
  } else {
    legend.style("visibility", "hidden");
  }
}

// Take a 2-column CSV and transform it into a hierarchical structure suitable
// for a partition layout. The first column is a sequence of step names, from
// root to leaf, separated by hyphens. The second column is a count of how 
// often that sequence occurred.
function buildHierarchy(csv) {
  var root = {"name": "root", "children": []};
  for (var i = 0; i < csv.length; i++) {
    var sequence = csv[i][0];
    var size = +csv[i][1];
    if (isNaN(size)) { // e.g. if this is a header row
      continue;
    }
    var parts = sequence.split("-");
    var currentNode = root;
    for (var j = 0; j < parts.length; j++) {
      var children = currentNode["children"];
      var nodeName = parts[j];
      var childNode;
      if (j + 1 < parts.length) {
   // Not yet at the end of the sequence; move down the tree.
 	var foundChild = false;
 	for (var k = 0; k < children.length; k++) {
 	  if (children[k]["name"] == nodeName) {
 	    childNode = children[k];
 	    foundChild = true;
 	    break;
 	  }
 	}
  // If we don't already have a child node for this branch, create it.
 	if (!foundChild) {
 	  childNode = {"name": nodeName, "children": []};
 	  children.push(childNode);
 	}
 	currentNode = childNode;
      } else {
 	// Reached the end of the sequence; create a leaf node.
 	childNode = {"name": nodeName, "size": size};
 	children.push(childNode);
      }
    }
  }
  return root;
};