import * as React from "react"

const dataOriginalKey =
  "data-original"

const getTextNode = node => {
  return node.querySelector(".ellipse-me") || node.childNodes[0]
}

// read once
const prepEllipse = node => {
  const txtToEllipse = getTextNode(node)

  if (txtToEllipse === null) {
    return {}
  }

  const attr = txtToEllipse.getAttribute(dataOriginalKey)

  if (attr === null) {
    txtToEllipse.setAttribute(dataOriginalKey, getText(txtToEllipse))
  }

  const checkSpan = createMeasurementDevice(txtToEllipse)

  // insert at the end
  node.insertBefore(checkSpan, null)

  return {
    checkSpan,
    txtToEllipse
  }
}

const createMeasurementDevice = node => {
  const checkSpan = document.createElement("span")

  checkSpan.style.fontSize = getComputedStyle(node).fontSize
  checkSpan.style.position = "absolute"
  checkSpan.style.visibility = "hidden"
  // required to not get in your mouse's way
  checkSpan.style.pointerEvents = "none"
  checkSpan.textContent = getText(node)
  return checkSpan
}

const syncStyles = (checkSpan, txtToEllipse) => {
  checkSpan.style.fontSize = getComputedStyle(txtToEllipse).fontSize
}

const ellipse = (checkSpan, txtToEllipse, paddingPerc) => {
  syncStyles(checkSpan, txtToEllipse)

  const fullWidth = checkSpan.offsetWidth
  const constrainedWidth = txtToEllipse.offsetWidth
  const str = txtToEllipse.getAttribute(dataOriginalKey)

  if (fullWidth > constrainedWidth) {
    const txtChars = str.length
    const paddingMultiplier = (100 + paddingPerc) / 100
    const avgLetterSize = (fullWidth / txtChars) * paddingMultiplier // 10% padding by default
    const canFit = constrainedWidth / avgLetterSize
    const delEachSide = (txtChars - canFit) / 2
    const endLeft = Math.floor(txtChars / 2 - delEachSide)
    const startRight = Math.ceil(txtChars / 2 + delEachSide)
    const ellipsed = str.substr(0, endLeft) + "..." + str.substr(startRight)

    setText(txtToEllipse, ellipsed)
  } else {
    // set back to original
    setText(txtToEllipse, str)
  }
}

const setText = (node, value) => {
  switch (node.tagName.toLowerCase()) {
    case "input":
      node.value = value
      break
    default:
      node.textContent = value
  }
}

const getText = node => {
  const value = node.getAttribute(dataOriginalKey)
  if (value != null) {
    return value
  }
  switch (node.tagName.toLowerCase()) {
    case "input":
      return node.value
    default:
      return node.textContent
  }
}

export default class ReactMiddleEllipsis extends React.Component {
  constructor(props) {
    super(props)
    this.ref = null
    this.doEllipsis = null
    this.childRefs = {}
  }
  render() {
    const { props } = this
    const measuredParent = node => {
      const { checkSpan } = this.childRefs

      if (node === null) {
        return
      } else if (this.doEllipsis) {
        window.removeEventListener("resize", this.doEllipsis)
        if (checkSpan && checkSpan.parentNode) {
          checkSpan.parentNode.removeChild(checkSpan)
        }
      }
      if (props.disabled) {
        const txtToEllipse = getTextNode(node)
        const value = txtToEllipse.getAttribute(dataOriginalKey)

        if (value !== null) {
          setText(txtToEllipse, value)
        }
        return
      }
      this.doEllipsis = () => ellipse(
        this.childRefs.checkSpan,
        this.childRefs.txtToEllipse,
        props.paddingPerc == null ? 10 : props.paddingPerc,
      )
      this.ref = node
      this.childRefs = prepEllipse(node)
      window.addEventListener("resize", this.doEllipsis)
      this.doEllipsis()
    }

    return (
      <div
        ref={measuredParent}
        style={{
          wordBreak: "keep-all",
          overflowWrap: "normal",
          overflow: "hidden",
          position: "relative", // required to disallow overflow
          ...(props.width && { width: props.width })
        }}
      >
        {props.children}
      </div>
    )
  }
}
