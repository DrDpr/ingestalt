import { InternalNode, Position } from '@xyflow/react';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Point {
  x: number;
  y: number;
}

interface NodePoint extends Point {
  g: number;
  f: number;
  parent?: NodePoint;
}

const PADDING = 40; // Increased padding to prevent hugging
const HANDLE_EXTENSION = 30; // Force path out from handles

function getBoundingBox(node: InternalNode): Rect {
  return {
    x: node.internals.positionAbsolute.x - PADDING,
    y: node.internals.positionAbsolute.y - PADDING,
    width: (node.measured.width ?? 0) + PADDING * 2,
    height: (node.measured.height ?? 0) + PADDING * 2,
  };
}

function isLineIntersectingRect(p1: Point, p2: Point, rect: Rect): boolean {
  if (p1.x === p2.x) {
    const minY = Math.min(p1.y, p2.y);
    const maxY = Math.max(p1.y, p2.y);
    return (
      p1.x > rect.x &&
      p1.x < rect.x + rect.width &&
      maxY > rect.y &&
      minY < rect.y + rect.height
    );
  } else if (p1.y === p2.y) {
    const minX = Math.min(p1.x, p2.x);
    const maxX = Math.max(p1.x, p2.x);
    return (
      p1.y > rect.y &&
      p1.y < rect.y + rect.height &&
      maxX > rect.x &&
      minX < rect.x + rect.width
    );
  }
  return false;
}

export function getSmartPath({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePos,
  targetPos,
  nodes,
  sourceId,
  targetId,
}: {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePos: Position;
  targetPos: Position;
  nodes: InternalNode[];
  sourceId: string;
  targetId: string;
}): [string, number, number] {
  const obstacles = nodes
    .filter((n) => n.id !== sourceId && n.id !== targetId)
    .map(getBoundingBox);

  // 1. Calculate extended start/end points to ensure straight exits from handles
  const sExt = { x: sourceX, y: sourceY };
  if (sourcePos === Position.Left) sExt.x -= HANDLE_EXTENSION;
  else if (sourcePos === Position.Right) sExt.x += HANDLE_EXTENSION;
  else if (sourcePos === Position.Top) sExt.y -= HANDLE_EXTENSION;
  else if (sourcePos === Position.Bottom) sExt.y += HANDLE_EXTENSION;

  const tExt = { x: targetX, y: targetY };
  if (targetPos === Position.Left) tExt.x -= HANDLE_EXTENSION;
  else if (targetPos === Position.Right) tExt.x += HANDLE_EXTENSION;
  else if (targetPos === Position.Top) tExt.y -= HANDLE_EXTENSION;
  else if (targetPos === Position.Bottom) tExt.y += HANDLE_EXTENSION;

  // 2. Generate grid coordinates
  const xCoords = new Set([sourceX, targetX, sExt.x, tExt.x]);
  const yCoords = new Set([sourceY, targetY, sExt.y, tExt.y]);

  obstacles.forEach((rect) => {
    xCoords.add(rect.x);
    xCoords.add(rect.x + rect.width);
    yCoords.add(rect.y);
    yCoords.add(rect.y + rect.height);
    // Add middle points to encourage corridor centering
    xCoords.add(rect.x + rect.width / 2);
    yCoords.add(rect.y + rect.height / 2);
  });

  const sortedX = Array.from(xCoords).sort((a, b) => a - b);
  const sortedY = Array.from(yCoords).sort((a, b) => a - b);

  // 3. A* Search
  const start: NodePoint = { x: sExt.x, y: sExt.y, g: 0, f: 0 };
  const openList: NodePoint[] = [start];
  const closedList = new Set<string>();

  const getHeuristic = (p: Point) => Math.abs(p.x - tExt.x) + Math.abs(p.y - tExt.y);

  while (openList.length > 0) {
    openList.sort((a, b) => a.f - b.f);
    const current = openList.shift()!;
    const currentKey = `${current.x},${current.y}`;

    if (Math.abs(current.x - tExt.x) < 1 && Math.abs(current.y - tExt.y) < 1) {
      const path: Point[] = [{ x: targetX, y: targetY }];
      let temp: NodePoint | undefined = current;
      while (temp) {
        path.unshift({ x: temp.x, y: temp.y });
        temp = temp.parent;
      }
      path.unshift({ x: sourceX, y: sourceY });
      return [generatePathString(path), (sourceX + targetX) / 2, (sourceY + targetY) / 2];
    }

    closedList.add(currentKey);

    const neighbors: Point[] = [];
    const xi = sortedX.indexOf(current.x);
    const yi = sortedY.indexOf(current.y);

    if (xi > 0) neighbors.push({ x: sortedX[xi - 1], y: current.y });
    if (xi < sortedX.length - 1) neighbors.push({ x: sortedX[xi + 1], y: current.y });
    if (yi > 0) neighbors.push({ x: current.x, y: sortedY[yi - 1] });
    if (yi < sortedY.length - 1) neighbors.push({ x: current.x, y: sortedY[yi + 1] });

    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.x},${neighbor.y}`;
      if (closedList.has(neighborKey)) continue;

      if (obstacles.some((rect) => isLineIntersectingRect(current, neighbor, rect))) {
        continue;
      }

      const dist = Math.abs(current.x - neighbor.x) + Math.abs(current.y - neighbor.y);
      const isTurn = current.parent && !(
        (current.parent.x === current.x && current.x === neighbor.x) ||
        (current.parent.y === current.y && current.y === neighbor.y)
      );
      
      // Proximity penalty: check if we are on the edge of any obstacle
      let proximityPenalty = 0;
      obstacles.forEach(rect => {
        const onEdgeX = Math.abs(neighbor.x - rect.x) < 1 || Math.abs(neighbor.x - (rect.x + rect.width)) < 1;
        const onEdgeY = Math.abs(neighbor.y - rect.y) < 1 || Math.abs(neighbor.y - (rect.y + rect.height)) < 1;
        if (onEdgeX || onEdgeY) proximityPenalty += 100; // Strong penalty for hugging edges
      });

      const g = current.g + dist + (isTurn ? 150 : 0) + proximityPenalty;
      const h = getHeuristic(neighbor);
      const f = g + h;

      const existing = openList.find((o) => o.x === neighbor.x && o.y === neighbor.y);
      if (existing) {
        if (g < existing.g) {
          existing.g = g;
          existing.f = f;
          existing.parent = current;
        }
      } else {
        openList.push({ ...neighbor, g, f, parent: current });
      }
    }
  }

  return [`M ${sourceX} ${sourceY} L ${targetX} ${targetY}`, (sourceX + targetX) / 2, (sourceY + targetY) / 2];
}

function generatePathString(points: Point[]): string {
  if (points.length < 2) return '';
  
  const simplified: Point[] = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const prev = simplified[simplified.length - 1];
    const curr = points[i];
    const next = points[i + 1];
    const isHorizontal = Math.abs(prev.y - curr.y) < 1 && Math.abs(curr.y - next.y) < 1;
    const isVertical = Math.abs(prev.x - curr.x) < 1 && Math.abs(curr.x - next.x) < 1;
    if (!isHorizontal && !isVertical) simplified.push(curr);
  }
  simplified.push(points[points.length - 1]);

  let path = `M ${simplified[0].x} ${simplified[0].y}`;
  const borderRadius = 12; // Slightly larger for smoother look

  for (let i = 1; i < simplified.length; i++) {
    const prev = simplified[i - 1];
    const curr = simplified[i];
    const next = simplified[i + 1];

    if (next && borderRadius > 0) {
      const distToCurr = Math.sqrt((curr.x - prev.x) ** 2 + (curr.y - prev.y) ** 2);
      const distToNext = Math.sqrt((next.x - curr.x) ** 2 + (next.y - curr.y) ** 2);
      const actualRadius = Math.min(borderRadius, distToCurr / 2, distToNext / 2);

      const x1 = curr.x - (actualRadius * (curr.x - prev.x)) / distToCurr;
      const y1 = curr.y - (actualRadius * (curr.y - prev.y)) / distToCurr;
      const x2 = curr.x + (actualRadius * (next.x - curr.x)) / distToNext;
      const y2 = curr.y + (actualRadius * (next.y - curr.y)) / distToNext;

      path += ` L ${x1} ${y1} Q ${curr.x} ${curr.y} ${x2} ${y2}`;
    } else {
      path += ` L ${curr.x} ${curr.y}`;
    }
  }

  return path;
}
