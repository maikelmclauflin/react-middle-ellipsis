import * as React from "react";

const dataOriginalKey =
  "data-original";

const getTextNode = node => {
  return node.querySelector(".ellipse-me") || node.childNodes[0];
};

// read once
const prepEllipse = node => {
  const child =
    node.childNodes[0];
  const txtToEllipse =
    node.querySelector(".ellipse-me") || child;

  if (txtToEllipse === null) {
    return {};
  }

  const attr =
    txtToEllipse.getAttribute(dataOriginalKey);

  if (attr === null) {
    txtToEllipse.setAttribute(dataOriginalKey, getText(txtToEllipse));
  }

  const checkSpan =
    document.createElement("span");

  // insert at end
  checkSpan.style.fontSize = getComputedStyle(txtToEllipse).fontSize;
  checkSpan.style.position = "absolute";
  checkSpan.style.visibility = "hidden";
  checkSpan.style.pointerEvents = "none";
  checkSpan.textContent = getText(txtToEllipse);

  node.insertBefore(checkSpan, null);

  return {
    checkSpan,
    txtToEllipse
  };
};

const ellipse = (checkSpan, txtToEllipse) => {
  checkSpan.style.fontSize = getComputedStyle(txtToEllipse).fontSize;

  const fullWidth = checkSpan.offsetWidth;
  const constrainedWidth = txtToEllipse.offsetWidth;
  const str = txtToEllipse.getAttribute(dataOriginalKey);

  if (fullWidth > constrainedWidth) {
    const txtChars = str.length;
    const avgLetterSize = (fullWidth / txtChars) * 1.1;
    const canFit = constrainedWidth / avgLetterSize;
    const delEachSide = (txtChars - canFit) / 2;
    const endLeft = Math.floor(txtChars / 2 - delEachSide);
    const startRight = Math.ceil(txtChars / 2 + delEachSide);

    setText(txtToEllipse, str.substr(0, endLeft) + "..." + str.substr(startRight));
  } else {
    // set back to original
    setText(txtToEllipse, str);
  }
};

const setText = (node, value) => {
  switch (node.tagName.toLowerCase()) {
    case "input":
      node.value = value;
      break;
    default:
      node.textContent = value;
  }
};

const getText = node => {
  switch (node.tagName.toLowerCase()) {
    case "input":
      return node.value;
    default:
      return node.textContent;
  }
};

export default class Component extends React.Component {
  constructor(props) {
    super(props);
    this.ref = null;
    this.prepRelease = null;
    this.childRefs = {};
  }
  render() {
    const { props } = this;
    const measuredParent = node => {
      const { checkSpan } =
        this.childRefs;

      if (node === null) {
        return;
      } else if (this.prepRelease) {
        window.removeEventListener("resize", this.prepRelease);
        if (checkSpan) {
          checkSpan.parentNode.removeChild(checkSpan);
        }
      }
      if (props.hasOwnProperty("disabled")) {
        const txtToEllipse =
          getTextNode(node);
        const value =
          txtToEllipse.getAttribute(dataOriginalKey);

        if (value !== null) {
          setText(txtToEllipse, value);
        }
        return;
      }
      this.prepRelease = () => ellipse(
        this.childRefs.checkSpan,
        this.childRefs.txtToEllipse
      );
      this.ref = node;
      this.childRefs = prepEllipse(node);
      window.addEventListener("resize", this.prepRelease);
      this.prepRelease();
    };

    return (
      <div
        ref={measuredParent}
        style={{
          wordBreak: "keep-all",
          overflowWrap: "normal",
          overflow: "hidden",
          position: "relative",
          ...(props.width && { width: props.width })
        }}
      >
        {props.children}
      </div>
    );
  }
}
