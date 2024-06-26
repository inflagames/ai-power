const fs = require("fs");

/**
 * This script generate the models used in the application given the svg
 */

if (process.argv.length > 2) {
  const filePath = process.argv[2];
  const resultFile = process.argv[3] || "character.json";

  generateShapes(filePath, resultFile);
} else {
  fs.readdirSync("./files").forEach(file => {
    if (file.endsWith(".model.svg")) {
      console.log("Generating shapes for", file);
      generateShapes(`./files/${file}`, `./src/game/shapes/${file.replace(".model.svg", ".json")}`);
    }
  });
}

function generateShapes(filePath, resultFile) {
  const file = fs.readFileSync(filePath, { encoding: "utf8" });

  fs.writeFileSync(resultFile, JSON.stringify(extractPath(file), null, "  "));
}


function extractPath(file) {
  let a = 0, b = 0;

  const paths = [];

  while (true) {
    a = file.indexOf("<path", b);
    if (a === -1) {
      break;
    }
    b = file.indexOf(">", a);
    paths.push(cleanPath(file.substring(a, b + 1)));
  }

  const shapes = [];

  for (const p of paths) {
    const values = new Map();
    let subs = "", value = false, key = "";
    for (let i = 5; i < p.length; i++) {
      if (p[i] === " " && !value) {
        continue;
      }
      if (p[i] === "=" && !value) {
        key = subs;
        subs = "";
        value = true;
        i += 2;
      } else if (value && p[i] === "\"") {
        values.set(key, subs);
        value = false;
        subs = "";
        continue;
      }
      subs += p[i];
    }

    const stroke = getStyle(values.get("style"), "stroke");
    const strokeWidth = getStyle(values.get("style"), "stroke-width");

    shapes.push({
      id: values.get("inkscape:label") || values.get("id"),
      background: getBackground(values.get("style")),
      ...(Boolean(stroke) && Boolean(strokeWidth && stroke !== "none") ? { stroke, strokeWidth: +strokeWidth } : {}),
      points: extractMesh(values.get("d"))
    });
  }

  // parametrize the shapes
  let min = { ...shapes[0].points[0] };
  let max = { ...shapes[0].points[0] };
  for (let s of shapes) {
    for (let p of s.points) {
      if (p.x < min.x) {
        min.x = p.x;
      }
      if (p.y < min.y) {
        min.y = p.y;
      }
      if (p.x > max.x) {
        max.x = p.x;
      }
      if (p.y > max.y) {
        max.y = p.y;
      }
    }
  }

  const size = 50;
  let maxV = Math.max(max.x - min.x, max.y - min.y);

  for (let s of shapes) {
    for (let p of s.points) {
      // move to 0 scale
      p.x -= min.x;
      p.y -= min.y;

      // parametrize the shapes
      p.x = p.x / maxV * size - size / 2;
      p.y = p.y / maxV * size - size / 2;
    }
  }

  return {
    shapes
  };
}

function getBackground(style) {
  const fill = getStyle(style, "fill");
  const fillOpacity = getOpacity(getStyle(style, "fill-opacity"));

  return fill + (fillOpacity.length === 2 ? "" : "0") + fillOpacity
}

/**
 * @param colorScalar {number} value between 0 and 1
 * @returns {string} hexadecimal color
 */
function getOpacity(colorScalar) {
  if (!colorScalar) {
    return "ff";
  }
  return Math.round(colorScalar * 255).toString(16);
}

function getStyle(style, property) {
  style = style.replace(/\s*/g, "");
  const pp = style.split(";");
  const properties = new Map();
  for (let p of pp) {
    if (p.length > 0) {
      const s = p.split(":");
      properties.set(s[0], s[1]);
    }
  }
  return properties.get(property);
}

function cleanPath(p) {
  return p.replace(/\n/g, "").replace(/\s+/g, " ");
}

function extractMesh(d) {
  const values = d.split(" ");
  const points = [];
  for (let i = 0; i < values.length;) {
    let sn = [];
    let lp = points.length > 0 ? points[points.length - 1] : null;
    const op = values[i];
    switch (values[i]) {
    case "l":
    case "L":
    case "M":
    case "m": {
      // line to; todo: this can be improve
      // move to
      i++;
      sn = [];
      while (/^-?\d.*/.test(values[i])) {
        sn = [...sn, ...getPoint(values[i])];
        if (sn.length === 2) {
          if (op === "M" || op === "L" || !lp) {
            points.push({ x: sn[0], y: sn[1] });
          } else {
            points.push({ x: lp.x + sn[0], y: lp.y + sn[1] });
          }
          sn = [];
        }
        lp = points.length > 0 ? points[points.length - 1] : null;
        i++;
      }
      break;
    }
    case "z":
    case "Z":
      // close curve
      i++;
      break;
    case "h":
    case "H": {
      // horizontal movement
      i++;
      sn = getPoint(values[i]);
      points.push({ x: sn[0] + (op === "h" ? lp.x : 0), y: lp.y });
      break;
    }
    case "v":
    case "V": {
      // vertical movement
      i++;
      sn = getPoint(values[i]);
      points.push({ x: lp.x, y: sn[0] + (op === "v" ? lp.y : 0) });
      break;
    }
    case "C":
    case "c":
    case "S":
    case "s":
    case "Q":
    case "q":
    case "T":
    case "t":
      // curves, not implemented
      i++;
      break;
    case "A":
    case "a":
      // elliptical arc, not implemented
      i++;
      break;
    default:
      // consume
      i++;
    }
  }
  return points.map(p => ({ x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10 }));
}

function getPoint(text) {
  if (text.includes(",")) {
    const subr = text.split(",");
    return [+subr[0], +subr[1]];
  }
  return [+text];
}
