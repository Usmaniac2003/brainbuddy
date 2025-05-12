"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Calculator, Sparkles, Brain, Plus, Minus, X, Divide } from "lucide-react"

export default function VisualizePage() {
  const [expression, setExpression] = useState("2+3=5")
  const [data, setData] = useState(null)
  const [stage, setStage] = useState("idle")
  const [error, setError] = useState("")
  const [boxSize, setBoxSize] = useState(40)

  useEffect(() => {
    const updateSize = () => {
      const w = window.innerWidth
      if (w < 640)
        setBoxSize(30) // small screens
      else if (w < 1024)
        setBoxSize(40) // medium screens
      else setBoxSize(50) // large screens
    }
    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [])

  // Box sizing & spacing
  const GAP = 4 // px gap between all boxes
  const START_X = 20 // x-offset for the first box

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStage("idle")
    setError("")
    setData(null)

    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expression }),
      })

      const json = await res.json()

      if (json.error || json.limitation) {
        setError(json.error || json.limitation)
        return
      }

      setData(json)
      setStage("animating")
      setTimeout(() => setStage("result"), 1500)
    } catch (err) {
      setError("Failed to process the expression. Please try again.")
    }
  }

  // Get operation icon
  const getOperationIcon = (op) => {
    switch (op) {
      case "+":
        return <Plus className="h-6 w-6 text-yellow-300" />
      case "-":
        return <Minus className="h-6 w-6 text-yellow-300" />
      case "*":
        return <X className="h-6 w-6 text-yellow-300" />
      case "/":
        return <Divide className="h-6 w-6 text-yellow-300" />
      default:
        return null
    }
  }

  // Build visualization boxes based on operation
  const getVisualization = () => {
    if (!data) return { inputBoxes: [], resultBoxes: [] }

    const { a, b, op, result } = data
    const inputBoxes = []
    let resultBoxes = []

    switch (op) {
      case "+":
        // Addition: A boxes + B boxes
        for (let i = 0; i < a; i++) inputBoxes.push({ id: `a${i}`, color: "bg-purple-600" })
        for (let i = 0; i < b; i++) inputBoxes.push({ id: `b${i}`, color: "bg-purple-400" })
        resultBoxes = Array.from({ length: result }).map((_, i) => ({ id: `r${i}`, color: "bg-yellow-400" }))
        break

      case "-":
        // Subtraction: A boxes, with B boxes marked for removal
        for (let i = 0; i < a; i++) {
          if (i < a - b) {
            inputBoxes.push({ id: `a${i}`, color: "bg-purple-600" })
          } else {
            inputBoxes.push({ id: `a${i}`, color: "bg-red-500", remove: true })
          }
        }
        resultBoxes = Array.from({ length: result }).map((_, i) => ({ id: `r${i}`, color: "bg-yellow-400" }))
        break

      case "*":
        // Multiplication: A groups of B boxes each
        for (let group = 0; group < a; group++) {
          for (let i = 0; i < b; i++) {
            inputBoxes.push({
              id: `g${group}b${i}`,
              color: "bg-purple-600",
              groupId: group,
            })
          }
        }
        resultBoxes = Array.from({ length: result }).map((_, i) => ({ id: `r${i}`, color: "bg-yellow-400" }))
        break

      case "/":
        // Division: A boxes divided into B groups
        for (let i = 0; i < a; i++) {
          inputBoxes.push({
            id: `a${i}`,
            color: "bg-purple-600",
            groupId: Math.floor(i / (a / b)),
          })
        }
        resultBoxes = Array.from({ length: b }).map((_, i) => ({
          id: `r${i}`,
          color: "bg-yellow-400",
          count: result,
        }))
        break
    }

    return { inputBoxes, resultBoxes }
  }

  const { inputBoxes, resultBoxes } = data ? getVisualization() : { inputBoxes: [], resultBoxes: [] }

  // Position boxes based on operation
  const getBoxPosition = (box, index, isResult = false) => {
    const { op } = data || {}

    if (op === "*" && !isResult) {
      // For multiplication, arrange in groups
      const groupSize = data.b
      const groupId = box.groupId
      const posInGroup = index % groupSize
      const x = START_X + posInGroup * (boxSize + GAP)
      const y = 30 + groupId * (boxSize + GAP)
      return { x, y }
    } else if (op === "/" && !isResult) {
      // For division, arrange in groups
      const groupSize = Math.ceil(data.a / data.b)
      const groupId = box.groupId
      const posInGroup = index % groupSize
      const x = START_X + posInGroup * (boxSize + GAP)
      const y = 30 + groupId * (boxSize + GAP)
      return { x, y }
    } else if (op === "/" && isResult) {
      // For division result, show the quotient
      const x = START_X + index * (boxSize + GAP)
      const y = 60
      return { x, y }
    } else {
      // Default positioning in a single row
      const x = START_X + index * (boxSize + GAP)
      const y = 60
      return { x, y }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 flex flex-col">
      {/* Header */}
      <div className="bg-purple-800 border-b border-purple-700 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center text-yellow-300 hover:text-yellow-200 transition-colors">
            <ArrowLeft className="mr-2 h-5 w-5" />
            <span className="font-bold">Back to Home</span>
          </Link>
          <div className="flex items-center">
            <Calculator className="h-6 w-6 text-yellow-300 mr-2" />
            <h1 className="text-xl font-bold text-yellow-300">Learn & Visualize</h1>
          </div>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 flex flex-col">
        {/* Title and description */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-yellow-300 mb-2 flex items-center justify-center">
            <Sparkles className="h-6 w-6 mr-2" /> Math Visualizer <Sparkles className="h-6 w-6 ml-2" />
          </h1>
          <p className="text-yellow-100">Type a math equation and see it come to life with colorful blocks!</p>
          <p className="text-yellow-200 text-sm mt-2">Supports +, -, *, and / operations</p>
        </div>

        {/* Form */}
        <div className="bg-purple-800/50 rounded-3xl p-6 shadow-lg border-2 border-purple-700 mb-8">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              className="border-2 border-purple-600 bg-purple-700/50 text-yellow-100 px-4 py-3 rounded-xl flex-1 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300 text-lg placeholder-yellow-200/50"
              placeholder="e.g. 3+4=7, 5-2, 3*4, 10/2"
            />
            <button className="px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-purple-900 rounded-xl font-bold text-lg transition-colors shadow-[0_4px_0_rgba(0,0,0,0.2)] hover:shadow-[0_2px_0_rgba(0,0,0,0.2)] hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center">
              <Sparkles className="h-5 w-5 mr-2" /> Visualize
            </button>
          </form>

          {error && (
            <div className="mt-4 text-red-300 font-semibold bg-red-900/20 p-3 rounded-xl flex items-start">
              <span className="text-xl mr-2">⚠️</span>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Visualization area */}
        <div className="relative h-64 w-full bg-purple-900/50 border-2 border-purple-700 rounded-3xl overflow-hidden shadow-inner flex-1">
          {/* Character */}
          <div className="absolute top-4 right-4 w-16 h-16">
            <div className="w-16 h-16 rounded-full bg-yellow-300 flex items-center justify-center shadow-[0_0_10px_rgba(250,204,21,0.3)]">
              <div className="w-14 h-14 rounded-full bg-purple-700 flex items-center justify-center overflow-hidden">
                <Brain className="h-8 w-8 text-yellow-300" />
              </div>
            </div>
          </div>

          {/* Input boxes */}
          <AnimatePresence>
            {stage === "animating" &&
              inputBoxes.map((box, i) => {
                const { x, y } = getBoxPosition(box, i)
                return (
                  <motion.div
                    key={box.id}
                    initial={{ x, y, opacity: 1 }}
                    animate={{ x, y, opacity: box.remove ? 0 : 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className={`absolute rounded-lg ${box.color} shadow-md`}
                    style={{ width: boxSize, height: boxSize }}
                  />
                )
              })}
          </AnimatePresence>

          {/* Result boxes */}
          <AnimatePresence>
            {stage === "result" &&
              resultBoxes.map((box, i) => {
                const { x, y } = getBoxPosition(box, i, true)
                return (
                  <motion.div
                    key={box.id}
                    initial={{ scale: 0, x, y }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                    className={`absolute rounded-lg ${box.color} shadow-md flex items-center justify-center`}
                    style={{ width: boxSize, height: boxSize }}
                  >
                    {box.count && <span className="text-xs font-bold text-purple-900">{box.count}</span>}
                  </motion.div>
                )
              })}
          </AnimatePresence>

          {/* Operation symbol */}
          {stage === "result" && data && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute flex items-center justify-center"
              style={{
                top: 60,
                left: START_X + resultBoxes.length * (boxSize + GAP) + 20,
              }}
            >
              
            </motion.div>
          )}

          {/* Equals text */}
          {stage === "result" && data && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="absolute text-3xl font-bold text-yellow-300"
              style={{
                top: 60,
                left: START_X + resultBoxes.length * (boxSize + GAP) + 50,
              }}
            >
              = {data.result}
            </motion.div>
          )}

          {/* Instructions when idle */}
          {stage === "idle" && !data && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-yellow-200 px-4">
                <Sparkles className="h-8 w-8 mx-auto mb-2 text-yellow-300" />
                <p className="text-lg">Enter a math equation above and click "Visualize"</p>
                <p className="text-sm mt-2 text-yellow-300/70">Examples: 2+3=5, 5-2, 3*4, 10/2</p>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        {data && stage === "result" && (
          <div className="mt-6 bg-purple-800/50 p-4 rounded-xl border border-purple-700">
            <div className="flex flex-wrap gap-4 justify-center">
              {data.op === "+" && (
                <>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-purple-600 rounded-md mr-2"></div>
                    <span className="text-yellow-200">First number ({data.a})</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-purple-400 rounded-md mr-2"></div>
                    <span className="text-yellow-200">Second number ({data.b})</span>
                  </div>
                </>
              )}

              {data.op === "-" && (
                <>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-purple-600 rounded-md mr-2"></div>
                    <span className="text-yellow-200">Starting number ({data.a})</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-red-500 rounded-md mr-2"></div>
                    <span className="text-yellow-200">Subtracted number ({data.b})</span>
                  </div>
                </>
              )}

              {data.op === "*" && (
                <>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-purple-600 rounded-md mr-2"></div>
                    <span className="text-yellow-200">
                      {data.a} groups of {data.b}
                    </span>
                  </div>
                </>
              )}

              {data.op === "/" && (
                <>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-purple-600 rounded-md mr-2"></div>
                    <span className="text-yellow-200">
                      {data.a} divided into {data.b} groups
                    </span>
                  </div>
                </>
              )}

              <div className="flex items-center">
                <div className="w-6 h-6 bg-yellow-400 rounded-md mr-2"></div>
                <span className="text-yellow-200">Result ({data.result})</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
