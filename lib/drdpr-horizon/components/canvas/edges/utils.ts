import { Position, InternalNode } from '@xyflow/react';

// returns the position (top, right, bottom or left) of a point compared to a center point.
function getParams(nodeA: InternalNode, nodeB: InternalNode, forceTopBottom: boolean = false) {
  const centerA = getNodeCenter(nodeA);
  const centerB = getNodeCenter(nodeB);

  const horizontalDiff = Math.abs(centerA.x - centerB.x);
  const verticalDiff = Math.abs(centerA.y - centerB.y);

  let position;

  // when the nodes are higher than they are wide, switch to left/right instead of top/bottom
  if (!forceTopBottom && horizontalDiff > verticalDiff) {
    position = centerA.x > centerB.x ? Position.Left : Position.Right;
  } else {
    position = centerA.y > centerB.y ? Position.Top : Position.Bottom;
  }

  const [x, y] = getHandleCoordsByPosition(nodeA, position);
  return [x, y, position];
}

function getNodeCenter(node: InternalNode) {
  return {
    x: node.internals.positionAbsolute.x + (node.measured.width ?? 0) / 2,
    y: node.internals.positionAbsolute.y + (node.measured.height ?? 0) / 2,
  };
}

function getHandleCoordsByPosition(node: InternalNode, handlePosition: Position) {
  // all handles are center-aligned, so we only need the side to determine the coordinate
  let x = 0;
  let y = 0;

  switch (handlePosition) {
    case Position.Left:
      x = 0;
      y = (node.measured.height ?? 0) / 2;
      break;
    case Position.Right:
      x = node.measured.width ?? 0;
      y = (node.measured.height ?? 0) / 2;
      break;
    case Position.Top:
      x = (node.measured.width ?? 0) / 2;
      y = 0;
      break;
    case Position.Bottom:
      x = (node.measured.width ?? 0) / 2;
      y = node.measured.height ?? 0;
      break;
  }

  return [
    node.internals.positionAbsolute.x + x,
    node.internals.positionAbsolute.y + y,
  ];
}

export function getFloatingEdgeParams(source: InternalNode, target: InternalNode, forceTopBottom: boolean = false) {
  const [sx, sy, sourcePos] = getParams(source, target, forceTopBottom);
  const [tx, ty, targetPos] = getParams(target, source, forceTopBottom);

  return {
    sx,
    sy,
    tx,
    ty,
    sourcePos,
    targetPos,
  };
}
