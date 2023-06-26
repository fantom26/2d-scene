import { useEffect, useState } from "react";
import { fabric } from "fabric";

const RULER_SIZE = 50;
const SCENE_WIDTH = 1200;
const SCENE_HEIGTH = 700;

const doors = [
  {
    key: 1,
    count: 2,
    start: "0:0",
    end: "273:900",
    width: 273,
    height: 900,
    sections: [
      {
        key: "1.1",
        count: 2,
        direction: "vertical",
        start: "0:0",
        end: "136.5:900",
        width: 136.5,
        height: 900,
      },
      {
        key: "1.1.1",
        count: 0,
        direction: "vertical",
        start: "0:0",
        end: "68.25:900",
        width: 68.25,
        height: 900,
      },
      {
        key: "1.1.2",
        count: 0,
        direction: "vertical",
        start: "68.25:0",
        end: "136.5:900",
        width: 68.25,
        height: 900,
      },
      {
        key: "1.2",
        count: 0,
        direction: "vertical",
        start: "136.5:0",
        end: "273:900",
        width: 136.5,
        height: 900,
      },
    ],
    direction: "vertical",
  },
  {
    key: 2,
    count: 0,
    start: "0:0",
    end: "273:900",
    width: 273,
    height: 900,
    sections: [],
  },
];

export const App = () => {
  const [initialized, setInitialized] = useState(false);
  const [topRuler, setTopRuler] = useState();
  const [leftRuler, setLeftRuler] = useState();
  const [scene, setScene] = useState();

  const initCanvas = () => {
    setTopRuler(
      new fabric.StaticCanvas("top-ruler", {
        width: SCENE_WIDTH,
        height: RULER_SIZE,
      })
    );
    setLeftRuler(
      new fabric.StaticCanvas("left-ruler", {
        width: RULER_SIZE,
        height: SCENE_HEIGTH,
      })
    );
    setScene(
      new fabric.Canvas("main-canvas", {
        height: SCENE_HEIGTH,
        width: SCENE_WIDTH,
        originX: "left",
        originY: "bottom",
      })
    );
  };

  const redrawRulers = () => {
    drawRulers(scene, topRuler, leftRuler);
  };

  const drawRulers = (
    contentCanvas,
    horizontalRulerCanvas,
    verticalRulerCanvas
  ) => {
    let vpt = contentCanvas.viewportTransform;
    drawRuler(vpt, verticalRulerCanvas, true);
    drawRuler(vpt, horizontalRulerCanvas, false);
  };

  const drawRuler = (vpt, ruler, isVertical) => {
    ruler.renderOnAddRemove = false;

    ruler.clear();
    ruler.setBackgroundColor("white");

    let blockValueInvertMatrix = fabric.util.invertTransform(vpt);

    let offset = isVertical ? 1 : 0;
    let rulerThickness = isVertical ? ruler.width : ruler.height;
    let rulerSize = isVertical ? ruler.height : ruler.width;
    let pan = isVertical ? vpt[5] : vpt[4];
    let zoomLevel = vpt[3];

    let detailFactor =
      zoomLevel >= 1
        ? zoomLevel / Math.floor(zoomLevel)
        : zoomLevel * Math.floor(1 / zoomLevel);
    let blockRange = 50;
    let blockSize = blockRange * detailFactor;
    let blockOffset = pan % blockSize;

    let tickLength = rulerThickness / 2;
    let position = [0, 0, 0, 0];
    let ticksPerBlock = 10;

    for (let i = blockOffset - blockSize; i <= rulerSize; i += blockSize) {
      for (let tickIndex = 0; tickIndex < ticksPerBlock; ++tickIndex) {
        let tickPosition = i + (tickIndex * blockSize) / ticksPerBlock;
        let tickLengthFactor =
          tickIndex === 0 ? 1.5 : tickIndex === ticksPerBlock / 2 ? 1.25 : 1;

        position[0 + offset] = Math.round(tickPosition);
        position[1 - offset] = rulerThickness - tickLength * tickLengthFactor;
        position[2 + offset] = Math.round(tickPosition);
        position[3 - offset] = rulerThickness;

        let tick = new fabric.Line(position, {
          stroke: "black",
          strokeWidth: 1,
          objectCaching: true, // makes text clear, and the whole behavior more fluent
        });
        ruler.add(tick);
      }

      position[0 + offset] = Math.round(i); // text position on axis
      position[1 - offset] = 0; //text offset

      let blockPoint = fabric.util.transformPoint(
        {
          x: i,
          y: i,
        },
        blockValueInvertMatrix
      );

      let blockText = isVertical ? blockPoint.y : blockPoint.x;

      var blockLabel = new fabric.Text(Math.round(blockText).toString(), {
        left: position[0],
        top: position[1],
        fontSize: 10,
        objectCaching: false, // makes text clear, and the whole behavior more fluent
      });
      ruler.add(blockLabel);
    }

    ruler.requestRenderAll();
  };

  const renderDoors = (doors) => {
    doors.forEach(({ start, end, sections, width, height }) => {
      const groupsOfSections = [];

      sections.forEach(({ key, start, end, width, height }) => {
        console.log("start", start);
        console.log("end", end);
        groupsOfSections.push(
          new fabric.Textbox(key, {
            left: +start.split(":")[0],
            top: +end.split(":")[1],
            width: width,
            height: height,
            backgroundColor: "#b0e0e6",
            borderColor: "red",
          })
        );
      });

      const door = new fabric.Group(groupsOfSections, {
        left: +start.split(":")[0],
        top: +end.split(":")[1],
        width,
        height,
        backgroundColor: "#000",
      });

      console.log(door);

      scene.add(door);
    });
  };

  useEffect(() => {
    initCanvas();

    setInitialized(true);
  }, []);

  useEffect(() => {
    if (initialized) {
      redrawRulers();
      renderDoors(doors);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized]);

  return (
    <div className="grid">
      <div></div>
      <canvas id="top-ruler" />
      <canvas id="left-ruler" />
      <canvas id="main-canvas" width={SCENE_WIDTH} height={SCENE_HEIGTH} />
    </div>
  );
};
