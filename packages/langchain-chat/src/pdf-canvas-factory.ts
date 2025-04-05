import { Canvas, CanvasRenderingContext2D, createCanvas } from 'canvas'

interface CanvasAndContext {
  canvas: Canvas | null
  context: CanvasRenderingContext2D | null
}

class BaseCanvasFactory {
  constructor() {}
  create(width: number, height: number) {
    if (width <= 0 || height <= 0) {
      throw new Error('Invalid canvas size')
    }
    const canvas = this._createCanvas(width, height)
    return {
      canvas,
      context: canvas.getContext('2d', {}),
    }
  }
  reset(canvasAndContext: CanvasAndContext, width: number, height: number) {
    if (!canvasAndContext.canvas) {
      throw new Error('Canvas is not specified')
    }
    if (width <= 0 || height <= 0) {
      throw new Error('Invalid canvas size')
    }
    canvasAndContext.canvas.width = width
    canvasAndContext.canvas.height = height
  }
  destroy(canvasAndContext: CanvasAndContext) {
    if (!canvasAndContext.canvas) {
      throw new Error('Canvas is not specified')
    }
    canvasAndContext.canvas.width = 0
    canvasAndContext.canvas.height = 0
    canvasAndContext.canvas = null
    canvasAndContext.context = null
  }
  _createCanvas(width: number, height: number): Canvas {
    throw new Error(`Abstract method _createCanvas called with ${width}, ${height}`)
  }
}

export class NodeCanvasFactory extends BaseCanvasFactory {
  _createCanvas(width: number, height: number) {
    const canvas = createCanvas(width, height)

    return canvas
  }
}
