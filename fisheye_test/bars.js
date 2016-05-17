(function() {
  d3.fisheye = {
    scale: function(scaleType) {
          return d3_fisheye_scale(scaleType(), 3, 0);
      },
    ordinal: function() {
        return d3_fisheye_scale_ordinal(d3.scale.ordinal(), 3, 0)
    },
    circular: function() {
        var radius = 200,
            distortion = 2,
            k0,
            k1,
            focus = [0, 0];

        function fisheye(d) {
            var dx = d.x - focus[0],
                dy = d.y - focus[1],
                dd = Math.sqrt(dx * dx + dy * dy);
            if (!dd || dd >= radius) return {x: d.x, y: d.y, z: 1};
            var k = k0 * (1 - Math.exp(-dd * k1)) / dd * .75 + .25;
            return {x: focus[0] + dx * k, y: focus[1] + dy * k, z: Math.min(k, 10)};
        }

        function rescale() {
            k0 = Math.exp(distortion);
            k0 = k0 / (k0 - 1) * radius;
            k1 = distortion / radius;
            return fisheye;
        }

        fisheye.radius = function(_) {
            if (!arguments.length) return radius;
            radius = +_;
            return rescale();
        };

        fisheye.distortion = function(_) {
            if (!arguments.length) return distortion;
            distortion = +_;
            return rescale();
        };

        fisheye.focus = function(_) {
            if (!arguments.length) return focus;
            focus = _;
            return fisheye;
        };

        return rescale();
    },
  };

    function d3_fisheye_scale(scale, d, a) {

      function fisheye(_) {
          var x = scale(_),
              left = x < a,
              range = d3.extent(scale.range()),
              min = range[0],
              max = range[1],
              m = left ? a - min : max - a;
          if (m == 0) m = max - min;
          return (left ? -1 : 1) * m * (d + 1) / (d + (m / Math.abs(x - a))) + a;
      }

      fisheye.distortion = function (_) {
          if (!arguments.length) return d;
          d = +_;
          return fisheye;
      };

      fisheye.focus = function (_) {
          if (!arguments.length) return a;
          a = +_;
          return fisheye;
      };

      fisheye.copy = function () {
          return d3_fisheye_scale(scale.copy(), d, a);
      };

      fisheye.nice = scale.nice;
      fisheye.ticks = scale.ticks;
      fisheye.tickFormat = scale.tickFormat;
      return d3.rebind(fisheye, scale, "domain", "range");
    };

    function d3_fisheye_scale_ordinal(scale, d, a) {

        function scale_factor(x) {
            var 
                left = x < a,
                range = scale.rangeExtent(),
                min = range[0],
                max = range[1],
                m = left ? a - min : max - a;

            if (m == 0) m = max - min;
            var factor = (left ? -1 : 1) * m * (d + 1) / (d + (m / Math.abs(x - a)));
            return factor + a;
        };

        function fisheye(_) {
            return scale_factor(scale(_));
        };

        fisheye.distortion = function (_) {
            if (!arguments.length) return d;
            d = +_;
            return fisheye;
        };

        fisheye.focus = function (_) {
            if (!arguments.length) return a;
            a = +_;
            return fisheye;
        };

        fisheye.copy = function () {
            return d3_fisheye_scale_ordinal(scale.copy(), d, a);
        };

        fisheye.rangeBand = function (_) {
            var band = scale.rangeBand(),
                x = scale(_),
                x1 = scale_factor(x),
                x2 = scale_factor(x + band);

            return Math.abs(x2 - x1);
        };

       
        fisheye.rangeRoundBands = function (x, padding, outerPadding) {
            var roundBands = arguments.length === 3 ? scale.rangeRoundBands(x, padding, outerPadding) : arguments.length === 2 ? scale.rangeRoundBands(x, padding) : scale.rangeRoundBands(x);
            fisheye.padding = padding * scale.rangeBand();
            fisheye.outerPadding = outerPadding;
            return fisheye;
        };

        return d3.rebind(fisheye, scale, "domain",  "rangeExtent", "range");
    };
        
})();

var w = 960,
h = 500,
p = [20, 50, 30, 20],
    
//fisheye distortion scale
x = d3.fisheye.ordinal().rangeRoundBands([0, w - p[1] - p[3]]).distortion(0.9),

y = d3.scale.linear().range([0, h - p[0] - p[2]]),
z = d3.scale.ordinal().range(["lightpink", "darkgray", "lightblue"]),
parse = d3.time.format("%m/%Y").parse,
format = d3.time.format("%b");
 
var svg = d3.select("body").append("svg:svg")
.attr("width", w)
.attr("height", h)
.append("svg:g")
.attr("transform", "translate(" + p[3] + "," + (h - p[2]) + ")");

var crimea_raw = d3.select("#csvdata").text();
var crimea = d3.csv.parse(crimea_raw);
 
// Transpose the data into layers by cause.
var causes = d3.layout.stack()(["Synnynnäinen heikkous / ennenaikainen syntymä","'Vanhuuden taudit'","Lavantauti ja pikkulavantauti","B14 Tuhkarokko","Tulirokko","Hinkuyskä","Kurkkumätä","B30 Influenssa","Ruusu","Verenmyrkytys","Keuhko- ja kurkunpäätuberkuloosi","Aivokalvo- ja aivotuberkuloosi","Muut tuberkuloosimuodot","Diabetes","Aivoverenvuoto ja aivokalvonverenvuoto","Verenkiertoelinten taudit","Keuhkoputkentulehdus","B4 Suolitulehdus ja muut ripulitaudit","B35 Umpilisäkkeentulehdus","Vatsakalvon tulehdus (syy tuntematon)","Virtsaelinten taudit","Raskauden jälkeinen verenmyrkytys","Abortin jälkeinen verenmyrkytys","Kasvaimet","Tapaturma","BN Itsemurhat","Murhat / tapot ym.","Tuntematon kuolinsyy","B5 Hengityselinten tuberkuloosi","B6 Muut tuberkuloosimuodot / jälkitilat mukaan luettuna","B17 Kuppa ja sen jälkitilat","B4 Lavantauti","B7 Tulirokko / streptokokkiangina","B9 Hinkuyskä","B11 Tarttuva aivokalvontulehdus (meningokokkien aiheuttama)","B12 Äkillinen tarttuva lapsihalvaus","B18 Muut tartunta- ja loistaudit","B19 Pahanlaatuiset kasvaimet sekä imusuoni- ja vertamuodostavien elinten kasvaimet","B20 Hyvänlaatuiset ja tarkemmin määrittelemättömät kasvaimet","B21 Sokeritauti","B23 Vähäverisyydet","B22 Keskushermoston verisuoniston sairaudet","B23 Aivokalvontulehdus (paitsi meningokokkinen tai tuberkuloottinen","B24 Reumaattinen kuume","B26 Krooniset reumaattiset sydäntaudit","B26 Verisuonten kovettumisen ja rappeutumisen aiheuttamat sydäntaudit","B29 Muut sydäntaudit","B28 Verenpainetauti sydänoirein","B29 Verenpainetauti ilman sydänoireita","B31 Keuhkokuume","B32 Keuhkoputkentulehdus","B34 Mahahaava / pohjukaissuolihaava","B34 Umpilisäkkeentulehdus","B36 Suolentukkeuma ja tyrä","B36 Mahakatarri ja suolitulehdukset","B37 Maksankovettuma","B38 Nefriitti ja nefroosi","B39 Suurentunut eturauhanen","B40 Raskauden / synnytyksen ja lapsivuodeajan lisätaudit","B41 Synnynnäiset epämuodostumat","B42 Syntymävammat / syntymän jälkeinen valekuolema ja keuhkojen ilmattomuus","B43 Vastasyntyneen tartuntataudit","B44 Muut vastasyntyneen ja varhaislapsuuden taudit","B45 Vanhuus ja epätarkasti määritellyt sairaustilat","B46 Muut taudit","BN47 Tapaturmat yhteensä","BN48 Liikennetapaturmat","BN49 Myrkytystapaturmat","BN50 Hukkumistapaturmat","3 Puna- ja ameebatauti","16 Malaria","B22 Vitamiini- ja muut puutostaudit","B24 Aivokalvontulehdus","B25 Äkillinen kuumereuma","B27 Verenpainetaudit","B28 Verensalpaus-sydäntaudit","B30 Aivoverisuonien taudit","B33 Keuhkoputkentulehdus / keuhkolaajentuma ja astma","B38 Munuaistulehdus ja rappiomunuaistauti","B39 Eturauhasen liikakasvu","B40 Keskenmeno","B41 Muut raskauden / synnytyksen ja lapsivuodeajan lisätaudit. Synnytys ilman mainintaa komplikaatiosta","B42 Synnynnäiset epämuodostumat","B43 Synnytysvauriot / vaikea synnytys ja muut hapettomuus- ja vähähappisuustilat","B44 Muita perinataalisen kuolleisuuden syitä","B45 Oireita ja epätäydellisesti määriteltyjä tapauksia","B46 Muut sairaudet","Onnettomuus tai tahallinen teko","BE47 Moottoriajoneuvotapaturmat","BE48 Muut tapaturmat","BE50 Muut ulkoiset syyt"].map(function(cause) {
return crimea.map(function(d) {
return {x: parse(d.year), y: d[cause] ? +d[cause] : 0};
});
}));
 
// Compute the x-domain (by date) and y-domain (by top).
x.domain(causes[0].map(function(d) { return d.x; }));
y.domain([0, d3.max(causes[causes.length - 1], function(d) { return d.y0 + d.y; })]);
 
// Add a group for each cause.
var cause = svg.selectAll("g.cause")
.data(causes)
.enter().append("svg:g")
.attr("class", "cause")
.style("fill", function(d, i) { return z(i); })
.style("stroke", function(d, i) { return d3.rgb(z(i)).darker(); });
 
// Add a rect for each date.
var rect = cause.selectAll("rect")
.data(Object)
.enter().append("svg:rect")
.attr("x", function(d) { return x(d.x); })
.attr("y", function(d) {
  return -y(d.y0) - y(d.y);
})
.attr("height", function(d) { return y(d.y); })
.attr("width", function(d) {return x.rangeBand(d.x);});
 
// Add a label per date.
var label = svg.selectAll("text")
.data(x.domain())
.enter().append("svg:text")
.attr("x", function(d) { return x(d) + x.rangeBand(d) / 2; })
.attr("y", 6)
.attr("text-anchor", "middle")
.attr("dy", ".71em")
.text(format);
 
// Add y-axis rules.
var rule = svg.selectAll("g.rule")
.data(y.ticks(5))
.enter().append("svg:g")
.attr("class", "rule")
.attr("transform", function(d) { return "translate(0," + -y(d) + ")"; });
 
rule.append("svg:line")
.attr("x2", w - p[1] - p[3])
.style("stroke", function(d) { return d ? "#fff" : "#000"; })
.style("stroke-opacity", function(d) { return d ? .7 : null; });
 
rule.append("svg:text")
.attr("x", w - p[1] - p[3] + 6)
.attr("dy", ".35em")
.text(d3.format(",d"));

//respond to the mouse and distort where necessary
svg.on("mousemove", function() {
    var mouse = d3.mouse(this);
    
    //refocus the distortion
    x.focus(mouse[0]);
    //redraw the bars
    rect
    .attr("x", function(d) { return x(d.x); })
    .attr("y", function(d) { return -y(d.y0) - y(d.y); })
    .attr("width", function(d) {return x.rangeBand(d.x);});
    
    //redraw the text
    label.attr("x", function(d) { return x(d) + x.rangeBand(d) / 2; });
});