// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength, padString) {
        targetLength = targetLength >> 0; //truncate if number, or convert non-number to 0;
        padString = String(typeof padString !== 'undefined' ? padString : ' ');
        if (this.length >= targetLength) {
            return String(this);
        } else {
            targetLength = targetLength - this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
            }
            return padString.slice(0, targetLength) + String(this);
        }
    };
}

function colorToHex(color, defaultColor){
  if(!color) color = defaultColor || "white"
  color = color+""
  var colors = {
    "aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#00ffff","aquamarine":"#7fffd4","azure":"#f0ffff",
    "beige":"#f5f5dc","bisque":"#ffe4c4","black":"#000000","blanchedalmond":"#ffebcd","blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a","burlywood":"#deb887",
    "cadetblue":"#5f9ea0","chartreuse":"#7fff00","chocolate":"#d2691e","coral":"#ff7f50","cornflowerblue":"#6495ed","cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff",
    "darkblue":"#00008b","darkcyan":"#008b8b","darkgoldenrod":"#b8860b","darkgray":"#a9a9a9","darkgreen":"#006400","darkkhaki":"#bdb76b","darkmagenta":"#8b008b","darkolivegreen":"#556b2f",
    "darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000","darksalmon":"#e9967a","darkseagreen":"#8fbc8f","darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkturquoise":"#00ced1",
    "darkviolet":"#9400d3","deeppink":"#ff1493","deepskyblue":"#00bfff","dimgray":"#696969","dodgerblue":"#1e90ff",
    "firebrick":"#b22222","floralwhite":"#fffaf0","forestgreen":"#228b22","fuchsia":"#ff00ff",
    "gainsboro":"#dcdcdc","ghostwhite":"#f8f8ff","gold":"#ffd700","goldenrod":"#daa520","gray":"#808080","green":"#008000","greenyellow":"#adff2f",
    "honeydew":"#f0fff0","hotpink":"#ff69b4",
    "indianred ":"#cd5c5c","indigo":"#4b0082","ivory":"#fffff0","khaki":"#f0e68c",
    "lavender":"#e6e6fa","lavenderblush":"#fff0f5","lawngreen":"#7cfc00","lemonchiffon":"#fffacd","lightblue":"#add8e6","lightcoral":"#f08080","lightcyan":"#e0ffff","lightgoldenrodyellow":"#fafad2",
    "lightgrey":"#d3d3d3","lightgreen":"#90ee90","lightpink":"#ffb6c1","lightsalmon":"#ffa07a","lightseagreen":"#20b2aa","lightskyblue":"#87cefa","lightslategray":"#778899","lightsteelblue":"#b0c4de",
    "lightyellow":"#ffffe0","lime":"#00ff00","limegreen":"#32cd32","linen":"#faf0e6",
    "magenta":"#ff00ff","maroon":"#800000","mediumaquamarine":"#66cdaa","mediumblue":"#0000cd","mediumorchid":"#ba55d3","mediumpurple":"#9370d8","mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee",
    "mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc","mediumvioletred":"#c71585","midnightblue":"#191970","mintcream":"#f5fffa","mistyrose":"#ffe4e1","moccasin":"#ffe4b5",
    "navajowhite":"#ffdead","navy":"#000080",
    "oldlace":"#fdf5e6","olive":"#808000","olivedrab":"#6b8e23","orange":"#ffa500","orangered":"#ff4500","orchid":"#da70d6",
    "palegoldenrod":"#eee8aa","palegreen":"#98fb98","paleturquoise":"#afeeee","palevioletred":"#d87093","papayawhip":"#ffefd5","peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd","powderblue":"#b0e0e6","purple":"#800080",
    "rebeccapurple":"#663399","red":"#ff0000","rosybrown":"#bc8f8f","royalblue":"#4169e1",
    "saddlebrown":"#8b4513","salmon":"#fa8072","sandybrown":"#f4a460","seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d","silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd","slategray":"#708090","snow":"#fffafa","springgreen":"#00ff7f","steelblue":"#4682b4",
    "tan":"#d2b48c","teal":"#008080","thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0",
    "violet":"#ee82ee",
    "wheat":"#f5deb3","white":"#ffffff","whitesmoke":"#f5f5f5",
    "yellow":"#ffff00","yellowgreen":"#9acd32"
  };

  if (typeof colors[color.toLowerCase()] != 'undefined') return colors[color.toLowerCase()].toUpperCase();

  color = color.toUpperCase()
  var r6 = /^#[0-9A-F]{6}$/i
  var r3 = /^#[0-9A-F]{3}$/i
  if(color.indexOf("#") !== 0){
    color = `#${color}`
  }
  if(!r6.test(color) && !r3.test(color)){
    return colorToHex(defaultColor)
  } else {
    if(r3.test(color)){
      color = color.replace(/^#?([A-F\d])([A-F\d])([A-F\d])$/i, (m, first, second, third) => `#${first}${first}${second}${second}${third}${third}`);
    }
    return color;
  }
}

function arraySwap(arr, x, y){
  if (x >= 0 && x < arr.length && y >= 0 && y < arr.length){
    var b = arr[x]; arr[x] = arr[y]; arr[y] = b;
  }
  return arr;
};

function getColor(color, intensity, mode, defaultColor, defaultIntensity){
  if(!mode || mode.length !=3 || mode.toLowerCase().indexOf('r') === -1 || mode.toLowerCase().indexOf('g') === -1 || mode.toLowerCase().indexOf('b') === -1) mode = 'rgb'
  mode = mode.toLowerCase()
  color = colorToHex(color, defaultColor)
  var _color = [
    color.substring(1,3),
    color.substring(3,5),
    color.substring(5,7)
  ]
  var _intensity = Number(parseInt(intensity, 10) || Number(parseInt(defaultIntensity, 10) || 100))
  if(_intensity>100) _intensity = 100;
  if(_intensity<0) _intensity = 0;
  _intensity = Math.round(_intensity*2.55).toString(16).padStart(2, "0").toUpperCase()

  switch (mode) {
    case 'rgb':
      break;
    case 'rbg':
      arraySwap(_color,1,2)
      break;
    case 'grb':
      arraySwap(_color,0,1)
      break;
    case 'gbr':
      arraySwap(_color,0,1)
      arraySwap(_color,1,2)
      break;
    case 'bgr':
      arraySwap(_color,0,2)
      break;
    case 'brg':
      arraySwap(_color,0,2)
      arraySwap(_color,1,2)
      break;
    default:
  }
  return `0x${_intensity}${_color[0]}${_color[1]}${_color[2]}`
}


function getOffsetHour(hour){
  var h = hour.split(':')
  var m = h[1]
  var h = h[0]

  var t = new Date()
  t.setHours(h)
  t.setMinutes(m)

  var difference = Math.round((t.getTime() - new Date().getTime()) / 60000);

  var sign = "+"
  if(difference < 0){
    sign = "-"
  }

  difference = Math.abs(difference)
  var hOffset = Math.floor(difference/60)
  var mOffset = difference%60
  var ghost = mOffset%15
  if(ghost !== 0){
    if(ghost > 7.5){
      mOffset = mOffset+(15-ghost)
    } else {
      mOffset = mOffset-ghost
    }
    if(mOffset === 60){
      mOffset = 0
      hOffset++
    }
  }

  hOffset = (""+hOffset).padStart(2, "0")
  mOffset = (""+mOffset).padStart(2, "0")
  return `${sign}${hOffset}:${mOffset}`
}


module.exports = {
  getColor: getColor,
  arraySwap: arraySwap,
  colorToHex: colorToHex,
  getOffsetHour: getOffsetHour
}
